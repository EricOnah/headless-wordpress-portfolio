const allowedTypes = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/avif",
  "image/x-icon", "image/vnd.microsoft.icon", "application/pdf",
]);

type Context = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, { params }: Context) {
  const { path } = await params;
  if (!path || path.length < 3 || path.length > 8 ||
      path.some(segment => segment === "." || segment === ".." || !/^[\p{L}\p{N}_. -]+$/u.test(segment)) ||
      !/\.(jpe?g|png|webp|gif|avif|ico|pdf)$/i.test(path[path.length - 1])) {
    return new Response("Not found", { status: 404 });
  }
  // Only publicly uploaded files are forwarded; never arbitrary URLs or admin routes.
  const base = (process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
    "http://wordpress-portfolio.ddev.site").replace(/\/wp-json\/?$/, "");
  try {
    const url = new URL("/app/uploads/" + path.map(encodeURIComponent).join("/"), base);
    const response = await fetch(url, {
      method: request.method === "HEAD" ? "HEAD" : "GET",
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return new Response("Media not found", { status: response.status === 404 ? 404 : 502 });
    const type = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() || "";
    if (!allowedTypes.has(type)) return new Response("Unsupported media", { status: 415 });
    return new Response(request.method === "HEAD" ? null : response.body, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Media temporarily unavailable", { status: 502 });
  }
}

export const HEAD = GET;
