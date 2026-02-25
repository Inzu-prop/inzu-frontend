"use client";

import { ArrowLeftToLine, ArrowRightToLine, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function TenantSideNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isHomeActive = pathname === "/tenant" || pathname?.startsWith("/tenant");

  return (
    <>
      <button
        className={cn(
          "fixed left-0 top-12 z-50 rounded-r-md bg-slate-200 px-2 py-1.5 text-primary-foreground shadow-md hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 tablet:hidden",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-44" : "translate-x-0",
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ArrowLeftToLine size={16} /> : <ArrowRightToLine size={16} />}
      </button>
      <aside
        className={cn(
          "fixed bottom-0 left-0 top-0 z-40 flex h-[100dvh] w-44 shrink-0 flex-col border-r border-border bg-slate-100 dark:bg-slate-900 tablet:sticky tablet:translate-x-0",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center border-b border-border px-3 text-sm font-medium text-slate-800 dark:text-slate-100">
          Tenant portal
        </div>
        <nav className="flex flex-grow flex-col gap-y-1 p-2">
          <Link
            href="/tenant"
            className={cn(
              "flex items-center rounded-md px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-800",
              isHomeActive ? "bg-slate-200 dark:bg-slate-800" : "bg-transparent",
            )}
          >
            <Home size={16} className="mr-2 text-slate-800 dark:text-slate-200" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Home</span>
          </Link>
        </nav>
      </aside>
    </>
  );
}

