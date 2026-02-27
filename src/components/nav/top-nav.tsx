"use client";

import Container from "../container";
import { UserButton } from "@clerk/nextjs";

export default function TopNav({ title }: { title: string }) {
  return (
    <Container className="flex h-16 items-center justify-between border-b border-border">
      <h1 className="text-2xl font-medium">{title}</h1>
      <div className="flex items-center gap-3">
        <UserButton
          afterSignOutUrl="/sign-in"
          appearance={{
            elements: {
              avatarBox: "h-9 w-9",
            },
          }}
        />
      </div>
    </Container>
  );
}
