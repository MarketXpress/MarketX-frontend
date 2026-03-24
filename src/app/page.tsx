"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Globe, Lock, Package, Wallet, CheckCircle, Search, Tag, Clock } from "lucide-react";
import { motion } from "framer-motion";
import CursorAura from "@/components/animations/CursorAura";
import FloatingBackground from "@/components/animations/FloatingBackground";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { cn } from "@/lib/utils";
import MarketplaceSection from "@/components/marketplace/MarketplaceSection";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col bg-[#050505] text-white overflow-x-hidden selection:bg-blue-500/30">
      {/* High-end Background Effects */}
      <CursorAura />
      <FloatingBackground />

      {/* Hero Section */}
      <section className="relative z-10 pt-48 pb-20 px-6 flex flex-col items-center text-center max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-8 shadow-lg shadow-blue-500/5">
            <Zap className="w-3 h-3 fill-current" /> Powered by Stellar Soroban
          </div>
        </ScrollReveal>
        
        <ScrollReveal delay={0.4}>
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.85]">
            The Future of <br />
            <span className="bg-linear-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl">
              Safe P2P Commerce
            </span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.6}>
          <p className="max-w-2xl text-lg md:text-xl text-neutral-400 mb-12 leading-relaxed">
            MarketX is a decentralized P2P marketplace where every transaction is secured by immutable smart contracts. 
            Buy and sell with absolute certainty.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.8}>
          <div className="flex flex-col sm:flex-row gap-6">
            <Link 
              href="/auth/register" 
              className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-2xl shadow-blue-600/40 flex items-center justify-center gap-2 group active:scale-95 border border-white/10"
            >
              Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </Link>
            <Link 
              href="#explore" 
              className="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all backdrop-blur-3xl active:scale-95 shadow-xl"
            >
              Browse Assets
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* Trust Badges */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12 w-full flex justify-center">
         <ScrollReveal delay={1} className="w-full flex justify-center">
            <div className="flex flex-wrap justify-center gap-12 opacity-40 hover:opacity-100 transition-all duration-700">
               {["Stellar Network", "Soroban Smart Contracts", "Freighter Wallet", "Decentralized", "Open Source", "Audited"].map((value) => (
                 <span key={value} className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200/50 hover:text-blue-400 transition-colors cursor-default">{value}</span>
               ))}
            </div>
         </ScrollReveal>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-32 w-full">
        <ScrollReveal className="w-full flex flex-col items-center mb-20 text-center">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">How it Works</h2>
          <p className="text-neutral-400 max-w-xl">Four simple steps to absolute transaction safety.</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: "01", title: "List Asset", icon: Tag, desc: "Sellers list their digital or physical goods with detailed metadata." },
            { step: "02", title: "Escrow Fund", icon: Wallet, desc: "Buyers deposit tokens into a secure Soroban contract." },
            { step: "03", title: "Delivery", icon: Package, desc: "The seller provides the item or service to the buyer." },
            { step: "04", title: "Release", icon: CheckCircle, desc: "Buyer confirms receipt and funds are instantly released." },
          ].map((s, i) => (
            <ScrollReveal key={i} delay={0.2 * i}>
              <div className="relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all group">
                <span className="absolute top-6 right-8 text-4xl font-black text-white/5 group-hover:text-blue-500/10 transition-colors uppercase tracking-widest">{s.step}</span>
                <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <s.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{s.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Interactive Marketplace Section */}
      <Suspense fallback={
        <section className="relative z-10 max-w-7xl mx-auto px-6 py-32 w-full h-[600px] flex items-center justify-center">
          <div className="text-blue-400 font-bold uppercase tracking-widest text-sm animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
            Initializing Marketplace...
          </div>
        </section>
      }>
         <MarketplaceSection />
      </Suspense>

      {/* Core Feature Cards Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-32 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Escrow Logic",
              desc: "Payments are held in a transparent contract, only released when both parties agree or a dispute is resolved.",
              icon: ShieldCheck,
              color: "text-blue-400",
              bg: "bg-blue-400/10",
            },
            {
              title: "Global Liquidity",
              desc: "Instantly tap into the Stellar network ecosystem for ultra-low fees and 24/7 global operation.",
              icon: Globe,
              color: "text-indigo-400",
              bg: "bg-indigo-400/10",
            },
            {
              title: "Ironclad Security",
              desc: "Verified Rust-based smart contracts ensure that your code is your law. No middlemen, no surprises.",
              icon: Lock,
              color: "text-purple-400",
              bg: "bg-purple-400/10",
            }
          ].map((item, i) => (
            <ScrollReveal key={i} delay={0.2 * i}>
              <div className="group p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-2xl hover:bg-white/8 hover:border-white/20 transition-all duration-700 hover:-translate-y-4 shadow-2xl relative overflow-hidden">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-inner", item.bg)}>
                  <item.icon className={cn("w-7 h-7", item.color)} />
                </div>
                <h3 className="text-3xl font-black text-white mb-4 tracking-tight">{item.title}</h3>
                <p className="text-neutral-400 leading-relaxed text-lg font-medium">{item.desc}</p>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/2 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* High-Impact CTA */}
      <section className="relative z-10 py-32 px-6 flex justify-center">
        <ScrollReveal width="100%" className="flex justify-center">
          <div className="max-w-5xl w-full p-12 md:p-20 rounded-[4rem] bg-linear-to-br from-blue-600/20 via-purple-600/10 to-transparent border border-white/10 backdrop-blur-3xl flex flex-col items-center text-center gap-8 shadow-3xl">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Ready to buy & sell securely?</h2>
            <p className="text-neutral-400 max-w-xl text-lg">
              Join thousands of users on the most secure decentralized marketplace on Stellar.
            </p>
            <Link 
              href="/auth/register" 
              className="px-12 py-5 bg-white text-black hover:bg-blue-50 font-black rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-[0.98]"
            >
              Get Started for Free
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer Branding */}
      <footer className="relative z-10 py-20 px-6 border-t border-white/5 text-center">
         <span className="text-neutral-600 font-bold tracking-widest uppercase text-xs">
           © 2026 MarketX Laboratory. All rights reserved.
         </span>
      </footer>
    </main>
  );
}
