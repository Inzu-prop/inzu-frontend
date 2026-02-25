"use client";

import { usePathname } from "next/navigation";
import { SideNav } from "@/components/nav";
import { useAuthMe } from "@/hooks/use-auth-me";
import TenantSideNav from "@/components/tenant-side-nav";

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
      <div className="flex min-h-[100dvh] w-full">
        <TenantSideNav />
        <div className="flex-grow overflow-auto">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] w-full">
      <SideNav />
      <div className="flex-grow overflow-auto">{children}</div>
    </div>
  );
}
