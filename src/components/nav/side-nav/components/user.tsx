"use client";

import Image from "next/image";

interface UserProps {
  expanded?: boolean;
  mobileOpen?: boolean;
}

export default function User({ expanded = true, mobileOpen = false }: UserProps) {
  const showLabel = expanded || mobileOpen;

  return (
    <div className="flex items-center gap-3 px-3 py-5" style={{ minHeight: 64 }}>
      {/* Favicon — always visible */}
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

      {/* Typeface wordmark — fades in when expanded */}
      <div
        style={{
          opacity: showLabel ? 1 : 0,
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
  );
}
