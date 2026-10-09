export function trackPortfolioEvent(name: "generate_lead" | "lets_talk_click", placement?: "desktop_header" | "mobile_floating") {
  try {
    if (typeof window === "undefined" || !["ericonah.online", "www.ericonah.online"].includes(window.location.hostname)) return;
    window.gtag?.("event", name, {
      ...(placement ? { placement } : {}),
      page_location: window.location.origin + window.location.pathname,
    });
  } catch { /* Analytics must never interrupt navigation or form delivery. */ }
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
