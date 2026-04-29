"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  Send,
  Wallet,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import {
  EscrowState,
  EscrowTransaction,
  mockTransaction,
} from "@/lib/escrowData";
import { cn } from "@/lib/utils";
import TransactionTimeline from "./TransactionTimeline";
import CountdownTimer from "./CountdownTimer";
import ConfettiSuccess from "./ConfettiSuccess";
import EventLog from "./EventLog";
import { useToast } from "@/context/ToastContext";

type ViewRole = "buyer" | "seller";

interface OrderDetailsProps {
  initialTransaction?: EscrowTransaction;
}

export default function OrderDetails({
  initialTransaction = mockTransaction,
}: OrderDetailsProps = {}) {
  const [transaction, setTransaction] =
    useState<EscrowTransaction>(initialTransaction);
  const [viewRole, setViewRole] = useState<ViewRole>("buyer");
  const [showConfetti, setShowConfetti] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleConfirmReceipt = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setTransaction((prev) => ({
      ...prev,
      currentState: "released" as EscrowState,
      events: [
        ...prev.events,
        {
          id: `ev-${prev.events.length + 1}`,
          state: "released" as EscrowState,
          label: "Funds Released",
          timestamp: new Date().toISOString(),
          actor: "buyer" as const,
          description:
            "Buyer confirmed receipt. Escrowed 2,500 XLM released to the seller's wallet.",
        },
      ],
    }));
    setIsProcessing(false);
    setShowConfetti(true);
    toast({
      title: "Receipt confirmed",
      description: "Funds have been released from escrow.",
      variant: "success",
    });
  };

  const handleOpenDispute = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setTransaction((prev) => ({
      ...prev,
      currentState: "disputed" as EscrowState,
      events: [
        ...prev.events,
        {
          id: `ev-${prev.events.length + 1}`,
          state: "disputed" as EscrowState,
          label: "Dispute Opened",
          timestamp: new Date().toISOString(),
          actor: "buyer" as const,
          description:
            "Buyer raised a dispute. The escrow is now frozen pending arbitration.",
        },
      ],
    }));
    setIsProcessing(false);
    toast({
      title: "Dispute opened",
      description: "The transaction has been frozen pending arbitration.",
      variant: "info",
    });
  };

  const handleSubmitDelivery = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setTransaction((prev) => ({
      ...prev,
      currentState: "in_transit" as EscrowState,
      events: [
        ...prev.events,
        {
          id: `ev-${prev.events.length + 1}`,
          state: "in_transit" as EscrowState,
          label: "Delivery Proof Submitted",
          timestamp: new Date().toISOString(),
          actor: "seller" as const,
          description:
            "Seller submitted proof of delivery. Awaiting buyer confirmation.",
        },
      ],
    }));
    setIsProcessing(false);
    toast({
      title: "Delivery submitted",
      description: "Your proof of delivery has been recorded.",
      variant: "success",
    });
  };

  const closeConfetti = useCallback(() => setShowConfetti(false), []);

  const needsAction = () => {
    if (
      transaction.currentState === "released" ||
      transaction.currentState === "disputed"
    )
      return null;
    if (transaction.currentState === "in_escrow") return "seller";
    if (transaction.currentState === "in_transit") return "buyer";
    return null;
  };

  const actionNeeded = needsAction();

  return (
    <div className="space-y-10">
      <ConfettiSuccess show={showConfetti} onClose={closeConfetti} />

      {/* Role Switcher */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-neutral-500 uppercase tracking-widest font-bold">
          Viewing as:
        </span>
        <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
          {(["buyer", "seller"] as ViewRole[]).map((role) => (
            <button
              key={role}
              onClick={() => setViewRole(role)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                viewRole === role
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-neutral-400 hover:text-white",
              )}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
        <TransactionTimeline currentState={transaction.currentState} />
      </div>

      {/* Status + Action Banner */}
      {actionNeeded && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
            actionNeeded === viewRole
              ? "bg-blue-500/10 border-blue-500/30"
              : "bg-white/5 border-white/10",
          )}
        >
          <div className="flex items-center gap-3">
            {actionNeeded === viewRole ? (
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center animate-pulse shrink-0">
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 text-neutral-400" />
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-white">
                {actionNeeded === viewRole
                  ? "Action Required — It's your turn"
                  : `Waiting for the ${actionNeeded}`}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {actionNeeded === "buyer"
                  ? "The buyer must confirm receipt or open a dispute."
                  : "The seller must submit delivery proof."}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details + Events */}
        <div className="lg:col-span-2 space-y-6">
          {/* Asset Details Card */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl shadow-inner space-y-4">
            <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest border-b border-white/5 pb-2">
              Asset Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-neutral-500 uppercase block mb-1">
                  Name
                </span>
                <span className="text-lg font-bold text-white">
                  {transaction.assetName}
                </span>
              </div>
              <div>
                <span className="text-xs text-neutral-500 uppercase block mb-1">
                  Category
                </span>
                <span className="inline-block px-3 py-1 bg-white/10 text-white rounded-lg text-xs font-bold uppercase">
                  {transaction.assetCategory}
                </span>
              </div>
              <div>
                <span className="text-xs text-neutral-500 uppercase block mb-1">
                  Contract ID
                </span>
                <span className="text-sm font-mono text-blue-400">
                  {transaction.id}
                </span>
              </div>
              <div>
                <span className="text-xs text-neutral-500 uppercase block mb-1">
                  Escrowed Amount
                </span>
                <span className="text-2xl font-black text-blue-400">
                  {transaction.priceXLM.toLocaleString()}{" "}
                  <span className="text-base">XLM</span>
                </span>
              </div>
            </div>
          </div>

          {/* Event Log */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl shadow-inner">
            <EventLog events={transaction.events} />
          </div>
        </div>

        {/* Right: Actions + Timer */}
        <div className="space-y-6">
          {/* Parties */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl shadow-inner space-y-4">
            <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest border-b border-white/5 pb-2">
              Parties
            </h3>
            <div>
              <span className="text-xs text-neutral-500 uppercase block mb-1">
                Buyer
              </span>
              <p className="text-sm font-bold text-white">
                {transaction.buyer.name}
              </p>
              <p className="text-xs font-mono text-neutral-500">
                {transaction.buyer.address}
              </p>
            </div>
            <div>
              <span className="text-xs text-neutral-500 uppercase block mb-1">
                Seller
              </span>
              <p className="text-sm font-bold text-white">
                {transaction.seller.name}
              </p>
              <p className="text-xs font-mono text-neutral-500">
                {transaction.seller.address}
              </p>
            </div>
          </div>

          {/* Countdown Timer */}
          {transaction.currentState !== "released" &&
            transaction.currentState !== "disputed" && (
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl shadow-inner">
                <CountdownTimer
                  targetDate={transaction.autoReleaseAt}
                  label="Auto-release in"
                />
              </div>
            )}

          {/* Action Buttons */}
          {transaction.currentState !== "released" &&
            transaction.currentState !== "disputed" && (
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl shadow-inner space-y-4">
                <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest border-b border-white/5 pb-2">
                  Actions
                </h3>

                {viewRole === "buyer" &&
                  transaction.currentState === "in_transit" && (
                    <div className="space-y-3">
                      <button
                        onClick={handleConfirmReceipt}
                        disabled={isProcessing}
                        className={cn(
                          "w-full px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95",
                          isProcessing
                            ? "bg-green-600/50 text-white/50 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/30",
                        )}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {isProcessing ? "Processing…" : "Confirm Receipt"}
                      </button>
                      <button
                        onClick={handleOpenDispute}
                        disabled={isProcessing}
                        className={cn(
                          "w-full px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95",
                          isProcessing
                            ? "bg-red-600/50 text-white/50 cursor-not-allowed"
                            : "bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30",
                        )}
                      >
                        <ShieldAlert className="w-4 h-4" />
                        {isProcessing ? "Processing…" : "Open Dispute"}
                      </button>
                    </div>
                  )}

                {viewRole === "seller" &&
                  transaction.currentState === "in_escrow" && (
                    <button
                      onClick={handleSubmitDelivery}
                      disabled={isProcessing}
                      className={cn(
                        "w-full px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95",
                        isProcessing
                          ? "bg-blue-600/50 text-white/50 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30",
                      )}
                    >
                      <Send className="w-4 h-4" />
                      {isProcessing ? "Submitting…" : "Submit Delivery Proof"}
                    </button>
                  )}

                {viewRole === "buyer" &&
                  transaction.currentState !== "in_transit" && (
                    <p className="text-xs text-neutral-500 text-center py-2">
                      Waiting for seller to submit delivery proof before you can
                      act.
                    </p>
                  )}
                {viewRole === "seller" &&
                  transaction.currentState !== "in_escrow" && (
                    <p className="text-xs text-neutral-500 text-center py-2">
                      Delivery proof submitted. Awaiting buyer confirmation.
                    </p>
                  )}
              </div>
            )}

          {/* Completed / Disputed state */}
          {transaction.currentState === "released" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-green-500/10 border border-green-500/20 rounded-3xl text-center space-y-2"
            >
              <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto" />
              <h3 className="text-lg font-black text-green-400">
                Transaction Complete
              </h3>
              <p className="text-xs text-green-300/60">
                Funds have been released to the seller.
              </p>
            </motion.div>
          )}

          {transaction.currentState === "disputed" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-center space-y-2"
            >
              <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
              <h3 className="text-lg font-black text-red-400">
                Dispute Active
              </h3>
              <p className="text-xs text-red-300/60">
                This escrow is frozen pending arbitration.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
