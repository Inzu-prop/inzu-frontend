"use client";

import { useAtom } from "jotai";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { mobileNavOpenAtom, desktopSidebarExpandedAtom } from "@/lib/atoms";
import Navigation from "./components/navigation";
import User from "./components/user";

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
        style={{
          background: "rgba(19, 39, 13, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(144, 180, 148, 0.15)",
          borderRadius: "0 16px 16px 0",
        }}
        className={cn(
          "fixed bottom-0 left-0 top-0 z-40 flex h-[100dvh] w-[200px] shrink-0 flex-col overflow-x-hidden",
          "laptop:sticky",
          "transition-[width,transform] duration-[400ms] ease-luxury",
          // Mobile: slide in/out
          mobileOpen ? "translate-x-0" : "-translate-x-full laptop:translate-x-0",
          // Desktop: collapsed (w-16) or expanded (w-[200px])
          !desktopExpanded && "laptop:w-16",
        )}
      >
        <User expanded={desktopExpanded} mobileOpen={mobileOpen} />
        <Navigation
          onNavigate={() => setMobileOpen(false)}
          expanded={desktopExpanded || mobileOpen}
        />

        {/* Desktop-only toggle button */}
        <button
          className="hidden laptop:flex items-center justify-center h-10 w-full shrink-0 border-t border-[rgba(144,180,148,0.1)] text-[rgba(144,180,148,0.5)] hover:text-[#90B494] transition-colors duration-200"
          onClick={() => setDesktopExpanded(!desktopExpanded)}
          aria-label={desktopExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {desktopExpanded ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        </button>
      </aside>
    </>
  );
}
