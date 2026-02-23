"use client";

import Link from "next/link";
import Container from "@/components/container";
import { ThemeToggle } from "@/components/theme-toggle";

const TENANT_NAV = [
  { name: "Home", href: "/tenant" },
  // Future: { name: "Your rent", href: "/tenant/rent" }, { name: "Your unit", href: "/tenant/unit" },
];

export function TenantPortalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <Container className="flex h-16 items-center justify-between">
          <nav className="flex items-center gap-6">
            <Link href="/tenant" className="text-xl font-medium">
              INZU
            </Link>
            <span className="text-muted-foreground">Tenant portal</span>
            <div className="flex gap-4">
              {TENANT_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
          <ThemeToggle />
        </Container>
      </header>
      <main>{children}</main>
    </>
  );
}
