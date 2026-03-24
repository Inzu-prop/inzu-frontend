"use client";

import Image from "next/image";

interface UserProps {
  expanded?: boolean;
  mobileOpen?: boolean;
}

export default function User({ expanded = true, mobileOpen = false }: UserProps) {
  const showFull = expanded || mobileOpen;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: showFull ? "flex-start" : "center",
        padding: "20px 12px",
        minHeight: 64,
        transition: "justify-content 0.3s ease",
      }}
    >
      {/* Favicon — visible only when collapsed */}
      <div
        style={{
          opacity: showFull ? 0 : 1,
          transition: "opacity 0.2s ease",
          position: showFull ? "absolute" : "relative",
          pointerEvents: showFull ? "none" : "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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

      {/* Typeface wordmark — visible only when expanded */}
      <div
        style={{
          opacity: showFull ? 1 : 0,
          transition: "opacity 0.2s ease 0.12s",
          position: showFull ? "relative" : "absolute",
          pointerEvents: showFull ? "auto" : "none",
          display: "flex",
          alignItems: "center",
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
