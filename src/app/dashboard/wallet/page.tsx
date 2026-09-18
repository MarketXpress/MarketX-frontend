"use client";

import { useState } from "react";
import { Copy, ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import DashboardSubnav from "@/components/dashboard/DashboardSubnav";

const MOCK_ADDRESS = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGAMC3LHMNQTM8OR";

const MOCK_TXS = [
  { id: "1", type: "received", label: "Payment received", amount: "+200 XLM", usd: "+$41.20", date: "Jun 15, 2026", from: "art_node" },
  { id: "2", type: "sent", label: "Escrow funded", amount: "-450 XLM", usd: "-$92.70", date: "Jun 14, 2026", from: "Samsung Galaxy A55" },
  { id: "3", type: "received", label: "Escrow released", amount: "+88 XLM", usd: "+$18.13", date: "Jun 12, 2026", from: "SoleKing" },
  { id: "4", type: "sent", label: "Escrow funded", amount: "-193 XLM", usd: "-$39.77", date: "Jun 10, 2026", from: "Sony WH-1000XM5" },
];

export default function WalletPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(MOCK_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-bg">
      <div className="pt-14">
        <DashboardSubnav title="My Account" />

        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Balance card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-accent-soft rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold text-ink-faint uppercase tracking-wider">
                  Stellar Wallet
                </span>
              </div>
              <p className="text-3xl font-black text-white tracking-tight mb-0.5">
                4,200 XLM
              </p>
              <p className="text-sm text-ink-faint mb-5">≈ $866.04 USD</p>

              {/* Address */}
              <div className="flex items-center gap-2 bg-surface/10 rounded-lg px-3 py-2">
                <span className="text-[11px] text-ink-faint font-mono flex-1 truncate">
                  {MOCK_ADDRESS.slice(0, 12)}…{MOCK_ADDRESS.slice(-6)}
                </span>
                <button
                  onClick={handleCopy}
                  className="text-ink-faint hover:text-white transition-colors shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {copied && (
                  <span className="text-[10px] text-accent font-semibold">
                    Copied!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {(
              [
                { label: "Connect Wallet", Icon: Wallet },
                { label: "Deposit", Icon: ArrowDownLeft },
                { label: "Withdraw", Icon: ArrowUpRight },
              ] as const
            ).map(({ label, Icon }) => (
              <button
                key={label}
                className="flex flex-col items-center gap-1.5 bg-surface border border-line rounded-xl py-4 hover:border-accent hover:bg-accent-soft transition-colors group"
              >
                <Icon className="w-5 h-5 text-ink-faint group-hover:text-accent-hover transition-colors" />
                <span className="text-xs font-bold text-ink-muted group-hover:text-accent-hover transition-colors">
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* Transaction history */}
          <div className="bg-surface border border-line rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-line">
              <h2 className="text-sm font-black text-ink">Transaction History</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {MOCK_TXS.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      tx.type === "received" ? "bg-accent-soft" : "bg-surface-2"
                    }`}
                  >
                    {tx.type === "received" ? (
                      <ArrowDownLeft className="w-4 h-4 text-accent" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-ink-faint" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-ink">{tx.label}</p>
                    <p className="text-[11px] text-ink-faint">
                      {tx.from} · {tx.date}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-black ${
                        tx.type === "received" ? "text-accent" : "text-ink-muted"
                      }`}
                    >
                      {tx.amount}
                    </p>
                    <p className="text-[11px] text-ink-faint">{tx.usd}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
