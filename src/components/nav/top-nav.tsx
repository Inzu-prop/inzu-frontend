"use client";

import { Menu } from "lucide-react";
import { useAtom } from "jotai";
import Container from "../container";
import { ClerkUserMenu } from "@/components/clerk-user-menu";
import { mobileNavOpenAtom } from "@/lib/atoms";

export default function TopNav({ title }: { title: string }) {
  const [, setMobileNavOpen] = useAtom(mobileNavOpenAtom);

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "transparent",
        backdropFilter: "none",
        borderBottom: "none",
      }}
    >
      <Container className="flex h-14 items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="laptop:hidden text-foreground/50 hover:text-foreground transition-colors"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
          <h1
            style={{
              fontSize: "0.65rem",
              fontWeight: 500,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(var(--foreground-rgb, 34,40,49), 0.38)",
            }}
            className="text-foreground/35"
          >
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <ClerkUserMenu />
        </div>
      </Container>
    </div>
  );
}
