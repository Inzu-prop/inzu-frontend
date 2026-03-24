"use client";

import { usePathname } from "next/navigation";
import { SideNav } from "@/components/nav";
import { useAuthMe } from "@/hooks/use-auth-me";

const AUTH_PATHS = ["/sign-in", "/sign-up"];

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isTenantUser, loading } = useAuthMe();
  const isAuthRoute = AUTH_PATHS.some((p) => pathname?.startsWith(p));

  if (isAuthRoute) {
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
        className="flex min-h-[100dvh] flex-1 flex-col overflow-auto"
      >
        {children}
      </div>
    </div>
  );
}
