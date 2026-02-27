"use client";

import { useTheme } from "next-themes";
import { UserButton } from "@clerk/nextjs";
import Container from "../container";
import { clerkDropdownElements, getClerkAppearanceVariables } from "@/config/clerk-theme";

export default function TopNav({ title }: { title: string }) {
  const { resolvedTheme } = useTheme();
  const variables = getClerkAppearanceVariables(
    resolvedTheme === "dark" ? "dark" : "light",
  );

  return (
    <Container className="flex h-16 items-center justify-between bg-background/80 backdrop-blur-sm">
      <h1 className="text-xl font-normal tracking-[0.16em] uppercase text-muted-foreground">
        {title}
      </h1>
      <div className="flex items-center gap-3">
        <UserButton
          afterSignOutUrl="/sign-in"
          appearance={{
            variables,
            elements: {
              ...clerkDropdownElements,
              avatarBox: "h-9 w-9",
            },
          }}
        />
      </div>
    </Container>
  );
}
