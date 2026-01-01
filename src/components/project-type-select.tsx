 "use client";

import { useEffect, useRef, useState } from "react";

const OPTIONS = [
  "I need a website",
  "WordPress build",
  "Headless WordPress / Next.js",
  "Custom plugin or API",
  "Performance & SEO",
  "Ongoing maintenance",
];

type ProjectTypeSelectProps = {
  name?: string;
  defaultValue?: string;
};

export function ProjectTypeSelect({
  name = "projectType",
  defaultValue = OPTIONS[0],
}: ProjectTypeSelectProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const selected = value;

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl bg-slate-900/60 p-1 shadow-[0_18px_60px_-48px_rgba(16,185,129,0.7)] backdrop-blur"
    >
      <input type="hidden" name={name} value={selected} />
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-emerald-300/40 bg-slate-900 px-3 py-3 text-left text-sm text-white outline-none ring-emerald-300/60 transition hover:border-emerald-200 hover:bg-slate-900 focus:border-emerald-200 focus:ring-2"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selected}</span>
        <span className="text-xs text-emerald-100/80">▾</span>
      </button>
      {open ? (
        <ul
          className="absolute left-0 right-0 z-10 mt-1 overflow-hidden rounded-xl border border-white/15 bg-slate-950 text-sm text-white shadow-[0_30px_90px_-60px_rgba(0,0,0,0.9)]"
          role="listbox"
          aria-label="Project type"
        >
          {OPTIONS.map((option) => (
            <li key={option}>
              <button
                type="button"
                className={`flex w-full items-center justify-between px-4 py-3 text-left transition ${
                  option === selected
                    ? "bg-emerald-500/15 text-emerald-100"
                    : "hover:bg-white/5"
                }`}
                onClick={() => {
                  setValue(option);
                  setOpen(false);
                }}
                role="option"
                aria-selected={option === selected}
              >
                <span>{option}</span>
                {option === selected ? <span className="text-xs">●</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
