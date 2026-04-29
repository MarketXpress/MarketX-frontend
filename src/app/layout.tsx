import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "MarketX | Secure P2P Ledger & Escrow",
    template: "%s | MarketX",
  },
  description:
    "Decentralized P2P marketplace and escrow platform built on Stellar Soroban.",
  keywords: [
    "MarketX",
    "P2P marketplace",
    "escrow",
    "Stellar",
    "Soroban",
    "decentralized commerce",
    "crypto marketplace",
  ],
  applicationName: "MarketX",
  authors: [{ name: "MarketX Laboratory" }],
  creator: "MarketX Laboratory",
  publisher: "MarketX Laboratory",
  alternates: {
    canonical: "/",
  },
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
    title: "MarketX | Secure P2P Ledger & Escrow",
    description:
      "Decentralized P2P marketplace and escrow platform built on Stellar Soroban.",
    url: "/",
    siteName: "MarketX",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MarketX secure P2P marketplace preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MarketX | Secure P2P Ledger & Escrow",
    description:
      "Decentralized P2P marketplace and escrow platform built on Stellar Soroban.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport = {
  themeColor: "#050505",
};

import Navbar from "@/components/layout/Navbar";
import AppProviders from "@/providers/AppProviders";
import { PageTransition } from "@/components/animations/PageTransition";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased" suppressHydrationWarning>
        <AppProviders>
          <a href="#main-content" className="skip-nav">Skip to main content</a>
          <Navbar />
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
