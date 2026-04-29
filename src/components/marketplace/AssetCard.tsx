"use client";

import { motion } from "framer-motion";
import { Package, Image as ImageIcon, Code, Briefcase, Camera, Clock, Star } from "lucide-react";
import { MockAsset } from "@/lib/mockData";
import { ScrollReveal } from "../animations/ScrollReveal";
import { cn } from "@/lib/utils";

const IconMap = {
  Package,
  Image: ImageIcon,
  Code,
  Briefcase,
  Camera,
};

export default function AssetCard({ asset, delay = 0 }: { asset: MockAsset; delay?: number }) {
  const Icon = IconMap[asset.imageFallbackIcon] || Package;
  const titleId = `asset-card-title-${asset.id}`;
  const descriptionId = `asset-card-desc-${asset.id}`;

  return (
    <ScrollReveal delay={delay}>
      <article
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="group relative rounded-[2.5rem] bg-white/5 border border-white/10 overflow-hidden hover:border-blue-500/50 transition-all duration-700 hover:shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] flex flex-col h-full"
      >
        {/* Shine Effect Overlay */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/5 to-transparent skew-x-12 z-20 pointer-events-none" />
        
        <div className="h-56 bg-linear-to-br from-neutral-800 to-neutral-900 relative overflow-hidden shrink-0">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center opacity-20"
            aria-hidden="true"
          >
            <Icon className="w-16 h-16" aria-hidden="true" />
          </motion.div>
          <div className="absolute top-6 left-6 flex gap-2 z-10">
            <div className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-xl",
              asset.assetType === "Digital" ? "bg-purple-600/80 text-white" : 
              asset.assetType === "Physical" ? "bg-emerald-600/80 text-white" : 
              "bg-indigo-600/80 text-white"
            )}>
              {asset.assetType}
            </div>
          </div>
          <div className={cn(
            "absolute top-6 right-6 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-xl z-10",
            asset.escrowStatus === "Active" ? "bg-blue-600 text-white" : "bg-neutral-600 text-white"
          )}>
            {asset.escrowStatus === "Active" ? "In Escrow" : "Completed"}
          </div>
        </div>
        
        <div className="p-8 relative z-10 bg-black/40 backdrop-blur-xl flex-grow flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
              <h3 id={titleId} className="text-lg md:text-xl font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight line-clamp-2">{asset.name}</h3>
              <span className="text-xl font-black text-blue-400 shrink-0">{asset.priceAmount} {asset.priceCurrency}</span>
            </div>
            <p id={descriptionId} className="sr-only">
              {asset.assetType} asset priced at {asset.priceAmount} {asset.priceCurrency}. {asset.escrowStatus === "Active" ? "In escrow." : "Escrow completed."} Seller {asset.sellerName} has a {asset.sellerRating.toFixed(1)} star rating. Listed {asset.timeStr}.
            </p>
            <div className="flex items-center gap-1 text-sm font-bold text-yellow-400 mb-6">
              <Star className="w-4 h-4 fill-current" aria-hidden="true" />
              <span>{asset.sellerRating.toFixed(1)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-neutral-500 font-bold tracking-wide mt-auto">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5"><Clock className="w-3.5 h-3.5" aria-hidden="true" /> {asset.timeStr}</span>
            <span className="flex items-center gap-2">Seller: <span className="text-blue-200/60 uppercase">{asset.sellerName}</span></span>
          </div>
        </div>
      </article>
    </ScrollReveal>
  );
}
