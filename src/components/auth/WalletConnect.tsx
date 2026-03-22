"use client";

import { useState, useEffect } from "react";
import { isConnected, getAddress } from "@stellar/freighter-api";
import { Wallet, LogOut, CheckCircle2, Loader2 } from "lucide-react";
import { cn, formatAddress } from "@/lib/utils";

export default function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasFreighter, setHasFreighter] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      if (await isConnected()) {
        const { address } = await getAddress();
        if (address) setAddress(address);
      }
    } catch (e) {
      console.error("Freighter check failed", e);
    }
  };

  const connect = async () => {
    setLoading(true);
    try {
      const { address, error } = await getAddress();
      if (error) {
        console.error(error);
      } else if (address) {
        setAddress(address);
      }
    } catch (e) {
      console.error("Connection failed", e);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
  };

  return (
    <div className="relative group">
      {!address ? (
        <button
          onClick={connect}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-2xl transition-all font-medium text-sm shadow-lg shadow-blue-600/20 active:scale-95 border border-white/10"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Wallet className="w-4 h-4" />
          )}
          Connect Wallet
        </button>
      ) : (
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Stellar Connected</span>
            <span className="text-white text-sm font-semibold">{formatAddress(address)}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center border border-white/20">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          
          {/* Disconnect hover card potential or simple button */}
          <button 
            onClick={disconnect}
            className="ml-1 p-1.5 hover:bg-white/10 rounded-lg transition-colors text-neutral-400 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
