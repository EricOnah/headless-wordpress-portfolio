"use client";

import { FormEvent, useState } from "react";
import { ProjectTypeSelect } from "./project-type-select";
import { person } from "@/lib/content";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      projectType: String(formData.get("projectType") || "").trim(),
      details: String(formData.get("details") || "").trim(),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        const reason = data?.error || "Unable to send message";
        throw new Error(reason);
      }

      setStatus("success");
      setMessage("Thanks! Your message was sent. I’ll reply soon.");
      form.reset();
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Something went wrong. Please email me directly.");
    }
  }

  return (
    <form
      className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.9)]"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-slate-200/90">
          Full name
          <input
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-emerald-300/40 focus:ring-2"
            placeholder="Your name"
            required
            name="name"
            type="text"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-slate-200/90">
          Email
          <input
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-emerald-300/40 focus:ring-2"
            placeholder="you@example.com"
            required
            name="email"
            type="email"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm text-slate-200/90">
        Project type
        <ProjectTypeSelect />
      </label>

      <label className="flex flex-col gap-2 text-sm text-slate-200/90">
        Project details
        <textarea
          className="min-h-[140px] rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none ring-emerald-300/40 focus:ring-2"
          placeholder="Timeline, goals, required integrations..."
          required
          name="details"
        />
      </label>

      <button
        className="btn-white-dark w-full justify-center disabled:opacity-70"
        type="submit"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Sending..." : "Send message"}
        <span aria-hidden>→</span>
      </button>
      <p className="text-xs text-slate-300/80">
        Form submissions will be sent to {person.email}. If you prefer, email directly at {person.email}.
      </p>
      {message ? (
        <p
          className={`text-sm ${status === "success" ? "text-emerald-200" : "text-rose-200"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
