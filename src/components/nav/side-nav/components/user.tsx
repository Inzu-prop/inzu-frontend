"use client";

import Image from "next/image";

interface UserProps {
  expanded?: boolean;
  mobileOpen?: boolean;
}

export default function User({ expanded = true, mobileOpen = false }: UserProps) {
  const showFull = expanded || mobileOpen;

  return (
    <div style={{ position: "relative", height: 64, flexShrink: 0 }}>
      {/* Favicon — centered, shown when collapsed */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: showFull ? 0 : 1,
          transition: "opacity 0.18s ease",
          pointerEvents: showFull ? "none" : "auto",
        }}
      >
        <Image
          src="/inzu_logo_favicon.svg"
          alt="INZU"
          width={28}
          height={28}
          priority
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* Wordmark — left-aligned, shown when expanded */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          paddingLeft: 16,
          opacity: showFull ? 1 : 0,
          transition: "opacity 0.18s ease 0.1s",
          pointerEvents: showFull ? "auto" : "none",
        }}
      >
        <Image
          src="/inzu_logo_typeface.svg"
          alt="INZU"
          width={80}
          height={20}
          priority
          style={{ objectFit: "contain", objectPosition: "left center" }}
        />
      </div>
    </div>
  );
}
