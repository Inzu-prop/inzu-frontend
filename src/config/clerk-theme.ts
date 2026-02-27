/**
 * Clerk appearance variables aligned with Inzu theme.
 * Used by OrganizationSwitcher and UserButton so their dropdowns follow light/dark.
 * Aligns with blueprint: Forest Green chassis, Silver Silk, minimal UI, no orange.
 */

const INZU = {
  forest: "#2D4B3E",
  silk: "#F5F7F6",
  red: "#E22026",
  bgDark: "#13270D",
  cardDark: "#1e2e19",
  foregroundLight: "#0f172a",
  foregroundDark: "#f1f5f9",
  mutedForegroundLight: "#64748b",
  mutedForegroundDark: "#94a3b8",
  borderLight: "#e2e8f0",
  borderDark: "#2d3d26",
} as const;

export type ClerkThemeMode = "light" | "dark";

export function getClerkAppearanceVariables(
  theme: ClerkThemeMode | undefined,
): Record<string, string> {
  const isDark = theme === "dark";
  return {
    colorBackground: isDark ? INZU.cardDark : INZU.silk,
    colorForeground: isDark ? INZU.foregroundDark : INZU.foregroundLight,
    colorMutedForeground: isDark ? INZU.mutedForegroundDark : INZU.mutedForegroundLight,
    colorPrimary: INZU.forest,
    colorPrimaryForeground: INZU.foregroundDark,
    colorDanger: INZU.red,
    colorNeutral: isDark ? INZU.borderDark : INZU.borderLight,
    colorInput: isDark ? INZU.bgDark : INZU.silk,
    colorInputBackground: isDark ? INZU.bgDark : INZU.silk,
    colorInputText: isDark ? INZU.foregroundDark : INZU.foregroundLight,
    colorModalBackdrop: "rgba(0,0,0,0.5)",
    borderRadius: "0.5rem",
    colorBorder: isDark ? INZU.borderDark : INZU.borderLight,
    fontFamily:
      'var(--font-gabarito), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontFamilyButtons:
      'var(--font-gabarito), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  };
}

/** Layout options for Clerk (e.g. disable dev-mode banner so dropdowns match theme). */
export const clerkLayout = {
  unsafe_disableDevelopmentModeWarnings: true,
} as const;

/** Shared element classes for UserButton/OrganizationSwitcher dropdowns (Inzu theme). */
export const clerkDropdownElements = {
  cardBox: "rounded-lg border border-border bg-background shadow-none",
  footer: "border-t border-border bg-muted text-muted-foreground",
} as const;
