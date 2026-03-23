"use client";

import Container from "../container";
import { ClerkUserMenu } from "@/components/clerk-user-menu";

export default function TopNav({ title }: { title: string }) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        /* Fully dissolves into the page background — no chrome seam */
        background: "transparent",
        backdropFilter: "none",
        borderBottom: "none",
      }}
    >
      <Container className="flex h-14 items-center justify-between">
        <h1
          style={{
            fontSize: "0.65rem",
            fontWeight: 500,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(var(--foreground-rgb, 34,40,49), 0.38)",
            /* foreground-rgb fallback — resolved below via Tailwind */
          }}
          className="text-foreground/35"
        >
          {title}
        </h1>
        <div className="flex items-center gap-3">
          <ClerkUserMenu />
        </div>
      </Container>
    </div>
  );
}
