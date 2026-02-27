"use client";

import { ArrowLeftToLine, ArrowRightToLine } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Navigation from "./components/navigation";
import User from "./components/user";
import InzuProp from "./components/inzuprop";

export default function SideNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className={cn(
          "fixed left-0 top-12 z-50 rounded-r-md bg-[hsl(var(--inzu-forest))] px-2 py-1.5 text-[hsl(var(--primary-foreground))] tablet:hidden",
          "transition-transform duration-300 ease-[cubic-bezier(0.19,0.9,0.22,1)]",
          isOpen ? "translate-x-44" : "translate-x-0",
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ArrowLeftToLine size={16} />
        ) : (
          <ArrowRightToLine size={16} />
        )}
      </button>
      <aside
        className={cn(
          "fixed bottom-0 left-0 top-0 z-40 flex h-[100dvh] w-48 shrink-0 flex-col bg-[hsl(var(--inzu-forest))] tablet:sticky tablet:translate-x-0",
          "transition-transform duration-300 ease-[cubic-bezier(0.19,0.9,0.22,1)]",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <User />
        <Navigation />
        <InzuProp />
      </aside>
    </>
  );
}
