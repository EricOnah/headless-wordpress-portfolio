"use client";
import { useState } from "react";
export function SubscriptionAction({ action, token }: { action: "confirm" | "unsubscribe"; token: string }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");
  async function apply() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, token }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "This link could not be used. Please try again.");
      setDone(true); setMessage(action === "confirm" ? "You’re subscribed. New posts will arrive by email." : "You’ve been unsubscribed. You won’t receive new-post emails.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Please try again."); }
    finally { setBusy(false); }
  }
  return <div className="mt-6 space-y-4">
    {!done && <button className="btn-white-dark disabled:opacity-60" onClick={apply} disabled={busy}>{busy ? "Please wait…" : action === "confirm" ? "Confirm my subscription" : "Unsubscribe me"}</button>}
    {message && <p role="status" className="text-slate-200">{message}</p>}
  </div>;
}
