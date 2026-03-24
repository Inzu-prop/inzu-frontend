import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { AppChrome } from "@/components/app-chrome";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import "@/style/globals.css";
import { Providers } from "./providers";

const inzuFont = Be_Vietnam_Pro({
  subsets: ["latin"],
  variable: "--font-gabarito",
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  icons: {
    icon: "/inzu_logo_favicon.svg",
  },
};
//
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("bg-background font-sans", inzuFont.variable)}>
        <Providers>
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
