"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Container from "@/components/container";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTenantMe } from "@/contexts/tenant-me-context";

function tenantDisplayName(tenant: { firstName?: string; lastName?: string; name?: string }): string {
  if (tenant.name) return tenant.name;
  const parts = [tenant.firstName, tenant.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Tenant";
}

export function TenantPortalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, loading, error, isNotLinked } = useTenantMe();
  const router = useRouter();

  if (loading) {
    return (
      <Container className="flex min-h-[50vh] items-center justify-center py-10">
        <p className="text-muted-foreground">Loading…</p>
      </Container>
    );
  }

  if (error && isNotLinked) {
    return (
      <Container className="py-10">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="font-medium text-destructive" role="alert">
            No tenant profile is linked to this account
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            If you were invited by your landlord, use the link from the
            invitation email. Otherwise, sign out and contact your landlord.
          </p>
          <button
            type="button"
            onClick={() => router.push("/sign-in")}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            Go to sign in
          </button>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-10">
        <p className="text-destructive" role="alert">
          {error}
        </p>
      </Container>
    );
  }

  const tenantName = data ? tenantDisplayName(data.tenant) : "Tenant";
  const organizationName = data?.organization?.name ?? "Organization";

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
            <span className="hidden text-sm text-muted-foreground md:inline">
              {tenantName} · {organizationName}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </Container>
      </header>
      <main className="bg-background">{children}</main>
    </>
  );
}
