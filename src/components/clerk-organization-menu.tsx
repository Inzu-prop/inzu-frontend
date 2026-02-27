"use client";

import { useClerk, useOrganization, useOrganizationList } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function ClerkOrganizationMenu({ className }: { className?: string }) {
  const { organization } = useOrganization();
  const orgListCtx = useOrganizationList();
  const { isLoaded, setActive } = orgListCtx;
  const { openCreateOrganization } = useClerk();

  if (!isLoaded) return null;

  // Some Clerk versions expose `organizationList`; fall back to `data` if needed.
  const rawList: any[] =
    (orgListCtx as any).organizationList ??
    ((orgListCtx as any).data as any[]) ??
    [];

  const activeOrg =
    organization ?? rawList.find((o) => o.organization?.id)?.organization;

  const otherOrgs =
    rawList.filter((item) => item.organization?.id !== activeOrg?.id) ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex min-w-0 flex-1 items-center justify-between rounded-full bg-card px-3 py-1.5 text-left text-xs font-medium text-foreground ring-offset-background transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className,
          )}
        >
          <span className="truncate">
            {activeOrg?.name ?? "Select organization"}
          </span>
          <span className="ml-2 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
            Org
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Organizations
        </DropdownMenuLabel>
        {activeOrg && (
          <DropdownMenuItem
            disabled
            className="flex flex-col items-start gap-0.5 text-xs"
          >
            <span className="font-medium text-foreground">
              {activeOrg.name}
            </span>
            {activeOrg.slug && (
              <span className="text-[0.7rem] text-muted-foreground">
                {activeOrg.slug}
              </span>
            )}
          </DropdownMenuItem>
        )}
        {otherOrgs.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {otherOrgs.map((item) => (
              <DropdownMenuItem
                key={item.organization.id}
                className="flex flex-col items-start gap-0.5 text-xs"
                onSelect={(event) => {
                  event.preventDefault();
                  void setActive({ organization: item.organization.id });
                }}
              >
                <span className="font-medium text-foreground">
                  {item.organization.name}
                </span>
                {item.organization.slug && (
                  <span className="text-[0.7rem] text-muted-foreground">
                    {item.organization.slug}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-xs"
          onSelect={(event) => {
            event.preventDefault();
            openCreateOrganization();
          }}
        >
          Create organization…
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

