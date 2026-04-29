"use client";

import { useEffect, ElementType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfirmModalVariant = "danger" | "warning" | "default";

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmModalVariant;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantConfig: Record<
  ConfirmModalVariant,
  { icon: ElementType; iconClass: string; confirmClass: string }
> = {
  danger: {
    icon: ShieldAlert,
    iconClass: "text-red-400 bg-red-500/10",
    confirmClass:
      "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-400 bg-amber-500/10",
    confirmClass:
      "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30",
  },
  default: {
    icon: Info,
    iconClass: "text-blue-400 bg-blue-500/10",
    confirmClass:
      "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30",
  },
};

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { icon: Icon, iconClass, confirmClass } = variantConfig[variant];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-description"
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center gap-5">
              <div
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center",
                  iconClass,
                )}
              >
                <Icon className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h2
                  id="confirm-modal-title"
                  className="text-lg font-black text-white"
                >
                  {title}
                </h2>
                <p
                  id="confirm-modal-description"
                  className="text-sm text-neutral-400 leading-relaxed"
                >
                  {description}
                </p>
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={onCancel}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-neutral-300 transition-all border border-white/10 active:scale-95"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  className={cn(
                    "flex-1 px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95",
                    confirmClass,
                  )}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
