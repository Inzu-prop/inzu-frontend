"use client";

import Image from "next/image";
import { OrganizationSwitcher } from "@clerk/nextjs";

export default function User() {
  return (
    <div className="flex flex-col gap-2 border-b border-border px-2 py-2">
      <div className="flex justify-center pb-1">
        <Image
          src="/logo.png"
          alt="Inzu logo"
          width={96}
          height={32}
          priority
        />
      </div>
      <OrganizationSwitcher
        hidePersonal
        afterCreateOrganizationUrl="/"
        afterSelectOrganizationUrl="/"
        appearance={{
          elements: {
            rootBox: "w-full flex justify-center",
            organizationSwitcherTrigger:
              "w-full justify-center rounded-md px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-800",
          },
        }}
      />
    </div>
  );
}
