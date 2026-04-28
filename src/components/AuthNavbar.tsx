// components/AuthNavbar/AuthNavbar.tsx

import Link from "next/link";

type Props = {
  variant?: "login" | "register";
};

export default function AuthNavbar({ variant = "login" }: Props) {
  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between border-b bg-white">
      {/* Logo / Brand */}
      <Link href="/" className="text-xl font-bold text-gray-900">
        DRIP
      </Link>

      {/* Right Side CTA */}
      <div className="flex items-center gap-4">
        {variant === "login" ? (
          <>
            <span className="text-sm text-gray-600">
              Don’t have an account?
            </span>
            <Link
              href="/register"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Sign up
            </Link>
          </>
        ) : (
          <>
            <span className="text-sm text-gray-600">
              Already have an account?
            </span>
            <Link
              href="/login"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Log in
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}