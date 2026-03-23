"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── Icons (inline SVG — no icon lib dependency) ────────────────────────────
const icons: Record<string, React.ReactNode> = {
  dashboard: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  ),
  properties: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  ),
  units: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M3 9h18M9 21V9"/>
    </svg>
  ),
  tenants: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  payments: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  maintenance: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  reports: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14,2 14,8 20,8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  settings: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
    </svg>
  ),
};

// ─── Nav Config ─────────────────────────────────────────────────────────────
const PRIMARY_NAV = [
  { label: "Dashboard",   href: "/",            icon: "dashboard"   },
  { label: "Properties",  href: "/properties",  icon: "properties"  },
  { label: "Units",       href: "/units",       icon: "units"       },
  { label: "Tenants",     href: "/tenants",     icon: "tenants",    badge: null },
];

const SECONDARY_NAV = [
  { label: "Payments",    href: "/payments",    icon: "payments"    },
  { label: "Maintenance", href: "/maintenance", icon: "maintenance" },
  { label: "Reports",     href: "/reports",     icon: "reports"     },
];

const SETTINGS_NAV = [
  { label: "Settings",    href: "/settings",    icon: "settings"    },
];

// ─── Types ───────────────────────────────────────────────────────────────────
interface NavItemDef {
  label: string;
  href: string;
  icon: string;
  badge?: number | null;
}

interface NavItemProps {
  item: NavItemDef;
  active: boolean;
  expanded: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function InzuSidebar() {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Overlay for mobile */}
      {expanded && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setExpanded(false)}
        />
      )}

      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        style={{
          width: expanded ? "200px" : "64px",
          transition: "width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          background: "rgba(19, 39, 13, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(144, 180, 148, 0.15)",
          borderRadius: "0 16px 16px 0",
          overflowX: "hidden",
          overflowY: "auto",
          paddingTop: "20px",
          paddingBottom: "20px",
        }}
        className="fixed left-0 top-0 h-full z-40 flex flex-col px-3"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6 px-1" style={{ minHeight: 36 }}>
          {/* Favicon mark — always visible */}
          <div style={{ width: 36, height: 36, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Image
              src="/inzu_logo_favicon.svg"
              alt="INZU"
              width={28}
              height={28}
              priority
              style={{ objectFit: "contain" }}
            />
          </div>
          {/* Typeface wordmark — fades in on expand */}
          <div
            style={{
              opacity: expanded ? 1 : 0,
              transition: "opacity 0.2s ease 0.15s",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Image
              src="/inzu_logo_typeface.svg"
              alt="INZU"
              width={72}
              height={18}
              priority
              style={{ objectFit: "contain", objectPosition: "left center" }}
            />
          </div>
        </div>

        {/* Primary nav */}
        <nav className="flex flex-col gap-1">
          {PRIMARY_NAV.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              active={isActive(item.href)}
              expanded={expanded}
            />
          ))}
        </nav>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: "rgba(144,180,148,0.1)",
            margin: "10px 4px",
          }}
        />

        {/* Secondary nav */}
        <nav className="flex flex-col gap-1">
          {SECONDARY_NAV.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              active={isActive(item.href)}
              expanded={expanded}
            />
          ))}
        </nav>

        {/* Settings pinned to bottom */}
        <div className="mt-auto">
          <div
            style={{
              height: 1,
              background: "rgba(144,180,148,0.1)",
              margin: "10px 4px 8px",
            }}
          />
          {SETTINGS_NAV.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              active={isActive(item.href)}
              expanded={expanded}
            />
          ))}
        </div>
      </aside>
    </>
  );
}

// ─── NavItem sub-component ───────────────────────────────────────────────────
function NavItem({ item, active, expanded }: NavItemProps) {
  return (
    <Link
      href={item.href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "9px 10px",
        borderRadius: 12,
        background: active ? "rgba(245,247,246,0.10)" : "transparent",
        transition: "background 0.18s ease",
        textDecoration: "none",
        whiteSpace: "nowrap",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "rgba(144,180,148,0.10)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      {/* Active left indicator */}
      {active && (
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
          color: active ? "#F5F7F6" : "#90B494",
          opacity: active ? 1 : 0.65,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          transition: "color 0.18s ease, opacity 0.18s ease",
        }}
      >
        {icons[item.icon]}
      </span>

      {/* Label */}
      <span
        style={{
          color: active ? "#F5F7F6" : "rgba(245,247,246,0.65)",
          fontSize: 13,
          fontWeight: active ? 500 : 400,
          letterSpacing: "0.01em",
          opacity: expanded ? 1 : 0,
          transition: "opacity 0.18s ease 0.12s",
          flex: 1,
        }}
      >
        {item.label}
      </span>

      {/* Badge */}
      {item.badge && expanded && (
        <span
          style={{
            background: "#E22026",
            color: "white",
            fontSize: 9,
            fontWeight: 700,
            borderRadius: 5,
            padding: "1px 5px",
            letterSpacing: "0.02em",
            opacity: expanded ? 1 : 0,
            transition: "opacity 0.2s ease 0.2s",
          }}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}
