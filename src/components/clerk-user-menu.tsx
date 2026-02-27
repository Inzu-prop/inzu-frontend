"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function getInitials(name: string | null | undefined, email: string | undefined): string {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0];
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (first ?? "").concat(last ?? "").toUpperCase() || "U";
  }
  if (email) {
    return email[0]?.toUpperCase() ?? "U";
  }
  return "U";
}

export function ClerkUserMenu({
  className,
}: {
  className?: string;
}) {
  const { user } = useUser();
  const { openUserProfile, signOut } = useClerk();

  if (!user) return null;

  const primaryEmail = user.emailAddresses[0]?.emailAddress;
  const displayName =
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    primaryEmail ||
    "Account";

  const initials = getInitials(displayName, primaryEmail);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className,
          )}
        >
          {initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {initials}
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {displayName}
            </span>
            {primaryEmail && (
              <span className="text-xs text-muted-foreground">
                {primaryEmail}
              </span>
            )}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            openUserProfile();
          }}
        >
          Manage account
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          onSelect={(event) => {
            event.preventDefault();
            void signOut({ redirectUrl: "/sign-in" });
          }}
        >
          Sign out
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 pb-1.5 pt-0 text-[10px] text-muted-foreground">
          Secured by Clerk
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

