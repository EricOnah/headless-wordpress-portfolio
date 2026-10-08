import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./custom.css";
import { Navbar } from "@/components/navbar";
import { getProfilePicture } from "@/lib/profile-picture";
import { Footer } from "@/components/footer";

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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profilePicture = await getProfilePicture();

  return (
    <html lang="en">
      <body className={bodyClass}>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <Navbar profilePicture={profilePicture} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
