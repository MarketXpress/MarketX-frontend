"use client";

import { useState } from "react";
import { Bell, Loader2, Send, ShieldCheck, Sparkles, Slash } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { formatSubscriptionEndpoint } from "@/lib/pushNotifications";
import { usePushNotifications } from "@/context/PushNotificationContext";

function statusTone(status: string) {
  if (status === "Enabled") return "text-accent bg-accent-soft border-accent-line";
  if (status === "Ready") return "text-blue-700 bg-blue-50 border-blue-200";
  if (status === "Disabled") return "text-ink-faint bg-surface-2 border-line";
  return "text-warn bg-warn-bg border-warn-line";
}

export default function NotificationPreferencesCard() {
  const [lastAction, setLastAction] = useState<string | null>(null);
  const { toast } = useToast();
  const {
    supported,
    permission,
    enabled,
    configured,
    registrationReady,
    subscription,
    isBusy,
    enableNotifications,
    disableNotifications,
    sendTestNotification,
    refreshState,
  } = usePushNotifications();

  const status = !supported
    ? "Unsupported"
    : permission === "denied"
    ? "Blocked"
    : enabled
    ? "Enabled"
    : registrationReady
    ? "Ready"
    : "Disabled";

  const handleEnable = async () => {
    try {
      await enableNotifications();
      await refreshState();
      setLastAction("Notifications enabled");
      toast({
        title: "Push notifications enabled",
        description: "MarketXpress can now send browser alerts for order activity.",
        variant: "success",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to enable notifications.";
      toast({ title: "Could not enable notifications", description: message, variant: "error" });
    }
  };

  const handleDisable = async () => {
    try {
      await disableNotifications();
      await refreshState();
      setLastAction("Notifications disabled");
      toast({
        title: "Push notifications disabled",
        description: "Your browser subscription was removed from this device.",
        variant: "info",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to disable notifications.";
      toast({ title: "Could not disable notifications", description: message, variant: "error" });
    }
  };

  const handleTest = async () => {
    try {
      await sendTestNotification();
      setLastAction("Test notification sent");
      toast({
        title: "Test notification sent",
        description: "Check your browser notifications for the MarketXpress alert.",
        variant: "success",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send test notification.";
      toast({ title: "Test notification failed", description: message, variant: "error" });
    }
  };

  return (
    <div className="p-6 bg-surface border border-line rounded-2xl space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-line bg-accent-soft px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-accent">
            <Bell className="h-3.5 w-3.5" />
            Notifications
          </div>
          <h2 className="text-base font-black text-ink">Push Notifications</h2>
          <p className="max-w-2xl text-sm text-ink-faint">
            Get browser alerts for new orders, escrow milestones, dispute updates, and seller messages.
          </p>
        </div>

        <div className={`inline-flex items-center gap-2 self-start rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${statusTone(status)}`}>
          {status === "Enabled" ? <ShieldCheck className="h-3.5 w-3.5" /> : status === "Disabled" ? <Slash className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
          {status}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface-2 p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint">Permission</p>
          <p className="mt-1.5 text-sm font-semibold text-ink">{permission === "unsupported" ? "Unavailable" : permission}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface-2 p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint">Service Worker</p>
          <p className="mt-1.5 text-sm font-semibold text-ink">{registrationReady ? "Registered" : "Not ready yet"}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface-2 p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint">Push Server</p>
          <p className="mt-1.5 text-sm font-semibold text-ink">{configured ? "Configured" : "Local alerts only"}</p>
        </div>
      </div>

      {subscription ? (
        <div className="rounded-xl border border-line bg-surface-2 p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint">Subscription</p>
          <p className="mt-1.5 break-all text-sm text-ink-muted">{formatSubscriptionEndpoint(subscription)}</p>
        </div>
      ) : null}

      {lastAction ? (
        <p className="text-sm text-ink-faint">{lastAction}</p>
      ) : (
        <p className="text-sm text-ink-faint">
          {configured
            ? "Once the notification endpoint is wired to a backend, this device will receive live push messages."
            : "You can still enable local browser notifications now, and connect a push server later with NEXT_PUBLIC_VAPID_PUBLIC_KEY."}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        {!enabled ? (
          <button
            onClick={handleEnable}
            disabled={isBusy || permission === "denied" || !supported}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-on-accent transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
            Enable Notifications
          </button>
        ) : (
          <button
            onClick={handleDisable}
            disabled={isBusy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-surface-2 px-5 py-2.5 text-sm font-bold text-ink-muted transition-colors hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Slash className="h-4 w-4" />}
            Disable Notifications
          </button>
        )}

        <button
          onClick={handleTest}
          disabled={isBusy || permission !== "granted"}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-5 py-2.5 text-sm font-bold text-ink-muted transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          Send Test Alert
        </button>
      </div>
    </div>
  );
}
