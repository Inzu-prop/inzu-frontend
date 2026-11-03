"use client";

import { Provider as JotaiProvider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { usePathname } from "next/navigation";
import { ClerkProvider } from "@clerk/nextjs";
import { DirectionProvider } from "@/components/foundations/direction/direction";
import { ChartThemeProvider } from "@/components/providers/chart-theme-provider";
import { ModeThemeProvider } from "@/components/providers/mode-theme-provider";
import { clerkLayout, getClerkAppearanceVariables } from "@/config/clerk-theme";
import { isLocalPreviewEnabled, isPreviewPath } from "@/lib/local-preview.mjs";
import { sidebarCollapsedAtom } from "@/lib/atoms";

export function Providers({
  children,
  initialSidebarCollapsed,
}: {
  children: React.ReactNode;
  initialSidebarCollapsed: boolean;
}) {
  const pathname = usePathname();
  if (isLocalPreviewEnabled() && isPreviewPath(pathname))
    return (
      <SharedProviders initialSidebarCollapsed={initialSidebarCollapsed}>
        {children}
      </SharedProviders>
    );
  const publishableKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    process.env.CLERK_PUBLISHABLE_KEY;

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      appearance={{
        layout: clerkLayout,
        variables: getClerkAppearanceVariables("light"),
      }}
    >
      <SharedProviders initialSidebarCollapsed={initialSidebarCollapsed}>
        {children}
      </SharedProviders>
    </ClerkProvider>
  );
}

function SharedProviders({
  children,
  initialSidebarCollapsed,
}: {
  children: React.ReactNode;
  initialSidebarCollapsed: boolean;
}) {
  return (
    <JotaiProvider>
      <HydrateSidebar collapsed={initialSidebarCollapsed}>
        <ModeThemeProvider
          attribute="class"
          forcedTheme="light"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <DirectionProvider locale="en-KE">
            <ChartThemeProvider>{children}</ChartThemeProvider>
          </DirectionProvider>
        </ModeThemeProvider>
      </HydrateSidebar>
    </JotaiProvider>
  );
}

function HydrateSidebar({
  children,
  collapsed,
}: {
  children: React.ReactNode;
  collapsed: boolean;
}) {
  useHydrateAtoms([[sidebarCollapsedAtom, collapsed]]);
  return children;
}
