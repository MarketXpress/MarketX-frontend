"use client";

import { useFormContext } from "react-hook-form";
import { ListingFormData } from "@/lib/validations/listing";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "../animations/ScrollReveal";

export default function Step2Pricing() {
  const { register, formState: { errors } } = useFormContext<ListingFormData>();

  return (
    <ScrollReveal className="w-full h-full flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-3xl font-black mb-2">Pricing & Escrow Terms</h2>
        <p className="text-neutral-400">Define the financial terms and conditions of your Soroban contract.</p>
      </div>

      <div className="space-y-8 max-w-2xl">
        {/* Price Input */}
        <div className="space-y-2 relative">
          <label className="text-sm font-bold text-neutral-300 uppercase tracking-wider">Asset Price</label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              {...register("priceAmount", { valueAsNumber: true })}
              placeholder="0.00"
              className={cn(
                "w-full bg-black/50 border rounded-xl pl-4 pr-16 py-4 text-2xl font-black text-white placeholder:text-neutral-600 outline-none transition-all focus:ring-2",
                errors.priceAmount ? "border-red-500/50 focus:ring-red-500/20" : "border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20"
              )}
            />
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <span className="text-lg font-bold text-neutral-500">XLM</span>
            </div>
          </div>
          {errors.priceAmount && <p className="text-xs text-red-500 font-medium">{errors.priceAmount.message}</p>}
        </div>

        <div className="h-px w-full bg-white/5" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Delivery Timeframe */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-300 uppercase tracking-wider">Delivery Timeframe</label>
            <div className="relative">
              <input
                type="number"
                {...register("deliveryTimeframe", { valueAsNumber: true })}
                placeholder="e.g. 7"
                className={cn(
                  "w-full bg-black/50 border rounded-xl pl-4 pr-14 py-3 text-white placeholder:text-neutral-600 outline-none transition-all focus:ring-2",
                  errors.deliveryTimeframe ? "border-red-500/50 focus:ring-red-500/20" : "border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20"
                )}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-500">Days</span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">Time allowed to deliver the asset after escrow funding.</p>
            {errors.deliveryTimeframe && <p className="text-xs text-red-500 font-medium">{errors.deliveryTimeframe.message}</p>}
          </div>

          {/* Dispute Period */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-300 uppercase tracking-wider">Dispute Period</label>
            <div className="relative">
              <input
                type="number"
                {...register("disputePeriod", { valueAsNumber: true })}
                placeholder="e.g. 3"
                className={cn(
                  "w-full bg-black/50 border rounded-xl pl-4 pr-14 py-3 text-white placeholder:text-neutral-600 outline-none transition-all focus:ring-2",
                  errors.disputePeriod ? "border-red-500/50 focus:ring-red-500/20" : "border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20"
                )}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-500">Days</span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">Duration the buyer has to dispute after delivery.</p>
            {errors.disputePeriod && <p className="text-xs text-red-500 font-medium">{errors.disputePeriod.message}</p>}
          </div>
        </div>

        {/* Information Callout */}
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3">
          <div className="text-blue-400 mt-0.5 font-bold">ℹ</div>
          <div>
            <h4 className="text-sm font-bold text-blue-300 mb-1">Contract Enforced</h4>
            <p className="text-xs text-blue-200/70 leading-relaxed">
              Upon deployment, these terms are hardcoded into the Soroban escrow contract and cannot be altered by either party once funded.
            </p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
