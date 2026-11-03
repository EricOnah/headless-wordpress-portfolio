"use client";

import { usePathname } from "next/navigation";

export function SiteHeader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/proposals/tillmans-tranquils") return null;
  return <>{children}</>;
}
