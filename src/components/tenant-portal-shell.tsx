"use client";

import Link from "next/link";
import Container from "@/components/container";
import { ThemeToggle } from "@/components/theme-toggle";

export function TenantPortalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <Container className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/tenant" className="text-xl font-semibold tracking-tight">
              INZU
            </Link>
            <span className="hidden border-l border-border pl-4 text-sm text-muted-foreground sm:inline">
              Tenant portal
            </span>
            <nav className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
              <Link
                href="/tenant"
                className="rounded-md px-2 py-1 text-foreground"
              >
                Home
              </Link>
            </nav>
          </div>
          <ThemeToggle />
        </Container>
      </header>
      <main className="bg-background">{children}</main>
    </>
  );
}
