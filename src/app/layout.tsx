import { getButtonLabels } from "@/lib/button-labels";
import type { Metadata } from "next";
import { Suspense } from "react";
import { HeaderSkeleton } from "@/components/page-skeleton";
import localFont from "next/font/local";
import "./globals.css";
import "./custom.css";
import { Navbar } from "@/components/navbar";
import { getProfilePicture } from "@/lib/profile-picture";
import { Footer } from "@/components/footer";
import { GoogleAnalytics } from "@/components/google-analytics";
import { ResumeTracker } from "@/components/resume-tracker";
import { getProfessionalProfile } from "@/lib/professional-profile";

const sans = localFont({
  src: "../../public/fonts/plus-jakarta-sans-latin-wght-normal.woff2",
  variable: "--font-sans",
  weight: "200 800",
  display: "swap",
});

const display = localFont({
  src: "../../public/fonts/space-grotesk-latin-wght-normal.woff2",
  variable: "--font-display",
  weight: "300 700",
  display: "swap",
});

const bodyClass = [
  sans.variable,
  display.variable,
  "bg-slate-950",
  "text-slate-50",
  "antialiased",
].join(" ");

export const metadata: Metadata = {
  title: "Eric Onah | Full-Stack Developer, WordPress & React Specialist",
  description:
    "Explore the portfolio of Eric Onah, a Full-Stack Developer with 8+ years of experience in React, Next.js, WordPress, Shopify, and custom web applications.",
  openGraph: {
    title: "Eric Onah | Full-Stack Developer",
    description:
      "Explore my portfolio of custom websites, e-commerce solutions, and web applications.",
    images: ["https://cms.ericonah.online/app/uploads/2026/10/profile-picture.jpg"],
    url: "https://ericonah.online/",
  },
};

async function SiteNavigation() {
  const profilePicture = await getProfilePicture();
  return <Navbar profilePicture={profilePicture} labels={await getButtonLabels("header")} />;
}

async function ResumeTracking() {
  const base = (process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "")
    .replace(/\/$/, "").replace(/\/wp-json$/, "");
  if (!base) return null;
  const profile = await getProfessionalProfile();
  return <ResumeTracker endpoint={`${base}/?rest_route=/portfolio/v1/resume-click`} resumeUrl={profile.resume_url} />;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const labels = await getButtonLabels("header");
  return (
    <html lang="en">
      <body className={bodyClass}>
        <a href="#main-content" className="skip-link">{labels.skip_label}</a>
        <Suspense fallback={<HeaderSkeleton />}><SiteNavigation /></Suspense>
        {children}
        <Footer />
        <Suspense fallback={null}><ResumeTracking /></Suspense>
        {process.env.NODE_ENV === "production" && (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production") ? (
          <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-GZV9FHM8XG"} />
        ) : null}
      </body>
    </html>
  );
}
