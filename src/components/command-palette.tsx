"use client";

import { useAtom } from "jotai";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useEffect, useId, useMemo, useRef, useState } from "react";
import { RiArrowRightUpLine, RiSearchLine } from "@remixicon/react";
import { InputBase, TextField } from "@/components/base/input/input";
import { Kbd } from "@/components/base/kbd/kbd";
import {
  ScrollFade,
  useScrollFade,
} from "@/components/foundations/scroll-fade/scroll-fade";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { navigations } from "@/config/site";
import { commandPaletteOpenAtom } from "@/lib/atoms";
import { isPreviewPath } from "@/lib/local-preview.mjs";
import { cx } from "@/utils/cx";

type SearchItem = {
  name: string;
  href: string;
  keywords?: string;
  group: "Pages" | "Quick actions";
};

function previewHref(path: string, preview: boolean) {
  if (!preview) return path;
  return path === "/" ? "/preview" : `/preview${path}`;
}

export function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useAtom(commandPaletteOpenAtom);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const {
    progress: scrollFadeProgress,
    onScroll: onResultsScroll,
    reset: resetScrollFade,
  } = useScrollFade();
  const preview = isPreviewPath(pathname);
  const items = useMemo<SearchItem[]>(
    () => [
      ...navigations.map((item) => ({
        name: item.name,
        href: previewHref(item.href, preview),
        group: "Pages" as const,
      })),
      ...(!preview
        ? [
            {
              name: "Add property",
              href: "/properties/new",
              keywords: "new create building",
              group: "Quick actions" as const,
            },
          ]
        : []),
    ],
    [preview],
  );
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filtered = items.filter(
    (item) =>
      !normalizedQuery ||
      item.name.toLocaleLowerCase().includes(normalizedQuery) ||
      item.keywords?.toLocaleLowerCase().includes(normalizedQuery),
  );
  const optionId = (index: number) => `${listboxId}-option-${index}`;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        !event.repeat &&
        event.key.toLocaleLowerCase() === "k" &&
        (event.ctrlKey || event.metaKey)
      ) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    resetScrollFade();
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open, resetScrollFade]);

  useEffect(() => {
    setActiveIndex((current) =>
      Math.min(current, Math.max(0, filtered.length - 1)),
    );
  }, [filtered.length]);

  useEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>(
      `[data-search-index="${activeIndex}"]`,
    );
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-border-button-default bg-background-primary-default max-w-xl gap-0 overflow-hidden rounded-3xl border p-0 shadow-xl">
        <div className="border-separator-border flex flex-col gap-2 border-b p-4 pe-12">
          <DialogTitle className="text-headline-medium text-text-primary">
            Search
          </DialogTitle>
          <DialogDescription className="text-body-2-regular text-text-tertiary">
            Search currently covers pages and quick actions.
          </DialogDescription>
          <TextField
            value={query}
            onChange={(value) => {
              setQuery(value);
              setActiveIndex(0);
              listRef.current?.scrollTo({ top: 0 });
              resetScrollFade();
            }}
          >
            <InputBase
              ref={inputRef}
              role="combobox"
              aria-label="Search pages and quick actions"
              aria-controls={listboxId}
              aria-expanded={open}
              aria-autocomplete="list"
              aria-activedescendant={
                filtered.length ? optionId(activeIndex) : undefined
              }
              placeholder="Search pages and quick actions"
              leadingIcon={RiSearchLine}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActiveIndex((current) =>
                    filtered.length
                      ? Math.min(current + 1, filtered.length - 1)
                      : 0,
                  );
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActiveIndex((current) => Math.max(current - 1, 0));
                } else if (event.key === "Enter" && filtered[activeIndex]) {
                  event.preventDefault();
                  navigate(filtered[activeIndex].href);
                }
              }}
            />
          </TextField>
        </div>

        <div className="relative min-h-0">
          <div
            id={listboxId}
            role="listbox"
            aria-label="Search results"
            ref={listRef}
            onScroll={onResultsScroll}
            className="max-h-80 overflow-y-auto p-2 [scrollbar-width:thin]"
          >
            {filtered.length ? (
              filtered.map((item, index) => {
                const previous = filtered[index - 1];
                const showGroup = previous?.group !== item.group;
                return (
                  <Fragment key={`${item.group}:${item.href}`}>
                    {showGroup && (
                      <p
                        role="presentation"
                        className="text-caption-1-semibold text-text-tertiary px-3 pb-1 pt-2"
                      >
                        {item.group}
                      </p>
                    )}
                    <button
                      id={optionId(index)}
                      role="option"
                      aria-selected={index === activeIndex}
                      tabIndex={-1}
                      type="button"
                      data-search-index={index}
                      onClick={() => navigate(item.href)}
                      onPointerMove={() => setActiveIndex(index)}
                      className={cx(
                        "focus-visible:ring-border-focus-ring flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-start outline-none focus-visible:ring-2",
                        index === activeIndex
                          ? "bg-background-tertiary-hover text-text-primary"
                          : "text-text-secondary hover:bg-background-tertiary-default",
                      )}
                    >
                      <span className="text-body-medium">{item.name}</span>
                      <RiArrowRightUpLine
                        className="text-foreground-icon-tertiary size-4 shrink-0"
                        aria-hidden
                      />
                    </button>
                  </Fragment>
                );
              })
            ) : (
              <p className="text-body-regular text-text-tertiary px-3 py-8 text-center">
                No matching pages or actions.
              </p>
            )}
          </div>
          <ScrollFade progress={scrollFadeProgress} />
        </div>

        <div className="border-separator-border text-caption-1-regular text-text-tertiary flex items-center gap-3 border-t px-4 py-3">
          <span className="flex items-center gap-1.5">
            <Kbd>↑↓</Kbd> navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd> open
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>Esc</Kbd> close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
