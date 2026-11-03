import type { SyncStorage } from "jotai/vanilla/utils/atomWithStorage";

export const SIDEBAR_PREFERENCE_COOKIE = "inzu-sidebar-collapsed";
export const LEGACY_SIDEBAR_PREFERENCE_KEY = "inzu:sidebar-collapsed";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const prefix = `${encodeURIComponent(name)}=`;
  return document.cookie
    .split("; ")
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
}

/**
 * Cookie storage keeps the preference available to the server so direct loads
 * render the same sidebar width that React hydrates on the client.
 */
export const sidebarPreferenceStorage: SyncStorage<boolean> = {
  getItem(_key, initialValue) {
    const value = readCookie(SIDEBAR_PREFERENCE_COOKIE);
    return value === undefined ? initialValue : value === "true";
  },
  setItem(_key, value) {
    if (typeof document === "undefined") return;
    document.cookie = `${SIDEBAR_PREFERENCE_COOKIE}=${String(value)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
  },
  removeItem() {
    if (typeof document === "undefined") return;
    document.cookie = `${SIDEBAR_PREFERENCE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  },
};
