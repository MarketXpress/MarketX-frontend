"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export type ToastVariant = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextType {
  toast: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback((payload: Omit<ToastItem, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((current) => [...current, { id, ...payload }]);

    window.setTimeout(() => {
      removeToast(id);
    }, 4200);
  }, [removeToast]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
        <AnimatePresence>
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden rounded-3xl border border-white/10 bg-black/95 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-start gap-3 p-4">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-2xl ${
                    item.variant === "success"
                      ? "bg-emerald-500/10 text-emerald-300"
                      : item.variant === "error"
                      ? "bg-rose-500/10 text-rose-300"
                      : "bg-blue-500/10 text-blue-300"
                  }`}
                >
                  {item.variant === "success" ? "✓" : item.variant === "error" ? "!" : "i"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  {item.description ? (
                    <p className="mt-1 text-sm text-neutral-400">{item.description}</p>
                  ) : null}
                </div>
                <button
                  onClick={() => removeToast(item.id)}
                  className="rounded-full p-1 text-neutral-400 hover:text-white transition-colors"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
