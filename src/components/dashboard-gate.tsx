"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardShell } from "@/components/nav/dashboard-shell";
import { useAuthMe } from "@/hooks/use-auth-me";
import Container from "@/components/container";
import { TenantPortalShell } from "@/components/tenant-portal-shell";

export function OnboardingView() {
  return (
    <Container className="py-10">
      <h2 className="text-lg font-semibold">Create your organization</h2>
      <p className="mt-2 text-muted-foreground">
        Create an organization to start managing properties, tenants, and more.
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        Use the organization switcher in the sidebar to create your first
        organization.
      </p>
    </Container>
  );
}

export function DashboardGate({ children }: { children: React.ReactNode }) {
  const { isTenantUser, showOnboarding, loading, error } = useAuthMe();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading || !isTenantUser) return;
    const isTenantPath = pathname === "/tenant" || pathname?.startsWith("/tenant/");
    if (!isTenantPath) {
      router.replace("/tenant");
    }
  }, [isTenantUser, loading, pathname, router]);

  if (loading) {
    return (
      <DashboardShell>
        <Container className="py-10">
          <p className="text-muted-foreground">Loading…</p>
        </Container>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <Container className="py-10">
          <p className="text-destructive" role="alert">
            {error}
          </p>
        </Container>
      </DashboardShell>
    );
  }

  if (isTenantUser) {
    const isTenantPath = pathname === "/tenant" || pathname?.startsWith("/tenant/");
    if (!isTenantPath) {
      return (
        <DashboardShell>
          <Container className="py-10">
            <p className="text-muted-foreground">Redirecting…</p>
          </Container>
        </DashboardShell>
      );
    }
    return <TenantPortalShell>{children}</TenantPortalShell>;
  }

  if (showOnboarding) {
    return (
      <DashboardShell>
        <OnboardingView />
      </DashboardShell>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}
