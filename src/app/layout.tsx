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
  title: "MarketX | Secure P2P Ledger & Escrow",
  description: "Decentralized P2P marketplace and escrow platform built on Stellar Soroban.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

import Navbar from "@/components/layout/Navbar";
import AppProviders from "@/providers/AppProviders";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased" suppressHydrationWarning>
        <AppProviders>
          <Navbar />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
