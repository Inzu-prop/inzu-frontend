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
 * Full Clerk appearance for auth pages (sign-in / sign-up) — dark INZU theme.
 * Uses Clerk's `variables` for base palette + `elements` for fine-grained control.
 */
export const clerkAuthAppearance = {
  variables: {
    colorBackground: "#182d1a",
    colorInputBackground: "#0f1f11",
    colorPrimary: "#32533D",
    colorText: "#F5F7F6",
    colorTextSecondary: "#90B494",
    colorInputText: "#F5F7F6",
    colorDanger: "#E22026",
    colorNeutral: "#F5F7F6",
    colorTextOnPrimaryBackground: "#F5F7F6",
    borderRadius: "0.5rem",
    fontFamily:
      '"Be Vietnam Pro", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontFamilyButtons:
      '"Be Vietnam Pro", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    spacingUnit: "16px",
    fontSize: "14px",
  },
  elements: {
    rootBox: {
      width: "100%",
    },
    cardBox: {
      boxShadow: "none",
      border: "1px solid rgba(144, 180, 148, 0.12)",
      borderRadius: "12px",
      width: "100%",
    },
    card: {
      boxShadow: "none",
      background: "#182d1a",
      borderRadius: "12px",
      width: "100%",
    },
    headerTitle: {
      color: "#F5F7F6",
      fontWeight: "600",
      fontSize: "20px",
    },
    headerSubtitle: {
      color: "rgba(144, 180, 148, 0.7)",
      fontSize: "13px",
    },
    socialButtons: {
      width: "100%",
    },
    socialButtonsIconButton: {
      border: "1px solid rgba(144, 180, 148, 0.18)",
      background: "rgba(15, 31, 17, 0.5)",
      borderRadius: "8px",
      transition: "background 0.18s ease",
    },
    socialButtonsIconButton__apple: {
      color: "#F5F7F6",
    },
    socialButtonsIconButton__google: {},
    socialButtonsIconButton__github: {
      color: "#F5F7F6",
    },
    socialButtonsBlockButton: {
      border: "1px solid rgba(144, 180, 148, 0.18)",
      background: "rgba(15, 31, 17, 0.5)",
      color: "#F5F7F6",
      borderRadius: "8px",
      transition: "background 0.18s ease",
    },
    socialButtonsBlockButtonText: {
      color: "#F5F7F6",
      fontWeight: "400",
      fontSize: "13px",
    },
    socialButtonsProviderIcon: {
      filter: "brightness(1.8)",
    },
    dividerLine: {
      background: "rgba(144, 180, 148, 0.12)",
    },
    dividerText: {
      color: "rgba(144, 180, 148, 0.4)",
      fontSize: "11px",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
    },
    formFieldLabel: {
      color: "rgba(245, 247, 246, 0.5)",
      fontSize: "11px",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      fontWeight: "500",
    },
    formFieldInput: {
      background: "#0f1f11",
      border: "1px solid rgba(144, 180, 148, 0.18)",
      color: "#F5F7F6",
      borderRadius: "8px",
      fontSize: "14px",
      transition: "border-color 0.18s ease",
    },
    formFieldInput__identifier: {
      background: "#0f1f11",
    },
    formFieldInput__password: {
      background: "#0f1f11",
    },
    formFieldAction: {
      color: "#90B494",
      fontSize: "12px",
    },
    formFieldInputShowPasswordButton: {
      color: "rgba(144, 180, 148, 0.6)",
    },
    formFieldErrorText: {
      color: "#E22026",
    },
    formFieldSuccessText: {
      color: "#90B494",
    },
    formButtonPrimary: {
      background: "#32533D",
      color: "#F5F7F6",
      fontWeight: "500",
      fontSize: "14px",
      letterSpacing: "0.01em",
      borderRadius: "8px",
      boxShadow: "none",
      transition: "background 0.18s ease",
    },
    formButtonReset: {
      color: "#90B494",
    },
    identityPreview: {
      background: "rgba(15, 31, 17, 0.5)",
      border: "1px solid rgba(144, 180, 148, 0.12)",
      borderRadius: "8px",
    },
    identityPreviewText: {
      color: "#F5F7F6",
    },
    identityPreviewEditButton: {
      color: "#90B494",
    },
    formResendCodeLink: {
      color: "#90B494",
    },
    otpCodeFieldInput: {
      background: "#0f1f11",
      border: "1px solid rgba(144, 180, 148, 0.18)",
      color: "#F5F7F6",
      borderRadius: "8px",
    },
    alternativeMethodsBlockButton: {
      border: "1px solid rgba(144, 180, 148, 0.18)",
      color: "#F5F7F6",
      background: "rgba(15, 31, 17, 0.5)",
      borderRadius: "8px",
    },
    footer: {
      background: "rgba(15, 31, 17, 0.5)",
      borderTop: "1px solid rgba(144, 180, 148, 0.08)",
      borderRadius: "0 0 12px 12px",
    },
    footerAction: {
      background: "transparent",
    },
    footerActionText: {
      color: "rgba(144, 180, 148, 0.55)",
      fontSize: "13px",
    },
    footerActionLink: {
      color: "#90B494",
      fontWeight: "500",
      fontSize: "13px",
    },
    badge: {
      background: "rgba(50, 83, 61, 0.4)",
      color: "#90B494",
      border: "1px solid rgba(144, 180, 148, 0.2)",
    },
    alert: {
      background: "rgba(226, 32, 38, 0.1)",
      border: "1px solid rgba(226, 32, 38, 0.2)",
      borderRadius: "8px",
    },
    alertText: {
      color: "#F5F7F6",
    },
    selectButton: {
      background: "#0f1f11",
      border: "1px solid rgba(144, 180, 148, 0.18)",
      color: "#F5F7F6",
      borderRadius: "8px",
    },
    selectOptionsContainer: {
      background: "#182d1a",
      border: "1px solid rgba(144, 180, 148, 0.15)",
      borderRadius: "8px",
    },
    selectOption: {
      color: "#F5F7F6",
    },
    modalCloseButton: {
      color: "rgba(144, 180, 148, 0.6)",
    },
    backLink: {
      color: "#90B494",
    },
  },
  layout: {
    unsafe_disableDevelopmentModeWarnings: true,
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "iconButton" as const,
  },
};
