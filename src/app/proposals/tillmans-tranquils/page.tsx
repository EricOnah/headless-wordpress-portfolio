import type { Metadata } from "next";
import reportHtml from "@/content/tillmans-tranquils-proposal.json";
import styles from "./proposal.module.css";

export const metadata: Metadata = {
  title: "Tillmans Tranquils | Website Fixes & Delivery Proposal",
  description: "Website review and delivery proposal prepared for Tillmans Tranquils, 3 November 2026.",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
  openGraph: {
    title: "Tillmans Tranquils | Client Proposal",
    description: "Website fixes and delivery proposal prepared by Eric Onah.",
    url: "https://ericonah.online/proposals/tillmans-tranquils",
    images: [],
  },
};

const downloadUrl = "https://cms.ericonah.online/app/uploads/2026/11/Tillmans-Tranquils-Client-Proposal.zip";

export default function TillmansTranquilsProposal() {
  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <div className={styles.container}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Client proposal · 03 November 2026</p>
          <h1>Tillmans Tranquils<br /><span>Website fixes &amp; delivery proposal</span></h1>
          <p className={styles.intro}>A review of your 15 correction points, the remaining work, and a practical plan for delivery.</p>
          <div className={styles.actions}>
            <a className={styles.download} href={downloadUrl} download="Tillmans-Tranquils-Client-Proposal.zip">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" /></svg>
              Download proposal ZIP
            </a>
            <a className={styles.readLink} href="#summary">Read the proposal <span aria-hidden="true">↓</span></a>
          </div>
          <dl className={styles.metrics}>
            <div><dt>Estimated allowance</dt><dd>28 <span>hours</span></dd></div>
            <div><dt>Hourly rate</dt><dd>$15 <span>USD</span></dd></div>
            <div><dt>Estimated labour</dt><dd>$420 <span>USD</span></dd></div>
            <div><dt>Proposed delivery</dt><dd>09 Nov <span>2026</span></dd></div>
          </dl>
          <p className={styles.note}>Allowance and delivery are subject to the access, scope and decisions detailed below.</p>
        </header>
        {/* Reviewed local report HTML, committed with the page; no runtime/user-supplied HTML. */}
        <article aria-label="Full client proposal" className={styles.report} dangerouslySetInnerHTML={{ __html: reportHtml }} />
        <aside className={styles.closing} aria-label="Download the proposal">
          <div><h2>Keep a copy of the proposal</h2><p>Download the ZIP for your records.</p></div>
          <a className={styles.download} href={downloadUrl} download="Tillmans-Tranquils-Client-Proposal.zip">Download proposal ZIP <span aria-hidden="true">↓</span></a>
        </aside>
      </div>
    </main>
  );
}
