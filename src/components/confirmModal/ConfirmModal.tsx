"use client";

import React, { useEffect, useRef } from "react";

export type ConfirmModalVariant = "danger" | "warning" | "info";

export interface ConfirmModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Modal title */
  title: string;
  /** Body message */
  message: React.ReactNode;
  /** Label for the confirm action */
  confirmLabel?: string;
  /** Label for the cancel action */
  cancelLabel?: string;
  /** Visual variant that controls icon + button colour */
  variant?: ConfirmModalVariant;
  /** Shows a loading spinner on the confirm button */
  loading?: boolean;
  /** Called when user clicks confirm */
  onConfirm: () => void;
  /** Called when user clicks cancel or presses Escape */
  onCancel: () => void;
}

const variantStyles: Record<
  ConfirmModalVariant,
  { icon: React.ReactNode; confirmBtn: string; iconBg: string }
> = {
  danger: {
    iconBg: "bg-rose-100",
    icon: (
      <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
    confirmBtn: "bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500",
  },
  warning: {
    iconBg: "bg-amber-100",
    icon: (
      <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
    confirmBtn: "bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-400",
  },
  info: {
    iconBg: "bg-indigo-100",
    icon: (
      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
      </svg>
    ),
    confirmBtn: "bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500",
  },
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { icon, iconBg, confirmBtn } = variantStyles[variant];

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      data-testid="confirm-modal"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <span
            className={[
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
              iconBg,
            ].join(" ")}
          >
            {icon}
          </span>
          <div className="min-w-0">
            <h2
              id="confirm-modal-title"
              className="text-base font-semibold text-slate-900"
            >
              {title}
            </h2>
            <div className="mt-1 text-sm text-slate-500">{message}</div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700
                       transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2
                       focus-visible:ring-slate-400 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={[
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white",
              "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              "disabled:opacity-60",
              confirmBtn,
            ].join(" ")}
          >
            {loading && (
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                />
              </svg>
            )}
            {loading ? "Processing…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;