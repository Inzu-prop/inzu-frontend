"use client";

import Image from "next/image";
import { ClerkOrganizationMenu } from "@/components/clerk-organization-menu";

export default function User() {
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
        <ClerkOrganizationMenu />
      </div>
    </div>
  );
}
