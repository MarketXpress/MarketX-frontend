"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authApi, ApiError } from "@/lib/api";

type FormErrors = { email?: string; password?: string; form?: string };

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const prefillEmail = searchParams.get("email") ?? "";
  const justRegistered = searchParams.get("registered") === "1";

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({ email: false, password: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e: FormErrors = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Must be at least 8 characters";
    return e;
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setIsSubmitting(true);
    try {
      const { accessToken, refreshToken } = await authApi.login({ email, password });
      login(accessToken, refreshToken);
      router.push("/dashboard/orders");
    } catch (err) {
      let message: string;
      if (err instanceof ApiError) {
        message = err.status === 401 ? "Invalid email or password" : err.message;
      } else if (err instanceof TypeError && err.message.includes("fetch")) {
        message = "Cannot reach the server. Make sure the backend is running.";
      } else {
        message = "Something went wrong. Please try again.";
      }
      setErrors({ form: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = (field: keyof FormErrors, isTouched: boolean) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white placeholder:text-gray-400 outline-none focus:ring-2 transition-all ${
      errors[field] && isTouched
        ? "border-red-300 focus:ring-red-100"
        : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-100"
    }`;

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-[42%] bg-gray-900 flex-col justify-between p-10">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-black text-white">MarketXpress</span>
        </div>
        <div>
          <p className="text-3xl font-black text-white leading-tight tracking-tight mb-3">
            &ldquo;Trade anything.<br />Risk nothing.&rdquo;
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            Every transaction on MarketXpress is secured by Stellar smart contract escrow. Your payment only releases when you confirm delivery.
          </p>
        </div>
        <p className="text-xs text-gray-600">&copy; 2026 MarketXpress</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-sm">
          <div className="mb-7">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Welcome back</h1>
            <p className="text-sm text-gray-500">Sign in to your MarketXpress account</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {justRegistered && (
              <div className="px-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
                Account created! Sign in to continue.
              </div>
            )}
            {errors.form && (
              <div role="alert" className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {errors.form}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                placeholder="name@example.com"
                className={fieldClass("email", touched.email)}
                aria-invalid={!!errors.email && touched.email}
                aria-describedby={errors.email && touched.email ? "login-email-error" : undefined}
              />
              {errors.email && touched.email && (
                <p id="login-email-error" className="text-xs text-red-600 mt-1" role="alert">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-xs font-bold text-gray-700">
                  Password
                </label>
                <Link href="#" className="text-xs text-emerald-600 hover:text-emerald-700">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                placeholder="••••••••"
                className={fieldClass("password", touched.password)}
                aria-invalid={!!errors.password && touched.password}
                aria-describedby={errors.password && touched.password ? "login-password-error" : undefined}
              />
              {errors.password && touched.password && (
                <p id="login-password-error" className="text-xs text-red-600 mt-1" role="alert">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="rounded border-gray-300 text-emerald-600"
              />
              <label htmlFor="remember" className="text-xs text-gray-500">Remember me</label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <span className="relative flex justify-center bg-white px-3 text-[11px] text-gray-400 uppercase tracking-widest">
              or continue with
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6">
            {["Google", "GitHub"].map((p) => (
              <button
                key={p}
                type="button"
                className="flex items-center justify-center gap-1.5 border border-gray-200 rounded-lg py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-emerald-600 font-bold hover:text-emerald-700">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
