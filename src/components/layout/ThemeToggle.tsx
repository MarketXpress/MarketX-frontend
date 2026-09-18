"use client";

import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

/**
 * Which icon to show is decided in CSS rather than in JavaScript.
 *
 * The inline script in the layout stamps `data-theme` before first paint, so
 * the correct icon is already correct on the very first frame — no mount flag,
 * no empty square, no sun flashing at someone who is in light mode.
 */
export default function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      // Static, because the label must not disagree with the icon during
      // hydration. "Toggle" is true in both directions.
      aria-label="Toggle light and dark mode"
      title="Toggle light and dark mode"
      className="grid h-9 w-9 place-items-center rounded-md text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
    >
      <Moon className="h-[18px] w-[18px] dark:hidden" aria-hidden="true" />
      <Sun className="hidden h-[18px] w-[18px] dark:block" aria-hidden="true" />
    </button>
  );
}
