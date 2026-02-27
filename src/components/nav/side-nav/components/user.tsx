"use client";

import Image from "next/image";
import { OrganizationSwitcher } from "@clerk/nextjs";

export default function User() {
  return (
    <div className="flex flex-col gap-2 border-b border-border px-2 py-2">
      <div className="flex items-center gap-2 pb-1">
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
                "w-full justify-between rounded-md px-2 py-1.5 hover:bg-muted dark:hover:bg-muted/80",
            },
          }}
        />
      </div>
    </div>
  );
}
