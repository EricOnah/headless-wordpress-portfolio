"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type Turnstile = {
  render: (element: HTMLElement, options: {
    sitekey: string;
    action: string;
    theme: string;
    callback: (token: string) => void;
    "expired-callback": () => void;
    "error-callback": () => void;
  }) => string;
  remove: (id: string) => void;
};

export function ContactSecurityCheck({ onToken }: { onToken: (token: string) => void }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const api = (window as Window & { turnstile?: Turnstile }).turnstile;
    if (!ready || !siteKey || !container.current || !api) return;
    const widget = api.render(container.current, {
      sitekey: siteKey,
      action: "contact",
      theme: "dark",
      callback: token => { setFailed(false); onToken(token); },
      "expired-callback": () => { onToken(""); setRetry(value => value + 1); },
      "error-callback": () => { onToken(""); setFailed(true); },
    });
    return () => api.remove(widget);
  }, [ready, siteKey, onToken, retry]);

  if (!siteKey) return null;
  return (
    <div>
      <Script
        id="contact-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onReady={() => setReady(true)}
        onError={() => setFailed(true)}
      />
      <div ref={container} />
      {failed ? (
        <p role="status" className="text-sm text-rose-200">
          Security check could not load. Please refresh the page or email me directly.
        </p>
      ) : null}
    </div>
  );
}
