"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  ReactNode,
} from "react";

/**
 * Three states, not two.
 *
 * "system" is the default and means *follow the device*, which is different
 * from having chosen light. A phone that switches to dark at sunset should be
 * followed; only an explicit choice overrides it.
 */
export type ThemePreference = "light" | "dark" | "system";

interface ThemeContextType {
  /** What the user has chosen. */
  preference: ThemePreference;
  /** What is on screen right now, with "system" resolved. */
  resolved: "light" | "dark";
  setPreference: (next: ThemePreference) => void;
  /** Flips between light and dark, resolving "system" first. */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "marketx-theme";
/** Lets one tab's change reach every provider in this tab immediately. */
const CHANGE_EVENT = "marketx-theme-change";

/**
 * The theme lives in two places outside React — localStorage and the device's
 * colour-scheme setting — so it is read with `useSyncExternalStore` rather
 * than mirrored into state by an effect. That avoids the cascading render an
 * effect-then-setState would cause, and it keeps the server and client
 * snapshots explicit instead of guessed.
 */
function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia("(prefers-color-scheme: dark)");

  query.addEventListener("change", onChange);
  // `storage` fires in *other* tabs, so a theme change follows the user
  // between them.
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);

  return () => {
    query.removeEventListener("change", onChange);
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/**
 * A single string, because `useSyncExternalStore` compares snapshots by
 * identity — returning a fresh object each read would loop forever.
 */
function getSnapshot(): string {
  let preference: ThemePreference = "system";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "light" || raw === "dark") preference = raw;
  } catch {
    // Private browsing can refuse storage; fall back to following the device.
  }

  const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  return `${preference}|${system}`;
}

/** The server cannot know either value, so it renders the light default. */
function getServerSnapshot(): string {
  return "system|light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const [preference, system] = snapshot.split("|") as [ThemePreference, "light" | "dark"];
  const resolved = preference === "system" ? system : preference;

  const setPreference = useCallback((next: ThemePreference) => {
    const root = document.documentElement;

    // An explicit choice stamps data-theme; "system" removes it so the CSS
    // falls back to prefers-color-scheme. The inline script in the layout
    // applies the same attribute before first paint, so there is no flash.
    if (next === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", next);

    try {
      if (next === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // The theme still applies for this session; it just is not remembered.
    }

    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const toggleTheme = useCallback(() => {
    setPreference(resolved === "dark" ? "light" : "dark");
  }, [resolved, setPreference]);

  const value = useMemo<ThemeContextType>(
    () => ({ preference, resolved, setPreference, toggleTheme }),
    [preference, resolved, setPreference, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
