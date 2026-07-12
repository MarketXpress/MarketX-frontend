"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Client-mount detection for SSR hydration safety - can't be computed during render.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  return (
    <button
      onClick={toggleTheme}
      aria-label={mounted ? `Switch to ${theme === "dark" ? "light" : "dark"} mode` : "Toggle theme"}
      className="p-2 text-neutral-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
    >
      {mounted && (theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
    </button>
  );
}
