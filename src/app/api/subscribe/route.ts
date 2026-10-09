import { isIP } from "node:net";
export const runtime = "nodejs";
const attempts = new Map<string, { count: number; expires: number }>();
function reply(status: number, error?: string) { return Response.json(error ? { ok: false, error } : { ok: true }, { status, headers: { "Cache-Control": "no-store" } }); }
export async function POST(request: Request) {
  const candidate = process.env.VERCEL === "1" ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() : undefined;
  const ip = candidate && isIP(candidate) ? candidate : "unknown";
  const now = Date.now();
  for (const [key, value] of attempts) if (value.expires <= now) attempts.delete(key);
  if (!attempts.has(ip) && attempts.size >= 10000) return reply(429, "Please try again later.");
  const entry = attempts.get(ip) || { count: 0, expires: now + 600000 };
  attempts.set(ip, entry); entry.count++;
  if (entry.count > 10) return reply(429, "Too many attempts. Please try again later.");
  if (request.headers.get("sec-fetch-site") === "cross-site" || (request.headers.get("origin") && request.headers.get("origin") !== new URL(request.url).origin)) return reply(403, "This request is not allowed.");
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return reply(415, "Please use the subscription form.");
  let body: Record<string, unknown>;
  try {
    const reader = request.body?.getReader(); if (!reader) return reply(400, "Invalid request.");
    let size = 0; const chunks: Uint8Array[] = [];
    try {
      while (true) { const result = await reader.read(); if (result.done) break; size += result.value.length; if (size > 8192) { await reader.cancel(); return reply(413, "Request too large."); } chunks.push(result.value); }
    } finally { reader.releaseLock(); }
    const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return reply(400, "Invalid request.");
    body = parsed;
  } catch { return reply(400, "Invalid request."); }
  const action = body.action;
  if (typeof action !== "string" || !["request", "confirm", "unsubscribe"].includes(action)) return reply(400, "Invalid request.");
  if (action === "request" && body.companyWebsite !== undefined && body.companyWebsite !== "") return reply(200);
  if (action === "request") {
    if (typeof body.email !== "string" || body.email.length > 254 || !/^[^\s@<>\x00-\x1f\x7f]+@[^\s@<>]+\.[^\s@<>]+$/.test(body.email.trim()) || body.consent !== true) return reply(400, "Enter a valid email and agree to receive post updates.");
    const secret = process.env.TURNSTILE_SECRET_KEY;
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (secret || siteKey) {
      if (!secret || !siteKey) return reply(503, "Subscriptions are temporarily unavailable.");
      if (typeof body.turnstileToken !== "string" || !body.turnstileToken || body.turnstileToken.length > 2048) return reply(400, "Please complete the security check.");
      try {
        const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ secret, response: body.turnstileToken, ...(ip !== "unknown" ? { remoteip: ip } : {}) }), signal: AbortSignal.timeout(8000) });
        if (!response.ok) throw new Error();
        const verification = await response.json();
        if (verification.success !== true || verification.action !== "subscribe" || verification.hostname !== new URL(request.url).hostname) return reply(400, "Security check failed. Please try again.");
      } catch { return reply(503, "Security check is temporarily unavailable."); }
    }
  } else if (typeof body.token !== "string" || body.token.length > 200 || !/^[A-Za-z0-9.-]+$/.test(body.token)) return reply(400, "This link is invalid. Request a new subscription email.");
  const secret = process.env.SUBSCRIPTIONS_API_SECRET;
  const base = (process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "").replace(/\/$/, "").replace(/\/wp-json$/, "");
  if (!secret || secret.length < 32 || !base) return reply(503, "Subscriptions are temporarily unavailable.");
  try {
    const response = await fetch(`${base}/?rest_route=/portfolio/v1/subscriptions/${action}`, { method: "POST", cache: "no-store", headers: { "Authorization": `Bearer ${secret}`, "Content-Type": "application/json" }, body: JSON.stringify(action === "request" ? { email: String(body.email).trim(), consent: true, client: ip } : { token: body.token }), signal: AbortSignal.timeout(20000) });
    if (!response.ok) return reply(response.status === 400 ? 400 : response.status === 429 ? 429 : 503, response.status === 400 ? "This link or email is invalid or expired. Please request a new confirmation email." : response.status === 429 ? "Too many requests. Please try again later." : "Subscriptions are temporarily unavailable. Please try again.");
    return reply(200);
  } catch { return reply(503, "Subscriptions are temporarily unavailable. Please try again."); }
}
