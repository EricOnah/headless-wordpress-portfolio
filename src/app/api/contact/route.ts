import nodemailer from "nodemailer";
import { isIP } from "node:net";
import { CONTACT_PROJECT_TYPES } from "@/lib/contact-options";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 32_768;
const WINDOW_MS = 10 * 60 * 1000;
// Best effort per process. Use Vercel Firewall for a shared production limit.
const attempts = new Map<string, { count: number; expires: number }>();

function reply(status: number, error?: string, headers?: Record<string, string>) {
  return Response.json(error ? { ok: false, error } : { ok: true }, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

function clientIp(request: Request) {
  // Trust only the platform-provided IP when deployed on Vercel.
  if (process.env.VERCEL !== "1") return undefined;
  const ip = request.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim();
  return ip && isIP(ip) ? ip : undefined;
}

function rateLimit(ip: string) {
  const now = Date.now();
  for (const [key, entry] of attempts) {
    if (entry.expires <= now) attempts.delete(key);
  }
  let entry = attempts.get(ip);
  if (!entry) {
    if (attempts.size >= 10_000) return 60;
    entry = { count: 0, expires: now + WINDOW_MS };
    attempts.set(ip, entry);
  }
  entry.count += 1;
  return entry.count > 5 ? Math.ceil((entry.expires - now) / 1000) : 0;
}

async function readBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Invalid JSON");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new RangeError("Body too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

function hasControlCharacters(value: string, multiline = false) {
  return Array.from(value).some(character => {
    const code = character.charCodeAt(0);
    return code === 127 || (code < 32 && !(multiline && [9, 10, 13].includes(code)));
  });
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const retryAfter = rateLimit(ip ?? "unknown");
  if (retryAfter) {
    return reply(429, "Too many attempts. Please try again later.", {
      "Retry-After": String(retryAfter),
    });
  }

  const origin = request.headers.get("origin");
  if (request.headers.get("sec-fetch-site") === "cross-site" ||
      (origin && origin !== new URL(request.url).origin)) {
    return reply(403, "This submission is not allowed.");
  }
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return reply(415, "Please submit the contact form as JSON.");
  }
  const length = Number(request.headers.get("content-length"));
  if (Number.isFinite(length) && length > MAX_BODY_BYTES) {
    return reply(413, "Your message is too large.");
  }

  let parsed: unknown;
  try {
    parsed = await readBody(request);
  } catch (error) {
    return error instanceof RangeError
      ? reply(413, "Your message is too large.")
      : reply(400, "Invalid form submission.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return reply(400, "Invalid form submission.");
  }
  const body = parsed as Record<string, unknown>;
  // Pretend to accept bot submissions without contacting SMTP.
  if (body.companyWebsite !== undefined && body.companyWebsite !== "") {
    return reply(200);
  }
  const limits = { name: 100, email: 254, projectType: 100, details: 5000 };
  const fields: Record<string, string> = {};
  for (const [field, limit] of Object.entries(limits)) {
    const value = body[field];
    if (typeof value !== "string" || !value.trim() || value.length > limit) {
      return reply(400, "Please complete all fields within the allowed length.");
    }
    fields[field] = value.trim();
  }
  const { name, email, projectType, details } = fields;
  const [localPart, domain = ""] = email.split("@");
  if (hasControlCharacters(name + email + projectType) ||
      hasControlCharacters(details, true) ||
      !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/.test(email) ||
      localPart.length > 64 || localPart.startsWith(".") || localPart.endsWith(".") ||
      localPart.includes("..") || domain.split(".").some(label => label.length > 63) ||
      !CONTACT_PROJECT_TYPES.some(option => option === projectType)) {
    return reply(400, "Please enter a valid email, name, and project type.");
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (secret || siteKey) {
    if (!secret || !siteKey) {
      console.error("[contact form] incomplete Turnstile configuration");
      return reply(503, "The contact form is temporarily unavailable. Please email me directly.");
    }
    if (typeof body.turnstileToken !== "string" || !body.turnstileToken || body.turnstileToken.length > 2048) {
      return reply(400, "Please complete the security check.");
    }
    try {
      const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, response: body.turnstileToken, remoteip: ip }),
        signal: AbortSignal.timeout(8000),
      });
      if (!verification.ok) throw new Error("Verification service unavailable");
      const result = await verification.json();
      if (result.success !== true || result.action !== "contact" ||
          result.hostname !== new URL(request.url).hostname) {
        return reply(400, "Security check failed. Please try again.");
      }
    } catch {
      console.error("[contact form] security verification unavailable");
      return reply(503, "Security check is temporarily unavailable. Please try again.");
    }
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !user || !pass) {
    console.error("[contact form] SMTP configuration missing or invalid");
    return reply(503, "The contact form is temporarily unavailable. Please email me directly.");
  }
  const transport = nodemailer.createTransport({
    host, port, secure: port === 465, auth: { user, pass },
    connectionTimeout: 10_000, greetingTimeout: 8_000, socketTimeout: 12_000,
    tls: { minVersion: "TLSv1.2" }, logger: false, debug: false,
  });
  try {
    await transport.sendMail({
      from: { name: "Portfolio Contact", address: user },
      replyTo: { address: email },
      to: process.env.CONTACT_TO ?? "ericdavid4u@gmail.com",
      subject: `New contact form submission: ${projectType}`,
      text: `Name: ${name}\nEmail: ${email}\nProject type: ${projectType}\n\nDetails:\n${details}`,
    });
    return reply(200);
  } catch (error) {
    // Never log submitted content, credentials, or return transport internals.
    console.error("[contact form] mail delivery failed", {
      code: (error as { code?: string })?.code ?? "unknown",
    });
    return reply(502, "Unable to send message. Please try again or email me directly.");
  } finally {
    transport.close();
  }
}
