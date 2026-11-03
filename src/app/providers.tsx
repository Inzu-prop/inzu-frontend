"use client";

import { Provider as JotaiProvider } from "jotai";
import { usePathname } from "next/navigation";
import { ClerkProvider } from "@clerk/nextjs";
import { DirectionProvider } from "@/components/foundations/direction/direction";
import { ChartThemeProvider } from "@/components/providers/chart-theme-provider";
import { ModeThemeProvider } from "@/components/providers/mode-theme-provider";
import { clerkLayout, getClerkAppearanceVariables } from "@/config/clerk-theme";
import { isLocalPreviewEnabled, isPreviewPath } from "@/lib/local-preview.mjs";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isLocalPreviewEnabled() && isPreviewPath(pathname))
    return <SharedProviders>{children}</SharedProviders>;
  const publishableKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    process.env.CLERK_PUBLISHABLE_KEY;

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        layout: clerkLayout,
        variables: getClerkAppearanceVariables("light"),
      }}
    >
      <SharedProviders>{children}</SharedProviders>
    </ClerkProvider>
  );
}

function SharedProviders({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
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
    </JotaiProvider>
  );
}
