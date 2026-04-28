"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface FeatureFlags {
  advancedFilters: boolean;
  multiTokenEscrow: boolean;
  disputeResolutionUI: boolean;
  ipfsMediaUpload: boolean;
  darkModeV2: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  advancedFilters: false,
  multiTokenEscrow: false,
  disputeResolutionUI: false,
  ipfsMediaUpload: false,
  darkModeV2: false,
};

interface FeatureFlagContextType {
  flags: FeatureFlags;
  isEnabled: (flag: keyof FeatureFlags) => boolean;
  override: (flag: keyof FeatureFlags, value: boolean) => void;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | null>(null);

function loadFlags(): FeatureFlags {
  try {
    const stored = localStorage.getItem("marketx_feature_flags");
    if (stored) return { ...DEFAULT_FLAGS, ...JSON.parse(stored) };
  } catch {
    /* ignore */
  }
  return DEFAULT_FLAGS;
}

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags>(loadFlags);

  const isEnabled = (flag: keyof FeatureFlags) => flags[flag];

  const override = (flag: keyof FeatureFlags, value: boolean) => {
    setFlags((prev) => {
      const next = { ...prev, [flag]: value };
      try {
        localStorage.setItem("marketx_feature_flags", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <FeatureFlagContext.Provider value={{ flags, isEnabled, override }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags(): FeatureFlagContextType {
  const ctx = useContext(FeatureFlagContext);
  if (!ctx) throw new Error("useFeatureFlags must be used inside FeatureFlagProvider");
  return ctx;
}
