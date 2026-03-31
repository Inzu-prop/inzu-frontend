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

/** Full Clerk appearance for auth pages (sign-in / sign-up) — dark INZU theme. */
export const clerkAuthAppearance = {
  variables: {
    colorBackground: "#182d1a",
    colorInputBackground: "#0f1f11",
    colorPrimary: "#32533D",
    colorText: "#F5F7F6",
    colorTextSecondary: "rgba(144, 180, 148, 0.75)",
    colorInputText: "#F5F7F6",
    colorDanger: "#E22026",
    colorNeutral: "#90B494",
    colorTextOnPrimaryBackground: "#F5F7F6",
    borderRadius: "8px",
    fontFamily:
      '"Be Vietnam Pro", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontFamilyButtons:
      '"Be Vietnam Pro", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    spacingUnit: "15px",
    fontSize: "14px",
  },
  elements: {
    card: {
      boxShadow: "none",
      border: "1px solid rgba(144, 180, 148, 0.12)",
      background: "#182d1a",
      borderRadius: "12px",
    },
    headerTitle: {
      color: "#F5F7F6",
      fontWeight: "600",
      fontSize: "20px",
    },
    headerSubtitle: {
      color: "rgba(144, 180, 148, 0.75)",
      fontSize: "13px",
    },
    formFieldLabel: {
      color: "rgba(245, 247, 246, 0.5)",
      fontSize: "11px",
      letterSpacing: "0.07em",
      textTransform: "uppercase" as const,
      fontWeight: "500",
    },
    formFieldInput: {
      background: "#0f1f11",
      border: "1px solid rgba(144, 180, 148, 0.18)",
      color: "#F5F7F6",
      borderRadius: "8px",
      fontSize: "14px",
    },
    formButtonPrimary: {
      background: "#32533D",
      color: "#F5F7F6",
      fontWeight: "500",
      fontSize: "14px",
      letterSpacing: "0.01em",
      borderRadius: "8px",
    },
    footerActionLink: {
      color: "#90B494",
      fontWeight: "500",
    },
    identityPreviewText: { color: "#F5F7F6" },
    identityPreviewEditButton: { color: "#90B494" },
    formResendCodeLink: { color: "#90B494" },
    socialButtonsIconButton: {
      border: "1px solid rgba(144, 180, 148, 0.18)",
      background: "transparent",
      color: "#F5F7F6",
    },
    socialButtonsBlockButton: {
      border: "1px solid rgba(144, 180, 148, 0.18)",
      background: "transparent",
      color: "#F5F7F6",
      borderRadius: "8px",
    },
    dividerLine: { background: "rgba(144, 180, 148, 0.1)" },
    dividerText: {
      color: "rgba(144, 180, 148, 0.45)",
      fontSize: "11px",
      letterSpacing: "0.06em",
      textTransform: "uppercase" as const,
    },
    footer: {
      background: "rgba(15, 31, 17, 0.6)",
      borderTop: "1px solid rgba(144, 180, 148, 0.08)",
      borderRadius: "0 0 12px 12px",
    },
    footerAction: { background: "transparent" },
    footerActionText: { color: "rgba(144, 180, 148, 0.55)" },
    otpCodeFieldInput: {
      background: "#0f1f11",
      border: "1px solid rgba(144, 180, 148, 0.18)",
      color: "#F5F7F6",
      borderRadius: "8px",
    },
    alternativeMethodsBlockButton: {
      border: "1px solid rgba(144, 180, 148, 0.18)",
      color: "#F5F7F6",
      background: "transparent",
      borderRadius: "8px",
    },
    badge: {
      background: "rgba(50, 83, 61, 0.4)",
      color: "#90B494",
      border: "1px solid rgba(144, 180, 148, 0.2)",
    },
  },
  layout: {
    unsafe_disableDevelopmentModeWarnings: true,
  },
} as const;
