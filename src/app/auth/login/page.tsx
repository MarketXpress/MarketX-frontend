"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type FormErrors = { email?: string; password?: string; form?: string };

/**
 * Turns a Supabase auth error into something a person can act on.
 *
 * "Invalid login credentials" is returned for both a wrong password and an
 * unknown email — deliberately, so the form cannot be used to discover which
 * addresses have accounts. The message here preserves that.
 */
function signInErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";

  if (/invalid login credentials/i.test(message)) return "Invalid email or password";
  if (/email not confirmed/i.test(message)) {
    return "Check your inbox and confirm your email before signing in.";
  }
  if (/failed to fetch|network/i.test(message)) {
    return "Cannot reach the server. Check your connection and try again.";
  }
  return message || "Something went wrong. Please try again.";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();

  const prefillEmail = searchParams.get("email") ?? "";
  const justRegistered = searchParams.get("registered") === "1";

  /**
   * Where to go after signing in.
   *
   * Set by the middleware when it turns an unauthenticated visitor away from a
   * protected page, so they land where they were heading rather than on a
   * generic dashboard.
   *
   * Only same-origin paths are honoured. Redirecting to whatever the query
   * string says is an open redirect — an attacker sends
   * `?returnUrl=https://evil.example` and the site itself delivers the user
   * there, wearing our domain in the address bar on the way.
   */
  const rawReturnUrl = searchParams.get("returnUrl") ?? "";
  const returnUrl =
    rawReturnUrl.startsWith("/") && !rawReturnUrl.startsWith("//")
      ? rawReturnUrl
      : "/dashboard/orders";

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
      await signIn(email, password);
      // Refresh so server components re-render against the new session cookie
      // before the dashboard reads it.
      router.refresh();
      router.push(returnUrl);
    } catch (err) {
      setErrors({ form: signInErrorMessage(err) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = (field: keyof FormErrors, isTouched: boolean) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm text-ink bg-surface placeholder:text-ink-faint outline-none focus:ring-2 transition-all ${
      errors[field] && isTouched
        ? "border-red-300 focus:ring-red-100"
        : "border-line focus:border-accent"
    }`;

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-[42%] bg-ink flex-col justify-between p-10">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-sm font-black text-white">MarketXpress</span>
        </div>
        <div>
          <p className="text-3xl font-black text-white leading-tight tracking-tight mb-3">
            &ldquo;Trade anything.<br />Risk nothing.&rdquo;
          </p>
          <p className="text-sm text-ink-faint leading-relaxed">
            Every transaction on MarketXpress is secured by Stellar smart contract escrow. Your payment only releases when you confirm delivery.
          </p>
        </div>
        <p className="text-xs text-ink-muted">&copy; 2026 MarketXpress</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-surface p-6">
        <div className="w-full max-w-sm">
          <div className="mb-7">
            <h1 className="text-2xl font-black text-ink tracking-tight mb-1">Welcome back</h1>
            <p className="text-sm text-ink-faint">Sign in to your MarketXpress account</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {justRegistered && (
              <div className="px-3 py-2.5 rounded-lg bg-accent-soft border border-accent-line text-accent text-sm font-semibold">
                Account created! Sign in to continue.
              </div>
            )}
            {errors.form && (
              <div role="alert" className="px-3 py-2.5 rounded-lg bg-bad-bg border border-bad-line text-bad text-sm">
                {errors.form}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-ink-muted mb-1.5">
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
                aria-describedby={errors.email && touched.email ? "email-error" : undefined}
                aria-invalid={!!errors.email}
              />
              {errors.email && touched.email && (
                <p id="email-error" className="text-xs text-bad mt-1" role="alert">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-xs font-bold text-ink-muted">
                  Password
                </label>
                <Link href="#" className="text-xs text-accent hover:text-accent-hover">
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
                aria-describedby={errors.password && touched.password ? "password-error" : undefined}
                aria-invalid={!!errors.password}
              />
              {errors.password && touched.password && (
                <p id="password-error" className="text-xs text-bad mt-1" role="alert">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="rounded border-line-strong text-accent"
              />
              <label htmlFor="remember" className="text-xs text-ink-faint">Remember me</label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-on-accent font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
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
              <div className="w-full border-t border-line" />
            </div>
            <span className="relative flex justify-center bg-surface px-3 text-[11px] text-ink-faint uppercase tracking-widest">
              or continue with
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6">
            {["Google", "GitHub"].map((p) => (
              <button
                key={p}
                type="button"
                className="flex items-center justify-center gap-1.5 border border-line rounded-lg py-2 text-xs font-semibold text-ink-muted hover:bg-surface-2 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-ink-faint">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-accent font-bold hover:text-accent-hover">
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
