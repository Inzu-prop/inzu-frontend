"use client";

import { useAtom } from "jotai";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { mobileNavOpenAtom, desktopSidebarExpandedAtom } from "@/lib/atoms";
import Navigation from "./components/navigation";
import User from "./components/user";
import InzuProp from "./components/inzuprop";

export default function SideNav() {
  const [mobileOpen, setMobileOpen] = useAtom(mobileNavOpenAtom);
  const [desktopExpanded, setDesktopExpanded] = useAtom(desktopSidebarExpandedAtom);

  return (
    <>
      {/* Mobile/tablet backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 laptop:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed bottom-0 left-0 top-0 z-40 flex h-[100dvh] w-48 shrink-0 flex-col bg-[hsl(var(--inzu-forest))]",
          "laptop:sticky",
          "transition-[width,transform] duration-300 ease-[cubic-bezier(0.19,0.9,0.22,1)]",
          // Mobile/tablet: slide in/out via hamburger
          mobileOpen ? "translate-x-0" : "-translate-x-full laptop:translate-x-0",
          // Desktop: collapsed (w-16) or expanded (w-48)
          desktopExpanded ? "laptop:w-48" : "laptop:w-16",
        )}
      >
        <User expanded={desktopExpanded} />
        <Navigation
          onNavigate={() => setMobileOpen(false)}
          expanded={desktopExpanded}
        />
        <div
          className={cn(
            "overflow-hidden transition-[max-height,opacity] duration-300 ease-[cubic-bezier(0.19,0.9,0.22,1)]",
            desktopExpanded ? "max-h-40 opacity-100" : "laptop:max-h-0 laptop:opacity-0",
          )}
        >
          <InzuProp />
        </div>
        {/* Desktop-only toggle button */}
        <button
          className="hidden laptop:flex items-center justify-center h-10 w-full shrink-0 border-t border-white/10 text-[hsla(var(--primary-foreground),0.5)] hover:text-[hsl(var(--primary-foreground))] transition-colors duration-200"
          onClick={() => setDesktopExpanded(!desktopExpanded)}
          aria-label={desktopExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {desktopExpanded ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        </button>
      </aside>
    </>
  );
}
