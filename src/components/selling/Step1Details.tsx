"use client";

import { useFormContext } from "react-hook-form";
import { ListingFormData } from "@/lib/validations/listing";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "../animations/ScrollReveal";

export default function Step1Details() {
  const { register, watch, formState: { errors } } = useFormContext<ListingFormData>();
  
  const descriptionValue = watch("description") || "";
  const currentCategory = watch("category");

  return (
    <ScrollReveal className="w-full h-full flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-3xl font-black mb-2">Asset Details</h2>
        <p className="text-neutral-400">Provide the core metadata that defines your asset.</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Name Input */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-neutral-300 uppercase tracking-wider">Asset Name</label>
          <input
            {...register("name")}
            placeholder="e.g. Digital Artwork #042"
            className={cn(
              "w-full bg-black/50 border rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 outline-none transition-all focus:ring-2",
              errors.name ? "border-red-500/50 focus:ring-red-500/20" : "border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20"
            )}
          />
          {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
        </div>

        {/* Category Selector */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-neutral-300 uppercase tracking-wider">Category</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {["Digital", "Physical", "Service"].map((cat) => (
              <label 
                key={cat} 
                className={cn(
                  "cursor-pointer px-4 py-3 rounded-xl border text-center transition-all font-bold text-sm",
                  currentCategory === cat 
                    ? "bg-blue-600/10 border-blue-500 text-blue-400" 
                    : "bg-black/50 border-white/10 text-neutral-400 hover:border-white/30"
                )}
              >
                <input type="radio" value={cat} {...register("category")} className="hidden" />
                {cat}
              </label>
            ))}
          </div>
          {errors.category && <p className="text-xs text-red-500 font-medium">{errors.category.message}</p>}
        </div>

        {/* Description Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-neutral-300 uppercase tracking-wider">Description</label>
            <span className={cn(
              "text-xs font-bold",
              descriptionValue.length > 500 ? "text-red-500" : "text-neutral-500"
            )}>
              {descriptionValue.length} / 500
            </span>
          </div>
          <textarea
            {...register("description")}
            rows={5}
            placeholder="Describe your asset in detail to establish trust with buyers..."
            className={cn(
              "w-full bg-black/50 border rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 outline-none transition-all focus:ring-2 resize-none",
              errors.description ? "border-red-500/50 focus:ring-red-500/20" : "border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20"
            )}
          />
          {errors.description && <p className="text-xs text-red-500 font-medium">{errors.description.message}</p>}
        </div>
      </div>
    </ScrollReveal>
  );
}
