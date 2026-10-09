type PageKind = "home" | "about" | "projects" | "posts" | "contact" | "article" | "general";

function Block({ className = "" }: { className?: string }) {
  return <div className={`loading-skeleton rounded-lg ${className}`} />;
}

function Lines() {
  return <div className="space-y-3"><Block className="h-3 w-full" /><Block className="h-3 w-5/6" /><Block className="h-3 w-2/3" /></div>;
}

export function HeaderSkeleton() {
  return <div aria-hidden="true" className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
      <div className="flex items-center gap-3"><Block className="h-10 w-10 rounded-full" /><div className="space-y-2"><Block className="h-3 w-24" /><Block className="h-2 w-36" /></div></div>
      <Block className="hidden h-4 w-72 md:block" /><Block className="h-9 w-9 rounded-full md:w-28" />
    </div>
  </div>;
}

export function PageSkeleton({ kind = "general" }: { kind?: PageKind }) {
  const hero = kind === "home" || kind === "about";
  const collection = kind === "posts" || kind === "projects";
  return <main id="main-content" tabIndex={-1} aria-busy="true" className={`mx-auto min-h-screen px-6 py-12 ${kind === "contact" || kind === "article" ? "max-w-4xl" : "max-w-6xl"}`}>
    <p role="status" className="sr-only">Loading page…</p>
    <div aria-hidden="true" className="space-y-8">
      {hero ? <div className={`grid gap-8 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 lg:grid-cols-2 lg:items-center ${kind === "home" ? "min-h-[520px] lg:min-h-[500px]" : "min-h-96"}`}>
        <div className="space-y-6"><Block className="h-3 w-48" /><Block className="h-10 w-2/3" /><Block className="h-5 w-5/6" /><Lines /><div className="flex gap-3"><Block className="h-12 w-36 rounded-full" /><Block className="h-12 w-32 rounded-full" /></div></div>
        <Block className="h-64 w-full rounded-2xl sm:h-80" />
      </div> : <div className="space-y-5"><Block className="h-3 w-28" /><Block className="h-10 w-3/4 max-w-lg" /><div className="max-w-2xl"><Lines /></div></div>}
      {collection ? <>
        <div className="flex flex-wrap gap-3">{[0, 1, 2].map(item => <Block key={item} className="h-10 w-28 rounded-full" />)}</div>
        <div className="grid gap-6 md:grid-cols-2">{[0, 1, 2, 3].map(item => <div key={item} className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6"><Block className="h-44 w-full rounded-2xl" /><Block className="h-5 w-3/4" /><Lines /></div>)}</div>
      </> : kind === "contact" ? <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">{[0, 1, 2].map(item => <div key={item} className="space-y-3"><Block className="h-3 w-24" /><Block className={`${item === 2 ? "h-32" : "h-12"} w-full rounded-xl`} /></div>)}<Block className="h-12 w-36 rounded-full" /></div>
        <div className="space-y-8 rounded-3xl border border-white/10 bg-white/5 p-6"><Block className="h-4 w-36" /><Lines /><Lines /></div>
      </div> : kind === "article" ? <div className="space-y-8"><Block className="aspect-video w-full rounded-3xl" /><Lines /><Lines /><Lines /></div> : <div className="grid gap-6 md:grid-cols-2">{[0, 1].map(item => <div key={item} className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6"><Block className="h-4 w-36" /><Lines /><Lines /></div>)}</div>}
    </div>
  </main>;
}
