"use client";

import { useFormContext } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, ShieldCheck, Cpu, Code2, Link as LinkIcon, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { ListingFormData } from "@/lib/validations/listing";
import { ScrollReveal } from "../animations/ScrollReveal";

interface Step4ReviewProps {
  isDeploying: boolean;
  isDeployed: boolean;
}

export default function Step4Review({ isDeploying, isDeployed }: Step4ReviewProps) {
  const { getValues } = useFormContext<ListingFormData>();
  const data = getValues();

  if (isDeployed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center py-20 animate-in zoom-in-95 duration-700">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl" />
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-32 h-32 rounded-full bg-linear-to-tr from-blue-600 to-indigo-500 flex items-center justify-center border-4 border-[#050505] shadow-[0_0_80px_rgba(59,130,246,0.6)] relative z-10"
          >
            <CheckCircle2 className="w-16 h-16 text-white" />
          </motion.div>
        </div>
        <h2 className="text-4xl md:text-5xl font-black mb-4 bg-linear-to-r from-white to-blue-200 bg-clip-text text-transparent">
          Asset Successfully Listed!
        </h2>
        <p className="text-neutral-400 max-w-md text-lg mb-8">
          Your Escrow smart contract has been deployed to the Stellar Network. Buyers can now securely fund this asset.
        </p>
        <div className="flex gap-4">
           <button type="button" onClick={() => window.location.href = "/"} className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10">
              Return to Marketplace
           </button>
        </div>
      </div>
    );
  }

  if (isDeploying) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center py-20">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="relative w-40 h-40 mb-10"
        >
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin duration-1000" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Cpu className="w-12 h-12 text-blue-400 animate-pulse" />
          </div>
          {/* Orbiting nodes simulate web3 tx processing */}
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-black border border-white/20 rounded-full flex items-center justify-center">
             <Code2 className="w-3 h-3 text-white" />
          </motion.div>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-black border border-white/20 rounded-full flex items-center justify-center">
             <LinkIcon className="w-3 h-3 text-white" />
          </motion.div>
        </motion.div>
        
        <h2 className="text-3xl font-black mb-2 animate-pulse">Summoning Smart Contract...</h2>
        <p className="text-neutral-400 max-w-md">
          Awaiting signature from Freighter Wallet and compiling WASM bytecodes for Soroban deployment.
        </p>
      </div>
    );
  }

  return (
    <ScrollReveal className="w-full h-full flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black mb-2">Review & Deploy</h2>
          <p className="text-neutral-400">Verify your asset terms prior to blockchain commit.</p>
        </div>
        <div className="hidden sm:flex w-14 h-14 bg-blue-500/10 rounded-full items-center justify-center border border-blue-500/20">
           <Rocket className="w-6 h-6 text-blue-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <div className="space-y-8 p-6 rounded-3xl bg-black/40 border border-white/5 shadow-inner">
          <div className="space-y-4">
             <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest border-b border-white/5 pb-2">Asset Identity</h3>
             <div>
                <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Name</span>
                <span className="text-lg font-bold text-white">{data.name}</span>
             </div>
             <div>
                <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Category</span>
                <span className="inline-block px-3 py-1 bg-white/10 text-white rounded-lg text-xs font-bold uppercase">{data.category}</span>
             </div>
             <div>
                <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Description</span>
                <p className="text-sm text-neutral-300 leading-relaxed font-medium line-clamp-3">{data.description}</p>
             </div>
          </div>
        </div>

        <div className="space-y-8 p-6 rounded-3xl bg-black/40 border border-white/5 shadow-inner">
          <div className="space-y-4">
             <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest border-b border-white/5 pb-2">Escrow Variables</h3>
             <div className="p-4 rounded-xl bg-blue-600/10 border border-blue-500/20">
                <span className="text-xs text-blue-300/70 uppercase tracking-wider block mb-1">Locked Price</span>
                <span className="text-3xl font-black text-blue-400">{data.priceAmount} <span className="text-xl">XLM</span></span>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Delivery</span>
                   <span className="text-white font-bold">{data.deliveryTimeframe} Days</span>
                </div>
                <div>
                   <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Dispute Window</span>
                   <span className="text-white font-bold">{data.disputePeriod} Days</span>
                </div>
             </div>
          </div>
          
          <div className="space-y-4">
             <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest border-b border-white/5 pb-2">Media Attached</h3>
             <div className="flex items-center gap-2 text-sm text-white font-bold">
                <ImageIcon className="w-5 h-5 text-neutral-400" />
                {data.media?.length || 0} Files ready for IPFS
             </div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex gap-3 max-w-4xl mt-4">
        <ShieldCheck className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-yellow-500 mb-1">Immutable Deployment Warning</h4>
          <p className="text-xs text-yellow-500/70 leading-relaxed">
            Please ensure all details are correct. Upon signing the transaction, a Soroban smart contract will be instantiated. Reversal of escrow parameters requires mutual multisig consensus. 
          </p>
        </div>
      </div>
    </ScrollReveal>
  );
}
