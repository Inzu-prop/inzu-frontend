"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { CreateOrganization, useOrganization } from "@clerk/nextjs";
import { DashboardShell } from "@/components/nav/dashboard-shell";
import { useAuthMe } from "@/hooks/use-auth-me";
import { useCurrentOrganizationId } from "@/hooks/use-current-organization-id";
import Container from "@/components/container";
import { TenantMeProvider } from "@/contexts/tenant-me-context";
import { TenantPortalShell } from "@/components/tenant-portal-shell";

const ONBOARDING_STEPS = [
  { number: 1, label: "Create organization" },
  { number: 2, label: "Add properties" },
  { number: 3, label: "Invite tenants" },
];

const clerkOnboardingAppearance = {
  variables: {
    colorBackground: "transparent",
    colorPrimary: "#32533D",
    colorText: "#0f172a",
    colorTextSecondary: "#64748b",
    colorInputBackground: "#ffffff",
    colorInputText: "#0f172a",
    colorDanger: "#E22026",
    borderRadius: "8px",
    fontFamily:
      '"Be Vietnam Pro", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontFamilyButtons:
      '"Be Vietnam Pro", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  elements: {
    card: {
      boxShadow: "none",
      border: "none",
      background: "transparent",
      padding: "0",
      margin: "0",
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box" as const,
      overflow: "hidden",
    },
    rootBox: {
      width: "100%",
      maxWidth: "100%",
    },
    cardBox: {
      boxShadow: "none",
      border: "none",
      width: "100%",
      maxWidth: "100%",
    },
    form: {
      width: "100%",
    },
    formFieldRow: {
      width: "100%",
    },
    headerTitle: { display: "none" },
    headerSubtitle: { display: "none" },
    formFieldLabel: {
      color: "#374151",
      fontSize: "12px",
      letterSpacing: "0.04em",
      fontWeight: "500",
    },
    formFieldInput: {
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      color: "#0f172a",
      borderRadius: "8px",
      fontSize: "14px",
      width: "100%",
      boxSizing: "border-box" as const,
    },
    formButtonPrimary: {
      background: "#32533D",
      color: "#F5F7F6",
      fontWeight: "500",
      fontSize: "14px",
      borderRadius: "8px",
      height: "40px",
      width: "100%",
      boxSizing: "border-box" as const,
    },
    footer: { display: "none" },
    fileDropAreaBox: {
      maxWidth: "100%",
    },
    avatarImageActionsUpload: {
      maxWidth: "100%",
    },
  },
  layout: {
    unsafe_disableDevelopmentModeWarnings: true,
  },
} as const;

function OnboardingView() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#F5F7F6",
        padding: "32px 24px",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 32 }}>
        <Image
          src="/inzu_logo_favicon.svg"
          alt="INZU"
          width={36}
          height={36}
          priority
        />
      </div>

      {/* Progress steps */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          marginBottom: 40,
        }}
      >
        {ONBOARDING_STEPS.map((step, i) => (
          <div key={step.number} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  background: step.number === 1 ? "#32533D" : "transparent",
                  color: step.number === 1 ? "#F5F7F6" : "#94a3b8",
                  border:
                    step.number === 1
                      ? "none"
                      : "1.5px solid #e2e8f0",
                }}
              >
                {step.number}
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: step.number === 1 ? 500 : 400,
                  color: step.number === 1 ? "#0f172a" : "#94a3b8",
                  letterSpacing: "0.01em",
                  whiteSpace: "nowrap",
                }}
              >
                {step.label}
              </span>
            </div>
            {/* Connector line */}
            {i < ONBOARDING_STEPS.length - 1 && (
              <div
                style={{
                  width: 40,
                  height: 1,
                  background: "#e2e8f0",
                  margin: "0 12px",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#ffffff",
          borderRadius: 14,
          border: "1px solid rgba(0,0,0,0.06)",
          padding: "36px 32px 32px",
          overflow: "hidden",
          boxSizing: "border-box" as const,
        }}
      >
        {/* Heading */}
        <h1
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "#0f172a",
            letterSpacing: "-0.01em",
            marginBottom: 6,
          }}
        >
          Create your organization
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "#64748b",
            lineHeight: 1.5,
            marginBottom: 28,
          }}
        >
          An organization is your workspace — it holds your properties,
          units, tenants, and payment records.
        </p>

        {/* Clerk CreateOrganization */}
        <CreateOrganization
          appearance={clerkOnboardingAppearance}
          skipInvitationScreen
        />
      </div>

      {/* Footer hint */}
      <p
        style={{
          marginTop: 24,
          fontSize: 11,
          color: "#94a3b8",
          letterSpacing: "0.02em",
        }}
      >
        You can invite team members later from Settings.
      </p>
    </div>
  );
}

export function DashboardGate({ children }: { children: React.ReactNode }) {
  const { isTenantUser, showOnboarding, loading, error, refetch } = useAuthMe();
  const { organization } = useOrganization();
  const { organizationId, isLoaded: orgMappingLoaded } = useCurrentOrganizationId();
  const pathname = usePathname();
  const router = useRouter();

  // When Clerk creates an org, refetch auth data so showOnboarding flips to false
  useEffect(() => {
    if (showOnboarding && organization?.id) {
      refetch();
    }
  }, [showOnboarding, organization?.id, refetch]);

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
    return (
      <TenantMeProvider>
        <TenantPortalShell>{children}</TenantPortalShell>
      </TenantMeProvider>
    );
  }

  // Show onboarding only if backend says no orgs AND Clerk has no active org
  if (showOnboarding && !organization?.id) {
    return <OnboardingView />;
  }

  // Clerk org exists but backend mapping is still resolving — show loading
  if (organization?.id && (!orgMappingLoaded || !organizationId)) {
    return (
      <DashboardShell>
        <Container className="py-10">
          <p className="text-muted-foreground">Setting up your organization…</p>
        </Container>
      </DashboardShell>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}
