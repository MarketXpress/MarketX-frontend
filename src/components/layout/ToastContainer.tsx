"use client";

import { useToast } from "@/context/ToastContext";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "error": return <XCircle className="w-5 h-5 text-red-400" />;
      case "warning": return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case "success": return "bg-green-500/10 border-green-500/20";
      case "error": return "bg-red-500/10 border-red-500/20";
      case "warning": return "bg-yellow-500/10 border-yellow-500/20";
      default: return "bg-blue-500/10 border-blue-500/20";
    }
  };

  return (
    <div className="fixed top-20 right-6 z-50 space-y-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-2xl shadow-2xl animate-in slide-in-from-right-4 duration-300",
            getBg(toast.type)
          )}
        >
          {getIcon(toast.type)}
          <span className="text-white font-medium">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-auto p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-neutral-400" />
          </button>
        </div>
      ))}
    </div>
  );
}