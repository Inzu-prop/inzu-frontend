"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { OrganizationSwitcher } from "@clerk/nextjs";
import { getClerkAppearanceVariables } from "@/config/clerk-theme";
import { cn } from "@/lib/utils";

export default function User() {
  const { resolvedTheme } = useTheme();
  const variables = getClerkAppearanceVariables(
    resolvedTheme === "dark" ? "dark" : "light",
  );

  return (
    <div className="flex h-16 items-center gap-2 px-3 py-2">
      <div className="flex flex-1 items-center gap-2">
        <Image
          src="/logo.png"
          alt="Inzu logo"
          width={28}
          height={28}
          priority
        />
        <OrganizationSwitcher
          hidePersonal
          afterCreateOrganizationUrl="/"
          afterSelectOrganizationUrl="/"
          appearance={{
            variables,
            elements: {
              rootBox: "w-full flex justify-start",
              organizationSwitcherTrigger: cn(
                "w-full justify-between rounded-full px-3 py-1.5 text-sm transition-colors",
                "text-[hsl(var(--primary-foreground))] hover:bg-white/5",
              ),
            },
          }}
        />
      </div>
    </div>
  );
}
