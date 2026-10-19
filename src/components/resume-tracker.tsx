"use client";

import { useEffect } from "react";

export function ResumeTracker({ endpoint, resumeUrl }: { endpoint: string; resumeUrl: string }) {
  useEffect(() => {
    if (!endpoint) return;
    const track = (event: MouseEvent) => {
      if (event.type === "auxclick" ? event.button !== 1 : event.button !== 0) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || (!link.hasAttribute("data-resume-link") &&
          (!resumeUrl || link.href !== new URL(resumeUrl, window.location.origin).href))) return;
      // No query strings, fragments, visitor identifiers, or navigation delay.
      const body = JSON.stringify({ page: window.location.pathname });
      try {
        const payload = new Blob([body], { type: "text/plain" });
        if (navigator.sendBeacon?.(endpoint, payload)) return;
      } catch { /* Fall back when beacon is unavailable. */ }
      void fetch(endpoint, { method: "POST", body, credentials: "omit", keepalive: true,
        headers: { "Content-Type": "text/plain" } }).catch(() => {});
    };
    document.addEventListener("click", track);
    document.addEventListener("auxclick", track);
    return () => {
      document.removeEventListener("click", track);
      document.removeEventListener("auxclick", track);
    };
  }, [endpoint, resumeUrl]);
  return null;
}
