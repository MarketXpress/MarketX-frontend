"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, ApiError } from "@/lib/api";

type FormErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  form?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"BUYER" | "SELLER">("BUYER");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e: FormErrors = {};
    if (!firstName) e.firstName = "First name is required";
    if (!lastName) e.lastName = "Last name is required";
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
      await authApi.register({ email, password, firstName, lastName, role });
      router.push(`/auth/login?email=${encodeURIComponent(email)}&registered=1`);
    } catch (err) {
      let message: string;
      if (err instanceof ApiError) {
        message =
          err.status === 409
            ? "An account with this email already exists"
            : err.message;
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

  const isSeller = role === "SELLER";

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
            &ldquo;Join 12,000+<br />traders worldwide.&rdquo;
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            Whether you&apos;re buying the latest tech or selling handmade goods,
            MarketXpress keeps every transaction safe with escrow smart contracts.
          </p>
        </div>
        <p className="text-xs text-gray-600">&copy; 2026 MarketXpress</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">
              Create your account
            </h1>
            <p className="text-sm text-gray-500">Start trading on MarketXpress today</p>
          </div>

          {/* Role selector */}
          <div
            className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl mb-5"
            role="radiogroup"
            aria-label="Account type"
          >
            {(["BUYER", "SELLER"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                aria-pressed={role === r}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  role === r
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {r === "BUYER" ? "🛒 I'm a Buyer" : "🏪 I'm a Seller"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
            {errors.form && (
              <div
                role="alert"
                className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
              >
                {errors.form}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-xs font-bold text-gray-700 mb-1.5">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, firstName: true }))}
                  placeholder="John"
                  className={fieldClass("firstName", touched.firstName)}
                />
                {errors.firstName && touched.firstName && (
                  <p className="text-xs text-red-600 mt-1" role="alert">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-xs font-bold text-gray-700 mb-1.5">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, lastName: true }))}
                  placeholder="Doe"
                  className={fieldClass("lastName", touched.lastName)}
                />
                {errors.lastName && touched.lastName && (
                  <p className="text-xs text-red-600 mt-1" role="alert">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

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
              />
              {errors.email && touched.email && (
                <p className="text-xs text-red-600 mt-1" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                placeholder="Minimum 8 characters"
                className={fieldClass("password", touched.password)}
              />
              {errors.password && touched.password && (
                <p className="text-xs text-red-600 mt-1" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full font-bold py-2.5 rounded-lg text-white transition-colors flex items-center justify-center gap-2 text-sm mt-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                isSeller
                  ? "bg-violet-600 hover:bg-violet-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create Account →"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-emerald-600 font-bold hover:text-emerald-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
