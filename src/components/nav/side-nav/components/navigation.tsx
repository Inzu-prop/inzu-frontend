"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigations } from "@/config/site";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-grow flex-col gap-y-1 px-3 pb-4 pt-2">
      {navigations.map((navigation) => {
        const Icon = navigation.icon;
        const isActive =
          pathname === navigation.href ||
          (navigation.href !== "/" && pathname?.startsWith(navigation.href));
        return (
          <Link
            key={navigation.name}
            href={navigation.href}
            className={cn(
              "group flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm transition-colors",
              isActive
                ? "bg-white/10 text-[hsl(var(--primary-foreground))] inzu-active-bar"
                : "text-[hsla(var(--primary-foreground),0.65)] hover:bg-white/5 hover:text-[hsl(var(--primary-foreground))]",
            )}
          >
            <Icon
              size={16}
              className={cn(
                "shrink-0 text-[hsla(var(--primary-foreground),0.75)] transition-colors",
                isActive && "text-[hsl(var(--primary-foreground))]",
              )}
            />
            <span className="tracking-[0.08em] uppercase">
              {navigation.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
