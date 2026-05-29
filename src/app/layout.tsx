import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["300", "400", "500"],
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Aurum Estates",
    template: "%s | Aurum Estates",
  },
  description: "Premium real estate platform with AI assistant",
  metadataBase: new URL("https://aurum-estates.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${cormorant.variable} ${montserrat.variable} antialiased font-sans bg-white text-neutral-900`}
      >
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
