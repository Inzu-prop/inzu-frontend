import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Be_Vietnam_Pro } from "next/font/google";
import { AppChrome } from "@/components/app-chrome";
import { siteConfig } from "@/config/site";
import {
  LEGACY_SIDEBAR_PREFERENCE_KEY,
  SIDEBAR_PREFERENCE_COOKIE,
} from "@/lib/sidebar-preference";
import "@/styles/globals.css";
import { Providers } from "./providers";

const inzuFont = Be_Vietnam_Pro({
  subsets: ["latin"],
  variable: "--font-inzu",
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  icons: {
    icon: "/inzu_logo_favicon.svg",
  },
};

// Runs before the body is painted. Existing installations used localStorage,
// which the server cannot read; migrate once and reload before React renders so
// the next request has the cookie and the saved width never flashes.
const sidebarPreferenceMigration = `
  (() => {
    try {
      const cookieName = ${JSON.stringify(SIDEBAR_PREFERENCE_COOKIE)};
      const legacyKey = ${JSON.stringify(LEGACY_SIDEBAR_PREFERENCE_KEY)};
      const hasCookie = document.cookie
        .split("; ")
        .some((part) => part.startsWith(encodeURIComponent(cookieName) + "="));
      if (hasCookie) return;
      const stored = localStorage.getItem(legacyKey);
      if (stored !== "true" && stored !== "false") return;
      document.cookie = cookieName + "=" + stored + "; Path=/; Max-Age=31536000; SameSite=Lax";
      const migrated = document.cookie
        .split("; ")
        .some((part) => part.startsWith(encodeURIComponent(cookieName) + "="));
      if (migrated) {
        localStorage.removeItem(legacyKey);
        location.reload();
      }
    } catch {
      // Storage can be unavailable in privacy-restricted browsers. The app
      // safely falls back to the expanded default in that case.
    }
  })();
`;
//
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialSidebarCollapsed =
    cookieStore.get(SIDEBAR_PREFERENCE_COOKIE)?.value === "true";

  return (
    <html lang="en" className={inzuFont.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: sidebarPreferenceMigration }} />
      </head>
      <body className="bg-background-full text-text-primary font-sans">
        <Providers initialSidebarCollapsed={initialSidebarCollapsed}>
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
