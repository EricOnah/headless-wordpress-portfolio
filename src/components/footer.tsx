import Link from "next/link";
import { LighthouseScores } from "@/components/lighthouse-scores";
import { getFooterContent } from "@/lib/footer-content";

export async function Footer() {
  const content = await getFooterContent();
  const linkClass = "py-2 transition hover:text-emerald-200 sm:px-4";
  return (
    <footer id="footer" className="footer mt-16 border-t border-white/10 bg-black/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="footer-identity">
          <p className="text-sm font-semibold text-white">{content.name}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">
            {content.headline}
          </p>
        </div>
        <address id="footer-contact" className="footer-contact flex flex-col items-start gap-3 text-sm text-slate-100 not-italic sm:flex-row sm:flex-wrap sm:items-center">
          {content.email ? (
            <Link className={linkClass} href={"mailto:" + content.email}>
              {content.email}
            </Link>
          ) : null}
          {content.phone ? (
            <Link className={linkClass} href={"tel:" + content.phone.replace(/[^\d+]/g, "")}>
              {content.phone}
            </Link>
          ) : null}
          {content.linkedin_url && content.linkedin_label ? (
            <Link className={linkClass} href={content.linkedin_url} target="_blank" rel="noopener noreferrer">
              {content.linkedin_label}
            </Link>
          ) : null}
          {content.github_url && content.github_label ? (
            <Link className={linkClass} href={content.github_url} target="_blank" rel="noopener noreferrer">
              {content.github_label}
            </Link>
          ) : null}
        </address>
      </div>
      <LighthouseScores />
    </footer>
  );
}
