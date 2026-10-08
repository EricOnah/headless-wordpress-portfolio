"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

const OPTIONS = [
  "I need a website",
  "WordPress build",
  "Headless WordPress / Next.js",
  "Custom plugin or API",
  "Performance & SEO",
  "Ongoing maintenance",
  "I have a position",
];

type ProjectTypeSelectProps = {
  name?: string;
  defaultValue?: string;
  id?: string;
  labelledBy?: string;
};

export function ProjectTypeSelect({
  name = "projectType",
  defaultValue = OPTIONS[0],
  id,
  labelledBy,
}: ProjectTypeSelectProps) {
  const generatedId = useId();
  const controlId = id || generatedId;
  const listId = controlId + "-options";
  const initialIndex = Math.max(0, OPTIONS.indexOf(defaultValue));
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(OPTIONS[initialIndex]);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleReset() {
      setValue(OPTIONS[initialIndex]);
      setActiveIndex(initialIndex);
      setOpen(false);
    }
    const form = containerRef.current?.closest("form");
    document.addEventListener("mousedown", handleClickOutside);
    form?.addEventListener("reset", handleReset);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      form?.removeEventListener("reset", handleReset);
    };
  }, [initialIndex]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const key = event.key;
    if (key === "Tab" || key === "Escape") {
      setOpen(false);
      if (key === "Escape") event.preventDefault();
      return;
    }
    if (key === "Enter" || key === " ") {
      event.preventDefault();
      if (open) setValue(OPTIONS[activeIndex]);
      else setActiveIndex(Math.max(0, OPTIONS.indexOf(value)));
      setOpen(!open);
      return;
    }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(key)) {
      event.preventDefault();
      const selectedIndex = Math.max(0, OPTIONS.indexOf(value));
      setActiveIndex(key === "Home" ? 0 : key === "End" ? OPTIONS.length - 1 :
        !open ? selectedIndex : (activeIndex + (key === "ArrowDown" ? 1 : -1) + OPTIONS.length) % OPTIONS.length);
      setOpen(true);
    } else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const next = OPTIONS.findIndex((option, index) => index > activeIndex && option.toLowerCase().startsWith(key.toLowerCase()));
      const match = next >= 0 ? next : OPTIONS.findIndex(option => option.toLowerCase().startsWith(key.toLowerCase()));
      if (match >= 0) {
        event.preventDefault();
        setActiveIndex(match);
        setOpen(true);
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl bg-slate-900/60 p-1 shadow-[0_18px_60px_-48px_rgba(16,185,129,0.7)] backdrop-blur"
    >
      <input type="hidden" name={name} value={value} />
      <button
        id={controlId}
        type="button"
        role="combobox"
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : "Project type"}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        aria-expanded={open}
        aria-activedescendant={open ? listId + "-" + activeIndex : undefined}
        onKeyDown={handleKeyDown}
        onClick={() => {
          setActiveIndex(Math.max(0, OPTIONS.indexOf(value)));
          setOpen(!open);
        }}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-emerald-300/40 bg-slate-900 px-3 py-3 text-left text-sm text-white outline-none ring-emerald-300/60 transition hover:border-emerald-200 hover:bg-slate-900 focus:border-emerald-200 focus:ring-2"
      >
        <span>{value}</span>
        <span aria-hidden="true" className="text-xs text-emerald-100/80">▾</span>
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={labelledBy}
          aria-label={labelledBy ? undefined : "Project type"}
          className="absolute left-0 right-0 z-10 mt-1 overflow-hidden rounded-xl border border-white/15 bg-slate-950 text-sm text-white shadow-[0_30px_90px_-60px_rgba(0,0,0,0.9)]"
        >
          {OPTIONS.map((option, index) => (
            <li
              id={listId + "-" + index}
              key={option}
              role="option"
              aria-selected={option === value}
              onMouseDown={event => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => {
                setValue(option);
                setOpen(false);
              }}
              className={"flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left transition " +
                (index === activeIndex ? "bg-emerald-500/15 text-emerald-100" : "hover:bg-white/5")}
            >
              <span>{option}</span>
              {option === value ? <span aria-hidden="true" className="text-xs">●</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}