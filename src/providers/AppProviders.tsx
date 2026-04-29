"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { FeatureFlagProvider } from "@/context/FeatureFlagContext";
import { PushNotificationProvider } from "@/context/PushNotificationContext";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <FeatureFlagProvider>
        <AuthProvider>
          <ToastProvider>
            <PushNotificationProvider>
              <ThemeProvider>
                {children}
              </ThemeProvider>
            </PushNotificationProvider>
          </ToastProvider>
        </AuthProvider>
      </FeatureFlagProvider>
    </QueryClientProvider>
  );
}
