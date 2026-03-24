"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigations } from "@/config/site";

interface NavigationProps {
  onNavigate?: () => void;
  expanded?: boolean;
}

export default function Navigation({ onNavigate, expanded = true }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-grow flex-col gap-1 px-3 pb-4 pt-2">
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
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "9px 10px",
              borderRadius: 12,
              background: isActive ? "rgba(245,247,246,0.10)" : "transparent",
              textDecoration: "none",
              whiteSpace: "nowrap",
              position: "relative",
              transition: "background 0.18s ease",
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.background = "rgba(144,180,148,0.10)";
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.background = "transparent";
            }}
          >
            {/* Active left indicator */}
            {isActive && (
              <span
                style={{
                  position: "absolute",
                  left: -12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 3,
                  height: 18,
                  background: "#90B494",
                  borderRadius: "0 3px 3px 0",
                }}
              />
            )}

            {/* Icon */}
            <span
              style={{
                color: isActive ? "#F5F7F6" : "#90B494",
                opacity: isActive ? 1 : 0.65,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                transition: "color 0.18s ease, opacity 0.18s ease",
              }}
            >
              <Icon size={17} strokeWidth={1.8} />
            </span>

            {/* Label */}
            <span
              style={{
                color: isActive ? "#F5F7F6" : "rgba(245,247,246,0.65)",
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                letterSpacing: "0.01em",
                opacity: expanded ? 1 : 0,
                transition: "opacity 0.18s ease 0.12s",
                overflow: "hidden",
                flex: 1,
              }}
            >
              {navigation.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
