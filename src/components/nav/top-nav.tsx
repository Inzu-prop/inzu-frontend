"use client";

import Container from "../container";
import { ClerkUserMenu } from "@/components/clerk-user-menu";

export default function TopNav({ title }: { title: string }) {
  return (
    <div className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <Container className="flex h-14 items-center justify-between">
        <h1 className="text-xs font-semibold tracking-[0.2em] uppercase text-foreground/60">
          {title}
        </h1>
        <div className="flex items-center gap-3">
          <ClerkUserMenu />
        </div>
      </Container>
    </div>
  );
}
