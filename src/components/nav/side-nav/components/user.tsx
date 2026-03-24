"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { ClerkOrganizationMenu } from "@/components/clerk-organization-menu";

export default function User({ expanded = true }: { expanded?: boolean }) {
  return (
    <div
      className={cn(
        "flex h-16 items-center gap-2 px-3 py-2 transition-all duration-300 ease-[cubic-bezier(0.19,0.9,0.22,1)]",
        !expanded && "laptop:justify-center laptop:px-0",
      )}
    >
      <Image
        src="/logo.png"
        alt="Inzu logo"
        width={28}
        height={28}
        priority
        className="shrink-0"
      />
      <div
        className={cn(
          "overflow-hidden transition-[max-width,opacity] duration-300 ease-[cubic-bezier(0.19,0.9,0.22,1)]",
          expanded ? "max-w-[160px] opacity-100" : "laptop:max-w-0 laptop:opacity-0",
        )}
      >
        <ClerkOrganizationMenu />
      </div>
    </div>
  );
}
