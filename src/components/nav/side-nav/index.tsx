"use client";

import { ChevronLeft } from "lucide-react";
import { useAtom } from "jotai";
import { useClerk, useOrganization } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { mobileNavOpenAtom, desktopSidebarExpandedAtom } from "@/lib/atoms";
import Navigation from "./components/navigation";
import User from "./components/user";

export default function SideNav() {
  const [mobileOpen, setMobileOpen] = useAtom(mobileNavOpenAtom);
  const [desktopExpanded, setDesktopExpanded] = useAtom(desktopSidebarExpandedAtom);
  const { organization } = useOrganization();
  const { openOrganizationProfile } = useClerk();

  return (
    <>
      {/* Mobile/tablet backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 laptop:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop collapse/expand toggle — click to open or draw back the sidebar */}
      <button
        type="button"
        onClick={() => setDesktopExpanded((v) => !v)}
        aria-label={desktopExpanded ? "Collapse sidebar" : "Expand sidebar"}
        className={cn(
          "fixed top-[58px] z-50 hidden h-6 w-6 items-center justify-center rounded-full laptop:flex",
          "transition-[left] duration-[280ms] ease-luxury",
        )}
        style={{
          left: desktopExpanded ? 188 : 52,
          background: "rgba(19, 39, 13, 0.95)",
          border: "1px solid rgba(144, 180, 148, 0.3)",
          color: "#90B494",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <ChevronLeft
          size={14}
          strokeWidth={2}
          style={{
            transform: desktopExpanded ? "rotate(0deg)" : "rotate(180deg)",
            transition: "transform 280ms cubic-bezier(0.19, 0.9, 0.22, 1)",
          }}
        />
      </button>

      <aside
        style={{
          background: "rgba(19, 39, 13, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(144, 180, 148, 0.15)",
          borderRadius: "0 16px 16px 0",
          willChange: "width",
          contain: "layout paint",
        }}
        className={cn(
          "fixed bottom-0 left-0 top-0 z-40 flex h-[100dvh] shrink-0 overflow-x-hidden",
          "transition-[width,transform] duration-[280ms] ease-luxury",
          // Mobile: slide in/out at full width
          mobileOpen ? "translate-x-0 w-[200px]" : "-translate-x-full laptop:translate-x-0",
          // Desktop: collapsed (w-16) or expanded on hover (w-[200px])
          !mobileOpen && (desktopExpanded ? "laptop:w-[200px]" : "laptop:w-16"),
        )}
      >
        {/* Fixed-width inner shell — children never reflow during width animation */}
        <div
          style={{
            width: 200,
            minWidth: 200,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
        <User expanded={desktopExpanded} mobileOpen={mobileOpen} />
        <Navigation
          onNavigate={() => setMobileOpen(false)}
          expanded={desktopExpanded || mobileOpen}
        />

        {/* Organization display pinned to bottom */}
        <div className="mt-auto px-3 pb-4">
          {organization && (
            <button
              type="button"
              onClick={() => openOrganizationProfile()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 10,
                background: "rgba(144,180,148,0.07)",
                overflow: "hidden",
                borderTop: "1px solid rgba(144,180,148,0.1)",
                paddingTop: 10,
                marginBottom: 0,
                width: "100%",
                border: "none",
                cursor: "pointer",
                transition: "background 0.18s ease",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(144,180,148,0.14)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(144,180,148,0.07)";
              }}
            >
              {/* Org initials avatar */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "rgba(144,180,148,0.22)",
                  border: "1px solid rgba(144,180,148,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: "#90B494",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                }}
              >
                {(organization.name ?? "O").slice(0, 2).toUpperCase()}
              </div>
              {/* Org name — fades in after width expands; fades out immediately on collapse */}
              <div
                style={{
                  opacity: desktopExpanded || mobileOpen ? 1 : 0,
                  transition: (desktopExpanded || mobileOpen)
                    ? "opacity 180ms ease 140ms"
                    : "opacity 120ms ease",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    color: "rgba(245,247,246,0.9)",
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: "0.01em",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {organization.name}
                </div>
                <div
                  style={{
                    color: "rgba(144,180,148,0.65)",
                    fontSize: 9,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginTop: 1,
                  }}
                >
                  Organization
                </div>
              </div>
            </button>
          )}
        </div>
        </div>
      </aside>
    </>
  );
}
