"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { Provider as JotaiProvider } from "jotai";
import { ChartThemeProvider } from "@/components/providers/chart-theme-provider";
import { ModeThemeProvider } from "@/components/providers/mode-theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <JotaiProvider>
        <ModeThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ChartThemeProvider>{children}</ChartThemeProvider>
        </ModeThemeProvider>
      </JotaiProvider>
    </ClerkProvider>
  );
}
