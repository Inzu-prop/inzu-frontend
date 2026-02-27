/**
 * Clerk appearance variables aligned with Inzu theme.
 * Used by OrganizationSwitcher and UserButton so their dropdowns follow light/dark.
 */

const INZU = {
  forest: "#2D4B3E",
  silk: "#F5F7F6",
  red: "#E22026",
  bgDark: "#13270D",
  cardDark: "#1e2e19",
  foregroundLight: "#0f172a",
  foregroundDark: "#f1f5f9",
  borderLight: "#e2e8f0",
  borderDark: "#2d3d26",
} as const;

export type ClerkThemeMode = "light" | "dark";

export function getClerkAppearanceVariables(
  theme: ClerkThemeMode | undefined,
): Record<string, string> {
  const isDark = theme === "dark";
  return {
    colorBackground: isDark ? INZU.cardDark : "#ffffff",
    colorForeground: isDark ? INZU.foregroundDark : INZU.foregroundLight,
    colorPrimary: INZU.forest,
    colorPrimaryForeground: INZU.foregroundDark,
    colorDanger: INZU.red,
    colorNeutral: isDark ? INZU.borderDark : INZU.borderLight,
    colorInputBackground: isDark ? INZU.bgDark : "#ffffff",
    colorInputText: isDark ? INZU.foregroundDark : INZU.foregroundLight,
    colorModalBackdrop: "rgba(0,0,0,0.5)",
    borderRadius: "0.5rem",
  };
}
