"use client";

import Link from "next/link";
import { useState } from "react";

type FormErrors = {
  email?: string;
  password?: string;
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({ email: false, password: false });

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      console.log("Login with:", email, password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 font-sans selection:bg-blue-500/30">
      {/* Background radial gradient for depth */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center mb-4">
            <h1 className="text-4xl font-bold tracking-tight text-white">Welcome Back</h1>
            <p className="text-neutral-400 text-sm">Sign in to your MarketX account</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-medium text-neutral-400 ml-1">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                placeholder="name@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={`bg-white/5 border text-white px-4 py-3 rounded-xl outline-none focus:ring-2 transition-all placeholder:text-neutral-600 ${
                  errors.email && touched.email
                    ? "border-red-500/50 focus:ring-red-500/20"
                    : "border-white/10 focus:ring-blue-500/50"
                }`}
                required
              />
              {errors.email && touched.email && (
                <p id="email-error" className="text-xs text-red-500 font-medium" role="alert">{errors.email}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-medium text-neutral-400 ml-1">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                className={`bg-white/5 border text-white px-4 py-3 rounded-xl outline-none focus:ring-2 transition-all placeholder:text-neutral-600 ${
                  errors.password && touched.password
                    ? "border-red-500/50 focus:ring-red-500/20"
                    : "border-white/10 focus:ring-blue-500/50"
                }`}
                required
              />
              {errors.password && touched.password && (
                <p id="password-error" className="text-xs text-red-500 font-medium" role="alert">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between mt-1 px-1">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" className="rounded border-white/10 bg-white/5" aria-label="Remember me" />
                <label htmlFor="remember" className="text-xs text-neutral-400">Remember me</label>
              </div>
              <Link href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20"
            >
              Sign In
            </button>
          </form>

          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <span className="relative px-3 bg-[#050505]/50 text-[10px] uppercase tracking-widest text-neutral-500 backdrop-blur-sm">
              or continue with
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <button type="button" className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white py-2.5 rounded-xl hover:bg-white/10 transition-all text-sm font-medium">
               Google
             </button>
             <button type="button" className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white py-2.5 rounded-xl hover:bg-white/10 transition-all text-sm font-medium">
               Github
             </button>
          </div>

          <p className="text-center text-sm text-neutral-500 mt-2">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
