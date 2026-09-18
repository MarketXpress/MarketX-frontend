import type { Metadata, Viewport } from "next";
import { Figtree, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/**
 * next/font fetches these at build time and serves them from our own origin,
 * so there is no runtime request to Google. It subsets to the characters
 * actually used and generates a size-adjusted fallback, so text does not
 * reflow while the font loads.
 */
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

/** Prices, wallet addresses and transaction hashes — anything that must line
 *  up in a column or be read character by character. */
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

/**
 * Applies the saved theme before first paint.
 *
 * Without this the page renders light and snaps to dark a frame later, which
 * is a flash in the face of anyone browsing at night.
 */
const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('marketx-theme');
    if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001",
  ),
  title: {
    default: "MarketXpress | Secure P2P Marketplace",
    template: "%s | MarketXpress",
  },
  description:
    "The safest way to trade anything, peer-to-peer. Secured by Stellar smart contract escrow.",
  keywords: [
    "MarketXpress",
    "P2P marketplace",
    "escrow",
    "Stellar",
    "crypto marketplace",
    "XLM",
    "USDC",
  ],
  applicationName: "MarketXpress",
  authors: [{ name: "MarketXpress" }],
  creator: "MarketXpress",
  publisher: "MarketXpress",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "MarketXpress | Secure P2P Marketplace",
    description:
      "The safest way to trade anything, peer-to-peer. Secured by Stellar smart contract escrow.",
    url: "/",
    siteName: "MarketXpress",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MarketXpress | Secure P2P Marketplace",
    description:
      "The safest way to trade anything, peer-to-peer. Secured by Stellar smart contract escrow.",
  },
  icons: { icon: "/icon.png", apple: "/icon.png" },
};

/** Tints the browser chrome to match the page ground in each theme. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBFBFD" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0D13" },
  ],
};

import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import AppProviders from "@/providers/AppProviders";
import { PageTransition } from "@/components/animations/PageTransition";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${figtree.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AppProviders>
          <a href="#main-content" className="skip-nav">Skip to main content</a>
          <Navbar />
          <Suspense>
            <CategoryBar />
          </Suspense>
          <main id="main-content">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </AppProviders>
      </body>
    </html>
  );
}
