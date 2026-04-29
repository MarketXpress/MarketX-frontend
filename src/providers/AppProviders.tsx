"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { FeatureFlagProvider } from "@/context/FeatureFlagContext";
import { PushNotificationProvider } from "@/context/PushNotificationContext";
import { ActivityFeedProvider } from "@/context/ActivityFeedContext";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <FeatureFlagProvider>
        <AuthProvider>
          <ToastProvider>
            <ActivityFeedProvider>
              <PushNotificationProvider>
                <ThemeProvider>
                  {children}
                </ThemeProvider>
              </PushNotificationProvider>
            </ActivityFeedProvider>
          </ToastProvider>
        </AuthProvider>
      </FeatureFlagProvider>
    </QueryClientProvider>
  );
}
