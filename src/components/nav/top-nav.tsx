"use client";

import { useAtom } from "jotai";
import { RiMenuLine } from "@remixicon/react";
import { IconButton } from "@/components/base/buttons/icon-button";
import { ClerkUserMenu } from "@/components/clerk-user-menu";
import { mobileNavOpenAtom } from "@/lib/atoms";
import Container from "../container";

export default function TopNav({ title }: { title: string }) {
  const [, setMobileNavOpen] = useAtom(mobileNavOpenAtom);
  return (
    <header className="border-separator-border bg-background-full border-b">
      <Container className="flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <IconButton
            icon={RiMenuLine}
            aria-label="Open navigation menu"
            onClick={() => setMobileNavOpen(true)}
            className="laptop:hidden"
          />
          <span className="text-headline-semibold text-text-primary">
            {title === "Dashboard" ? "Overview" : title}
          </span>
        </div>
        <ClerkUserMenu />
      </Container>
    </header>
  );
}
