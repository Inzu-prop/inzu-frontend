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

/**
 * Full Clerk appearance for auth pages (sign-in / sign-up) — INZU treatment.
 * Pseudo-states (hover, focus) require real CSS — see .inzu-clerk-* classes
 * in src/style/globals.css. Inline `variables` cover the base palette so
 * unstyled Clerk elements still inherit INZU colors.
 */
export const clerkAuthAppearance = {
  variables: {
    colorBackground: "transparent",
    colorPrimary: "#32533D",
    colorText: "#F5F7F6",
    colorTextSecondary: "#90B494",
    colorInputText: "#F5F7F6",
    colorInputBackground: "transparent",
    colorDanger: "#E22026",
    colorNeutral: "#F5F7F6",
    colorTextOnPrimaryBackground: "#F5F7F6",
    borderRadius: "0.5rem",
    fontFamily:
      'var(--font-gabarito), "Be Vietnam Pro", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontFamilyButtons:
      'var(--font-gabarito), "Be Vietnam Pro", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    spacingUnit: "14px",
    fontSize: "14px",
  },
  elements: {
    rootBox: "inzu-clerk-root",
    cardBox: "inzu-clerk-card-box",
    card: "inzu-clerk-card",
    header: "inzu-clerk-header",
    headerTitle: "inzu-clerk-header-title",
    headerSubtitle: "inzu-clerk-header-subtitle",

    formField: "inzu-clerk-field",
    formFieldLabel: "inzu-clerk-label",
    formFieldInput: "inzu-clerk-input",
    formFieldAction: "inzu-clerk-field-action",
    formFieldErrorText: "inzu-clerk-field-action",
    formFieldSuccessText: "inzu-clerk-field-action",
    formFieldInputShowPasswordButton: "inzu-clerk-field-action",
    formResendCodeLink: "inzu-clerk-field-action",
    otpCodeFieldInput: "inzu-clerk-input",

    formButtonPrimary: "inzu-clerk-primary-button",
    formButtonReset: "inzu-clerk-field-action",

    socialButtonsBlockButton: "inzu-clerk-social-button",
    socialButtonsBlockButtonText: "inzu-clerk-social-text",
    socialButtonsIconButton: "inzu-clerk-social-button",
    alternativeMethodsBlockButton: "inzu-clerk-social-button",
    socialButtonsProviderIcon: {
      // Boost visibility of monochrome provider marks on dark chassis
      filter: "brightness(1.8)",
    },

    dividerLine: "inzu-clerk-divider-line",
    dividerText: "inzu-clerk-divider-text",

    footer: "inzu-clerk-footer",
    footerAction: "inzu-clerk-footer",
    footerActionText: "inzu-clerk-footer-action-text",
    footerActionLink: "inzu-clerk-footer-action-link",

    identityPreview: {
      background: "rgba(15, 31, 17, 0.4)",
      border: "1px solid rgba(144, 180, 148, 0.14)",
      borderRadius: "6px",
    },
    identityPreviewText: { color: "#F5F7F6" },
    identityPreviewEditButton: "inzu-clerk-field-action",

    badge: {
      background: "rgba(50, 83, 61, 0.4)",
      color: "#90B494",
      border: "1px solid rgba(144, 180, 148, 0.2)",
    },
    alert: {
      background: "rgba(226, 32, 38, 0.08)",
      border: "1px solid rgba(226, 32, 38, 0.2)",
      borderRadius: "6px",
    },
    alertText: { color: "#F5F7F6" },

    selectButton: {
      background: "transparent",
      border: "none",
      borderBottom: "1px solid rgba(144, 180, 148, 0.18)",
      color: "#F5F7F6",
      borderRadius: 0,
    },
    selectOptionsContainer: {
      background: "#182d1a",
      border: "1px solid rgba(144, 180, 148, 0.15)",
      borderRadius: "6px",
    },
    selectOption: { color: "#F5F7F6" },

    modalCloseButton: { color: "rgba(144, 180, 148, 0.6)" },
    backLink: "inzu-clerk-field-action",
  },
  layout: {
    unsafe_disableDevelopmentModeWarnings: true,
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
  },
};
