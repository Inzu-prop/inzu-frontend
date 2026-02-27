"use client";

import Container from "../container";
import { ClerkUserMenu } from "@/components/clerk-user-menu";

export default function TopNav({ title }: { title: string }) {
  return (
    <Container className="flex h-16 items-center justify-between bg-background/80 backdrop-blur-sm">
      <h1 className="text-xl font-normal tracking-[0.16em] uppercase text-muted-foreground">
        {title}
      </h1>
      <div className="flex items-center gap-3">
        <ClerkUserMenu />
      </div>
    </Container>
  );
}
