"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { navigations } from "@/config/site";

type Item = {
  name: string;
  href: string;
  keywords?: string;
};

const ALL_ITEMS: Item[] = [
  ...navigations.map((n) => ({ name: n.name, href: n.href })),
  { name: "Add property", href: "/properties/new", keywords: "new create" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  /* Open on Ctrl+K / Cmd+K */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Reset on open */
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const filtered = ALL_ITEMS.filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.keywords ?? "").toLowerCase().includes(q)
    );
  });

  /* Keep activeIndex in bounds */
  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[activeIndex]) navigate(filtered[activeIndex].href);
    }
  }

  /* Scroll active item into view */
  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="p-0 overflow-hidden"
        style={{
          maxWidth: 520,
          background: "rgba(19,39,13,0.96)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(144,180,148,0.15)",
          borderRadius: 16,
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        {/* Search input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            borderBottom: "1px solid rgba(144,180,148,0.10)",
          }}
        >
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="rgba(144,180,148,0.5)" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={onKeyDown}
            placeholder="Go to…"
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              fontSize: 14, color: "rgba(245,247,246,0.9)",
              caretColor: "#90B494",
            }}
          />
          <kbd
            style={{
              fontSize: 10, color: "rgba(245,247,246,0.3)",
              background: "rgba(144,180,148,0.07)",
              border: "1px solid rgba(144,180,148,0.12)",
              borderRadius: 5, padding: "2px 6px", letterSpacing: "0.04em",
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <ul
          ref={listRef}
          style={{ maxHeight: 320, overflowY: "auto", padding: "6px 8px" }}
        >
          {filtered.length === 0 ? (
            <li
              style={{
                padding: "24px 12px", textAlign: "center",
                fontSize: 13, color: "rgba(245,247,246,0.3)",
              }}
            >
              No results
            </li>
          ) : (
            filtered.map((item, i) => (
              <li key={item.href}>
                <button
                  onClick={() => navigate(item.href)}
                  onMouseEnter={() => setActiveIndex(i)}
                  style={{
                    width: "100%", textAlign: "left",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "9px 12px", borderRadius: 9, border: "none",
                    cursor: "pointer", fontSize: 13, fontWeight: 400,
                    transition: "background 120ms ease",
                    background: i === activeIndex
                      ? "rgba(144,180,148,0.12)"
                      : "transparent",
                    color: i === activeIndex
                      ? "rgba(245,247,246,0.95)"
                      : "rgba(245,247,246,0.6)",
                  }}
                >
                  {item.name}
                  {i === activeIndex && (
                    <kbd
                      style={{
                        fontSize: 10, color: "rgba(245,247,246,0.3)",
                        background: "rgba(144,180,148,0.07)",
                        border: "1px solid rgba(144,180,148,0.12)",
                        borderRadius: 5, padding: "2px 6px",
                      }}
                    >
                      ↵
                    </kbd>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>

        {/* Footer hint */}
        <div
          style={{
            borderTop: "1px solid rgba(144,180,148,0.08)",
            padding: "8px 16px",
            display: "flex", gap: 12, alignItems: "center",
          }}
        >
          {[["↑↓", "navigate"], ["↵", "open"], ["esc", "close"]].map(([key, label]) => (
            <span key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <kbd style={{
                fontSize: 10, color: "rgba(245,247,246,0.35)",
                background: "rgba(144,180,148,0.07)",
                border: "1px solid rgba(144,180,148,0.12)",
                borderRadius: 5, padding: "2px 6px",
              }}>{key}</kbd>
              <span style={{ fontSize: 11, color: "rgba(245,247,246,0.25)" }}>{label}</span>
            </span>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
