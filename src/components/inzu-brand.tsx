import Image from "next/image";
import Link from "next/link";

export function InzuBrand({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      aria-label="INZU home"
      className="focus-visible:ring-border-focus-ring flex h-10 items-center gap-2 overflow-hidden rounded-lg outline-none focus-visible:ring-2"
    >
      <Image
        src="/brand/inzu-mark.svg"
        alt=""
        width={24}
        height={24}
        className="inzu-brand-mark"
        priority
      />
      <Image
        src="/brand/inzu-wordmark.svg"
        alt="INZU"
        width={52}
        height={34}
        className="inzu-brand-wordmark"
        priority
      />
    </Link>
  );
}
