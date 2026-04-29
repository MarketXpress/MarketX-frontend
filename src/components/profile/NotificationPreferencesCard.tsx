"use client";

import { useState } from "react";
import { Bell, Loader2, Send, ShieldCheck, Sparkles, Slash } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { formatSubscriptionEndpoint } from "@/lib/pushNotifications";
import { usePushNotifications } from "@/context/PushNotificationContext";

function statusTone(status: string) {
  if (status === "Enabled") return "text-emerald-300 bg-emerald-500/10 border-emerald-500/20";
  if (status === "Ready") return "text-blue-300 bg-blue-500/10 border-blue-500/20";
  if (status === "Disabled") return "text-neutral-300 bg-white/5 border-white/10";
  return "text-amber-300 bg-amber-500/10 border-amber-500/20";
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
        description: "MarketX can now send browser alerts for order activity.",
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
        description: "Check your browser notifications for the MarketX alert.",
        variant: "success",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send test notification.";
      toast({ title: "Test notification failed", description: message, variant: "error" });
    }
  };

  return (
    <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-blue-300">
            <Bell className="h-3.5 w-3.5" />
            Notifications
          </div>
          <h2 className="text-xl font-bold">Push Notifications</h2>
          <p className="max-w-2xl text-sm text-neutral-400">
            Get browser alerts for new orders, escrow milestones, dispute updates, and seller messages.
          </p>
        </div>

        <div className={`inline-flex items-center gap-2 self-start rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${statusTone(status)}`}>
          {status === "Enabled" ? <ShieldCheck className="h-3.5 w-3.5" /> : status === "Disabled" ? <Slash className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
          {status}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Permission</p>
          <p className="mt-2 text-sm text-white">{permission === "unsupported" ? "Unavailable" : permission}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Service Worker</p>
          <p className="mt-2 text-sm text-white">{registrationReady ? "Registered" : "Not ready yet"}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Push Server</p>
          <p className="mt-2 text-sm text-white">{configured ? "Configured" : "Local alerts only"}</p>
        </div>
      </div>

      {subscription ? (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Subscription</p>
          <p className="mt-2 break-all text-sm text-neutral-300">{formatSubscriptionEndpoint(subscription)}</p>
        </div>
      ) : null}

      {lastAction ? (
        <p className="text-sm text-neutral-400">{lastAction}</p>
      ) : (
        <p className="text-sm text-neutral-500">
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
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
            Enable Notifications
          </button>
        ) : (
          <button
            onClick={handleDisable}
            disabled={isBusy}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-3 font-bold text-white transition-all hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Slash className="h-4 w-4" />}
            Disable Notifications
          </button>
        )}

        <button
          onClick={handleTest}
          disabled={isBusy || permission !== "granted"}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-5 py-3 font-bold text-white transition-all hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          Send Test Alert
        </button>
      </div>
    </div>
  );
}
