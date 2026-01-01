import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "./custom.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={bodyClass}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
