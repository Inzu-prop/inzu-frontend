"use client";

import { useAtom } from "jotai";
import { cn } from "@/lib/utils";
import { mobileNavOpenAtom } from "@/lib/atoms";
import Navigation from "./components/navigation";
import User from "./components/user";
import InzuProp from "./components/inzuprop";

export default function SideNav() {
  const [isOpen, setIsOpen] = useAtom(mobileNavOpenAtom);

  return (
    <>
      {/* Backdrop — mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 tablet:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed bottom-0 left-0 top-0 z-40 flex h-[100dvh] w-48 shrink-0 flex-col bg-[hsl(var(--inzu-forest))] tablet:sticky tablet:translate-x-0",
          "transition-transform duration-300 ease-[cubic-bezier(0.19,0.9,0.22,1)]",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <User />
        <Navigation onNavigate={() => setIsOpen(false)} />
        <InzuProp />
      </aside>
    </>
  );
}
