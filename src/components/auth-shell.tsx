import Image from "next/image";
import type { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        background: "#13270D",
        fontFamily: '"Be Vietnam Pro", system-ui, sans-serif',
      }}
    >
      {/* ── Left brand panel ── */}
      <div
        className="hidden lg:flex"
        style={{
          flex: "0 0 42%",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 56px",
          borderRight: "1px solid rgba(144,180,148,0.1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle radial glow */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: "70%",
            height: "70%",
            background:
              "radial-gradient(ellipse, rgba(50,83,61,0.35) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <Image
          src="/inzu_logo_typeface.svg"
          alt="INZU"
          width={96}
          height={24}
          priority
          style={{ objectFit: "contain", objectPosition: "left center" }}
        />

        {/* Headline */}
        <div>
          <h1
            style={{
              color: "#F5F7F6",
              fontSize: 42,
              fontWeight: 600,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              marginBottom: 16,
            }}
          >
            Property management,
            <br />
            <span style={{ color: "#90B494" }}>refined.</span>
          </h1>
          <p
            style={{
              color: "rgba(144,180,148,0.7)",
              fontSize: 15,
              lineHeight: 1.6,
              maxWidth: 320,
            }}
          >
            One place to manage your portfolio — properties, tenants, payments,
            and maintenance.
          </p>
        </div>

        {/* Bottom decorative line */}
        <div
          style={{
            height: 1,
            background:
              "linear-gradient(to right, rgba(144,180,148,0.25), transparent)",
          }}
        />
      </div>

      {/* ── Right form panel ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 24px",
          minHeight: "100dvh",
        }}
      >
        {/* Mobile logo (hidden on desktop) */}
        <div className="mb-8 lg:hidden">
          <Image
            src="/inzu_logo_typeface.svg"
            alt="INZU"
            width={80}
            height={20}
            priority
            style={{ objectFit: "contain" }}
          />
        </div>

        {children}
      </div>
    </div>
  );
}
