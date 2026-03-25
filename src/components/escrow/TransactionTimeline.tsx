"use client";

import { motion } from "framer-motion";
import { EscrowState, ESCROW_STATES } from "@/lib/escrowData";
import { cn } from "@/lib/utils";

interface TransactionTimelineProps {
  currentState: EscrowState;
}

export default function TransactionTimeline({ currentState }: TransactionTimelineProps) {
  const currentIndex = ESCROW_STATES.findIndex((s) => s.state === currentState);
  const isDisputed = currentState === "disputed";

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Background track */}
        <div className="absolute top-5 left-5 right-5 h-1 bg-white/10 rounded-full z-0" />
        {/* Active track */}
        <motion.div
          className={cn(
            "absolute top-5 left-5 h-1 rounded-full z-[1]",
            isDisputed ? "bg-red-500" : "bg-blue-500"
          )}
          initial={{ width: "0%" }}
          animate={{
            width: `${(Math.min(currentIndex, ESCROW_STATES.length - 1) / (ESCROW_STATES.length - 1)) * 100}%`,
          }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: "calc(100% - 40px)" }}
        />

        {ESCROW_STATES.map((step, index) => {
          const isCompleted = currentIndex > index;
          const isActive = currentIndex === index;

          return (
            <div key={step.state} className="flex flex-col items-center gap-3 relative z-10">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.15, duration: 0.5, type: "spring" }}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-500 border-2",
                  isCompleted
                    ? "bg-blue-600 border-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                    : isActive
                    ? isDisputed
                      ? "bg-red-600/20 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                      : "bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                    : "bg-[#111] border-white/10"
                )}
              >
                {isDisputed && isActive ? "⚠️" : step.icon}
              </motion.div>
              <span
                className={cn(
                  "text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap",
                  isCompleted || isActive ? "text-white" : "text-neutral-600"
                )}
              >
                {isDisputed && isActive ? "Disputed" : step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
