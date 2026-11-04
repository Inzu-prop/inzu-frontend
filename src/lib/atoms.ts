import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { sidebarPreferenceStorage } from "@/lib/sidebar-preference";

/** Controls whether the mobile nav drawer is open. */
export const mobileNavOpenAtom = atom(false);

/** One search dialog shared by the global shortcut and Overview action. */
export const commandPaletteOpenAtom = atom(false);

/** Controls whether the desktop sidebar is expanded (true) or icon-only (false). */
export const desktopSidebarExpandedAtom = atom(false);

/** Shared across route changes; persisted only when the user toggles it. */
export const sidebarCollapsedAtom = atomWithStorage(
  "inzu:sidebar-collapsed",
  false,
  sidebarPreferenceStorage,
);
