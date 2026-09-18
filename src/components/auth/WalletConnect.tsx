"use client";

import { useState, useEffect } from "react";
import { isConnected, getAddress } from "@stellar/freighter-api";
import { Wallet, LogOut, CheckCircle2, Loader2 } from "lucide-react";
import { formatAddress } from "@/lib/utils";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

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

  useEffect(() => {
    checkConnection();
  }, []);

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
    <>
      <ConfirmModal
        isOpen={showDisconnectConfirm}
        title="Disconnect Wallet?"
        description="You will be disconnected from your Stellar Freighter wallet. You can reconnect at any time."
        confirmLabel="Disconnect"
        variant="warning"
        onConfirm={() => { setShowDisconnectConfirm(false); disconnect(); }}
        onCancel={() => setShowDisconnectConfirm(false)}
      />

      <div className="relative group">
        {!address ? (
          <button
            onClick={connect}
            disabled={loading}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-on-accent px-4 py-2 rounded-lg transition-colors font-semibold text-sm active:scale-95"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wallet className="w-4 h-4" />
            )}
            Connect Wallet
          </button>
        ) : (
          <div className="flex items-center gap-3 bg-surface border border-line px-3 py-1.5 rounded-lg">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-ink-faint font-bold uppercase tracking-wider">Stellar Connected</span>
              <span className="text-ink text-sm font-semibold">{formatAddress(address)}</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-accent-soft flex items-center justify-center border border-accent-line">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
            </div>
            <button
              onClick={() => setShowDisconnectConfirm(true)}
              className="ml-1 p-1.5 hover:bg-surface-2 rounded-lg transition-colors text-ink-faint hover:text-bad"
              aria-label="Disconnect wallet"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
