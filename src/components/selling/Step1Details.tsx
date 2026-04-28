"use client";

import { useFormContext } from "react-hook-form";
import { ListingFormData } from "@/lib/validations/listing";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { ScrollReveal } from "../animations/ScrollReveal";

export default function Step1Details() {
  const { register, watch, formState: { errors, touchedFields, dirtyFields } } = useFormContext<ListingFormData>();
  const isFieldValid = (field: keyof ListingFormData) =>
    !errors[field] && (touchedFields[field] || dirtyFields[field]);

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
          <label htmlFor="asset-name" className="text-sm font-bold text-neutral-300 uppercase tracking-wider">Asset Name</label>
          <div className="relative">
            <input
              id="asset-name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "asset-name-error" : "asset-name-hint"}
              {...register("name")}
              placeholder="e.g. Digital Artwork #042"
              className={cn(
                "w-full bg-black/50 border rounded-xl px-4 py-3 pr-10 text-white placeholder:text-neutral-600 outline-none transition-all focus:ring-2",
                errors.name
                  ? "border-red-500/50 focus:ring-red-500/20"
                  : isFieldValid("name")
                  ? "border-green-500/50 focus:ring-green-500/20"
                  : "border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20"
              )}
            />
            {isFieldValid("name") && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" aria-hidden="true" />
            )}
          </div>
          <p id="asset-name-hint" className="text-xs text-neutral-500">Give your asset a clear, descriptive name buyers will recognise.</p>
          {errors.name && <p id="asset-name-error" className="text-xs text-red-500 font-medium" role="alert">{errors.name.message}</p>}
        </div>

        {/* Category Selector */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-bold text-neutral-300 uppercase tracking-wider">Category</legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-describedby={errors.category ? "category-error" : undefined}>
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
                <input type="radio" value={cat} {...register("category")} className="sr-only" />
                {cat}
              </label>
            ))}
          </div>
          {errors.category && <p id="category-error" className="text-xs text-red-500 font-medium" role="alert">{errors.category.message}</p>}
        </fieldset>

        {/* Description Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="asset-description" className="text-sm font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              Description
              {isFieldValid("description") && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" aria-hidden="true" />}
            </label>
            <span className={cn(
              "text-xs font-bold",
              descriptionValue.length > 500 ? "text-red-500" : descriptionValue.length > 400 ? "text-amber-400" : "text-neutral-500"
            )}>
              {descriptionValue.length} / 500
            </span>
          </div>
          <textarea
            id="asset-description"
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? "asset-description-error" : "asset-description-hint"}
            {...register("description")}
            rows={5}
            placeholder="Describe your asset in detail to establish trust with buyers..."
            className={cn(
              "w-full bg-black/50 border rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 outline-none transition-all focus:ring-2 resize-none",
              errors.description
                ? "border-red-500/50 focus:ring-red-500/20"
                : isFieldValid("description")
                ? "border-green-500/50 focus:ring-green-500/20"
                : "border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20"
            )}
          />
          <p id="asset-description-hint" className="text-xs text-neutral-500">Minimum 20 characters. Be specific about condition, format, and delivery method.</p>
          {errors.description && <p id="asset-description-error" className="text-xs text-red-500 font-medium" role="alert">{errors.description.message}</p>}
        </div>
      </div>
    </ScrollReveal>
  );
}
