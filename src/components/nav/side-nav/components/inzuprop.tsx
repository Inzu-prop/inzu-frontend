"use client";

import Image from "next/image";

export default function InzuProp() {
  return (
    <div className="relative my-3 flex flex-col items-center justify-center gap-y-2 px-4 py-4">
      <div className="dot-matrix absolute left-0 top-0 -z-10 h-full w-full" />
      <span className="text-[11px] tracking-[0.16em] uppercase text-[hsla(var(--primary-foreground),0.7)]">
        Powered by
      </span>
      <div className="flex items-center gap-2">
        <Image
          src="/izufavicon.png"
          alt="InzuProp logo"
          width={24}
          height={24}
          priority
        />
        <span className="text-sm font-medium tracking-[0.16em] uppercase text-[hsl(var(--primary-foreground))]">
          InzuProp
        </span>
      </div>
    </div>
  );
}

