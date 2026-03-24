"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigations } from "@/config/site";
import { cn } from "@/lib/utils";

interface NavigationProps {
  onNavigate?: () => void;
  expanded?: boolean;
}

export default function Navigation({ onNavigate, expanded = true }: NavigationProps) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-grow flex-col gap-y-1 px-2 pb-4 pt-2">
      {navigations.map((navigation) => {
        const Icon = navigation.icon;
        const isActive =
          pathname === navigation.href ||
          (navigation.href !== "/" && pathname?.startsWith(navigation.href));
        return (
          <Link
            key={navigation.name}
            href={navigation.href}
            onClick={onNavigate}
            title={!expanded ? navigation.name : undefined}
            className={cn(
              "group flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm transition-colors duration-200",
              !expanded && "laptop:justify-center laptop:px-0",
              isActive
                ? "bg-white/10 text-[hsl(var(--primary-foreground))] inzu-active-bar"
                : "text-[hsla(var(--primary-foreground),0.65)] hover:bg-white/5 hover:text-[hsl(var(--primary-foreground))]",
            )}
          >
            <Icon
              size={16}
              className={cn(
                "shrink-0 text-[hsla(var(--primary-foreground),0.75)] transition-colors duration-200",
                isActive && "text-[hsl(var(--primary-foreground))]",
              )}
            />
            <span
              className={cn(
                "whitespace-nowrap tracking-[0.08em] uppercase overflow-hidden transition-[max-width,opacity] duration-300 ease-[cubic-bezier(0.19,0.9,0.22,1)]",
                expanded ? "max-w-[160px] opacity-100" : "laptop:max-w-0 laptop:opacity-0",
              )}
            >
              {navigation.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
