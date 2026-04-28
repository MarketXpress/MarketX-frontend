"use client";

import Link from "next/link";
import { useState } from "react";

type FormErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
};

export default function RegisterPage() {
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

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!firstName) newErrors.firstName = "First name is required";
    if (!lastName) newErrors.lastName = "Last name is required";
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
      console.log("Register:", { firstName, lastName, email, role });
    }
  };

  const inputClass = (field: keyof FormErrors, isTouched: boolean) =>
    `bg-white/5 border text-white px-4 py-3 rounded-xl outline-none focus:ring-2 transition-all placeholder:text-neutral-600 ${
      errors[field] && isTouched
        ? "border-red-500/50 focus:ring-red-500/20"
        : "border-white/10 focus:ring-blue-500/50"
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 font-sans selection:bg-purple-500/30">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(147,51,234,0.05),transparent_50%)]" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white">Join MarketX</h1>
            <p className="text-neutral-400 text-sm">Create your decentralized account</p>
          </div>

          <div className="grid grid-cols-2 gap-4 p-1.5 bg-white/5 rounded-2xl border border-white/5" role="radiogroup" aria-label="Select your role">
            <button
              type="button"
              onClick={() => setRole("BUYER")}
              aria-pressed={role === "BUYER"}
              className={`py-3 rounded-xl transition-all font-medium text-sm ${
                role === "BUYER"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-neutral-500 hover:text-white"
              }`}
            >
              I am a Buyer
            </button>
            <button
              type="button"
              onClick={() => setRole("SELLER")}
              aria-pressed={role === "SELLER"}
              className={`py-3 rounded-xl transition-all font-medium text-sm ${
                role === "SELLER"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "text-neutral-500 hover:text-white"
              }`}
            >
              I am a Seller
            </button>
          </div>

          <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-1.5 col-span-1">
              <label htmlFor="firstName" className="text-xs font-medium text-neutral-400 ml-1">First Name</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, firstName: true }))}
                placeholder="John"
                aria-invalid={!!errors.firstName}
                aria-describedby={errors.firstName ? "firstName-error" : undefined}
                className={inputClass("firstName", touched.firstName)}
                required
              />
              {errors.firstName && touched.firstName && (
                <p id="firstName-error" className="text-xs text-red-500 font-medium" role="alert">{errors.firstName}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5 col-span-1">
              <label htmlFor="lastName" className="text-xs font-medium text-neutral-400 ml-1">Last Name</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, lastName: true }))}
                placeholder="Doe"
                aria-invalid={!!errors.lastName}
                aria-describedby={errors.lastName ? "lastName-error" : undefined}
                className={inputClass("lastName", touched.lastName)}
                required
              />
              {errors.lastName && touched.lastName && (
                <p id="lastName-error" className="text-xs text-red-500 font-medium" role="alert">{errors.lastName}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5 col-span-2">
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
                className={inputClass("email", touched.email)}
                required
              />
              {errors.email && touched.email && (
                <p id="email-error" className="text-xs text-red-500 font-medium" role="alert">{errors.email}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5 col-span-2">
              <label htmlFor="password" className="text-xs font-medium text-neutral-400 ml-1">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                placeholder="Minimum 8 characters"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                className={inputClass("password", touched.password)}
                required
              />
              {errors.password && touched.password && (
                <p id="password-error" className="text-xs text-red-500 font-medium" role="alert">{errors.password}</p>
              )}
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
