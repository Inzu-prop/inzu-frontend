"use client";

import { usePathname } from "next/navigation";
import { TopNav } from "@/components/nav";

const PATH_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/properties": "Properties",
  "/units": "Units",
  "/tenants": "Tenants",
  "/invoices": "Invoices",
  "/payments": "Payments",
  "/maintenance": "Maintenance",
  "/reports": "Reports",
};

function getTitle(pathname: string | null): string {
  if (!pathname) return "INZU";
  if (PATH_TITLES[pathname]) return PATH_TITLES[pathname];
  for (const [path, title] of Object.entries(PATH_TITLES)) {
    if (path !== "/" && pathname.startsWith(path)) return title;
  }
  return "INZU";
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = getTitle(pathname);
  return (
    <>
      <TopNav title={title} />
      <main>{children}</main>
    </>
  );
}
