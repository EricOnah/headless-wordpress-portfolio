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
  title: "Eric Onah | WordPress & Headless CMS Developer",
  description:
    "Certified WordPress and Headless CMS developer crafting performant sites with custom themes, plugins, and Next.js front-ends.",
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
