/**
 * Local WordPress uploads use the frontend media route for phone previews.
 * Other browser-facing WordPress files use HTTPS even when server-side API requests
 * use an internal HTTP endpoint. Local files and unrelated external URLs stay intact.
 */
export function secureWordPressMediaUrl(value: string): string {
  if (!value || value.startsWith("/")) return value;
  try {
    const url = new URL(value);
    if (url.hostname === "wordpress-portfolio.ddev.site" && url.pathname.startsWith("/app/uploads/")) {
      return "/api/wordpress-media/" + url.pathname.slice("/app/uploads/".length);
    }
    if (url.protocol !== "http:") return value;
    const api = process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
    const cmsHost = api ? new URL(api).hostname : "";
    const isLocalCms = url.hostname === "wordpress-portfolio.ddev.site";
    const isConfiguredCms = url.hostname === cmsHost &&
      !["localhost", "127.0.0.1", "[::1]"].includes(cmsHost);
    if (isLocalCms || isConfiguredCms) {
      url.protocol = "https:";
      // The public HTTPS endpoint uses the standard TLS port.
      if (url.port === "80") url.port = "";
      return url.toString();
    }
  } catch {
    // Preserve existing fallback handling for invalid or relative CMS values.
  }
  return value;
}
