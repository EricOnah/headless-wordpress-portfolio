"use client";
import { useId, useState, type FormEvent } from "react";
import { ContactSecurityCheck } from "@/components/contact-security-check";

export function EmailSubscriptionForm() {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [attempt, setAttempt] = useState(0);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        action: "request", email: String(data.get("email") || ""), consent: data.get("consent") === "on",
        companyWebsite: String(data.get("companyWebsite") || ""), turnstileToken: token,
      }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to subscribe. Please try again.");
      setMessage("Check your inbox for a confirmation link. If you’re already subscribed, you’re all set.");
      form.reset();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to subscribe. Please try again."); }
    finally { setBusy(false); setToken(""); setAttempt(value => value + 1); }
  }
  return <section id="email-subscription" aria-labelledby={id + "-heading"} className="my-8 rounded-3xl border border-white/10 bg-white/5 p-6">
    <h2 id={id + "-heading"} className="text-xl font-semibold text-white">Get new posts by email</h2>
    <p className="mt-2 text-sm text-slate-300">Subscribe to Eric Onah’s latest articles. Confirm your email to join; unsubscribe at any time.</p>
    <form onSubmit={submit} className="mt-5 space-y-4">
      <label className="block text-sm text-slate-200" htmlFor={id + "-email"}>Email address</label>
      <input id={id + "-email"} name="email" type="email" autoComplete="email" maxLength={254} required className="w-full max-w-md rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white" placeholder="you@example.com" />
      <div hidden aria-hidden="true"><label>Leave empty<input name="companyWebsite" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="flex items-start gap-3 text-sm text-slate-300"><input name="consent" type="checkbox" required className="mt-1" />I agree to receive an email when Eric Onah publishes a new post.</label>
      <ContactSecurityCheck key={attempt} action="subscribe" onToken={setToken} />
      <button type="submit" className="btn-white-dark disabled:opacity-60" disabled={busy || Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !token)}>{busy ? "Subscribing…" : "Subscribe by email"}</button>
      {message && <p role="status" className="text-sm text-slate-200">{message}</p>}
    </form>
  </section>;
}
