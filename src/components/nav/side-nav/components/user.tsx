"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

export default function User() {
  return (
    <div className="flex h-16 flex-col gap-2 border-b border-border px-2 py-2">
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
      <div className="flex justify-center">
        <UserButton
          afterSignOutUrl="/sign-in"
          appearance={{
            elements: {
              avatarBox: "h-9 w-9",
            },
          }}
        />
      </div>
    </div>
  );
}
