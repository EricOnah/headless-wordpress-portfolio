"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import "@/lib/analytics";

export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const lastPath = useRef<string | null>(null);
  useEffect(() => {
    if (!ready || !pathname || lastPath.current === pathname || !window.gtag) return;
    if (!["ericonah.online", "www.ericonah.online"].includes(window.location.hostname)) return;
    window.gtag("event", "page_view", {
      page_location: window.location.origin + pathname,
      page_title: document.title,
    });
    lastPath.current = pathname;
  }, [pathname, ready]);
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) return null;
  return (
    <>
      <Script id="portfolio-ga-init" strategy="afterInteractive" onReady={() => setReady(true)}>{`
        if (['ericonah.online', 'www.ericonah.online'].includes(window.location.hostname)) {
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            send_page_view: false,
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
            page_location: window.location.origin + window.location.pathname,
            page_referrer: document.referrer ? new URL(document.referrer).origin + new URL(document.referrer).pathname : ''
          });
        }
      `}</Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
    </>
  );
}
