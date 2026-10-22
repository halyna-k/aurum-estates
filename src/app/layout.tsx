import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { agency } from "@/agency/config";
import { bodyFont, displayFont } from "@/agency/fonts";
import ChatWidget from "@/components/chat/ChatWidget";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: process.env.SITE_URL ? new URL(process.env.SITE_URL) : undefined,
  title: { default: agency.brand.name, template: `%s | ${agency.brand.name}` },
  description: agency.brand.description,
  // A fictional agency must not appear in search results.
  ...(agency.isDemo && { robots: { index: false, follow: false } }),
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: agency.brand.themeColor.light },
    { media: "(prefers-color-scheme: dark)", color: agency.brand.themeColor.dark },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
