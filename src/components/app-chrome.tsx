"use client";

import { usePathname } from "next/navigation";
import { useOrganization } from "@clerk/nextjs";
import { SideNav } from "@/components/nav";
import { useAuthMe } from "@/hooks/use-auth-me";
import { useCurrentOrganizationId } from "@/hooks/use-current-organization-id";

const AUTH_PATHS = ["/sign-in", "/sign-up"];

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isTenantUser, loading } = useAuthMe();
  const { organization } = useOrganization();
  const { organizationId, isLoaded: orgMappingLoaded } = useCurrentOrganizationId();
  const isAuthRoute = AUTH_PATHS.some((p) => pathname?.startsWith(p));

  // Same source of truth as DashboardGate
  const needsOnboarding =
    orgMappingLoaded && !organization?.id && !organizationId;

  // Auth routes and onboarding render fullscreen — no sidebar
  if (isAuthRoute || needsOnboarding) {
    return <>{children}</>;
  }

  if (!loading && isTenantUser) {
    return (
      <div className="flex min-h-[100dvh] w-full flex-col bg-background">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] w-full bg-background">
      <SideNav />
      <div
        className="flex min-h-[100dvh] flex-1 flex-col overflow-x-hidden overflow-y-auto laptop:ml-16"
      >
        {children}
      </div>
    </div>
  );
}
