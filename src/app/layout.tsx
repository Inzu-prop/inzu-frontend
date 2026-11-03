import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { AppChrome } from "@/components/app-chrome";
import { siteConfig } from "@/config/site";
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
//
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inzuFont.variable} suppressHydrationWarning>
      <body className="bg-background-full text-text-primary font-sans">
        <Providers>
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
