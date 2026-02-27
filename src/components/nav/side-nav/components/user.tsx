"use client";

import Image from "next/image";
import { OrganizationSwitcher } from "@clerk/nextjs";

export default function User() {
  return (
    <div className="flex h-16 items-center gap-2 border-b border-border px-2">
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
            elements: {
              rootBox: "w-full flex justify-start",
              organizationSwitcherTrigger:
                "w-full justify-between rounded-md px-2 py-1.5 text-foreground hover:bg-muted dark:text-slate-100 dark:hover:bg-muted/70",
            },
          }}
        />
      </div>
    </div>
  );
}
