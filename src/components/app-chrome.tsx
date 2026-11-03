"use client";

import { usePathname } from "next/navigation";
import { useOrganization } from "@clerk/nextjs";
import { CommandPalette } from "@/components/command-palette";
import { SideNav } from "@/components/nav";
import { useAuthMe } from "@/hooks/use-auth-me";
import { useCurrentOrganizationId } from "@/hooks/use-current-organization-id";
import { isLocalPreviewEnabled, isPreviewPath } from "@/lib/local-preview.mjs";

const AUTH_PATHS = ["/sign-in", "/sign-up"];

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isLocalPreviewEnabled() && isPreviewPath(pathname))
    return (
      <>
        <CommandPalette />
        {children}
      </>
    );
  return <AuthenticatedChrome>{children}</AuthenticatedChrome>;
}

function AuthenticatedChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isTenantUser, loading } = useAuthMe();
  const { organization } = useOrganization();
  const { organizationId, isLoaded: orgMappingLoaded } =
    useCurrentOrganizationId();
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
      <div className="bg-background-full flex min-h-[100dvh] w-full flex-col">
        {children}
      </div>
    );
  }

  return (
    <div className="bg-background-full flex min-h-[100dvh] w-full">
      <CommandPalette />
      <SideNav />
      <div className="flex min-h-[100dvh] min-w-0 flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
