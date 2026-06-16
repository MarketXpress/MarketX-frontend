import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

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

export const viewport = {
  themeColor: "#059669",
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
    <html lang="en" className={sora.variable}>
      <body className="antialiased font-[family-name:var(--font-sora)]" suppressHydrationWarning>
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
