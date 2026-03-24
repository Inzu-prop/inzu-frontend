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
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 tablet:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed bottom-0 left-0 top-0 z-40 flex h-[100dvh] w-48 shrink-0 flex-col bg-[hsl(var(--inzu-forest))]",
          "tablet:sticky",
          "transition-[width,transform] duration-300 ease-[cubic-bezier(0.19,0.9,0.22,1)]",
          // Mobile: slide in/out
          mobileOpen ? "translate-x-0" : "-translate-x-full tablet:translate-x-0",
          // Desktop: collapsed (w-16) or expanded (w-48)
          desktopExpanded ? "tablet:w-48" : "tablet:w-16",
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
            desktopExpanded ? "max-h-40 opacity-100" : "tablet:max-h-0 tablet:opacity-0",
          )}
        >
          <InzuProp />
        </div>
        {/* Desktop toggle button */}
        <button
          className="hidden tablet:flex items-center justify-center h-10 w-full shrink-0 border-t border-white/10 text-[hsla(var(--primary-foreground),0.5)] hover:text-[hsl(var(--primary-foreground))] transition-colors duration-200"
          onClick={() => setDesktopExpanded(!desktopExpanded)}
          aria-label={desktopExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {desktopExpanded ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        </button>
      </aside>
    </>
  );
}
