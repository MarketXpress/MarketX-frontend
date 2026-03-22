"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [role, setRole] = useState<"BUYER" | "SELLER">("BUYER");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 font-sans selection:bg-purple-500/30">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(147,51,234,0.05),transparent_50%)]" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white">Join MarketX</h1>
            <p className="text-neutral-400 text-sm">Create your decentralized account</p>
          </div>

          <div className="grid grid-cols-2 gap-4 p-1.5 bg-white/5 rounded-2xl border border-white/5">
            <button
              onClick={() => setRole("BUYER")}
              className={`py-3 rounded-xl transition-all font-medium text-sm ${
                role === "BUYER"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-neutral-500 hover:text-white"
              }`}
            >
              I am a Buyer
            </button>
            <button
              onClick={() => setRole("SELLER")}
              className={`py-3 rounded-xl transition-all font-medium text-sm ${
                role === "SELLER"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "text-neutral-500 hover:text-white"
              }`}
            >
              I am a Seller
            </button>
          </div>

          <form className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 col-span-1">
              <label className="text-xs font-medium text-neutral-400 ml-1">First Name</label>
              <input
                type="text"
                placeholder="John"
                className="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-neutral-600"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5 col-span-1">
              <label className="text-xs font-medium text-neutral-400 ml-1">Last Name</label>
              <input
                type="text"
                placeholder="Doe"
                className="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-neutral-600"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-xs font-medium text-neutral-400 ml-1">Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                className="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-neutral-600"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-xs font-medium text-neutral-400 ml-1">Password</label>
              <input
                type="password"
                placeholder="Minimum 8 characters"
                className="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-neutral-600"
                required
              />
            </div>

            <button
              type="submit"
              className={`mt-4 col-span-2 font-semibold py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg ${
                role === "BUYER"
                  ? "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20"
                  : "bg-purple-600 hover:bg-purple-500 shadow-purple-600/20"
              } text-white`}
            >
              Register as {role.charAt(0) + role.slice(1).toLowerCase()}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
