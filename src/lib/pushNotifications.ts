"use client";

export const PUSH_STORAGE_KEYS = {
  enabled: "mx_push_enabled",
  subscription: "mx_push_subscription",
};

export interface PushSubscriptionSnapshot {
  endpoint: string;
  expirationTime: number | null;
  keys?: {
    auth: string;
    p256dh: string;
  };
}

export function isPushSupported() {
  if (typeof window === "undefined") return false;
  return (
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

export function getVapidPublicKey() {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() ?? "";
}

export function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

export function getStoredPushEnabled() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PUSH_STORAGE_KEYS.enabled) === "true";
}

export function setStoredPushEnabled(enabled: boolean) {
  localStorage.setItem(PUSH_STORAGE_KEYS.enabled, String(enabled));
}

export function clearStoredPushEnabled() {
  localStorage.removeItem(PUSH_STORAGE_KEYS.enabled);
}

export function getStoredSubscription() {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(PUSH_STORAGE_KEYS.subscription);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PushSubscriptionSnapshot;
  } catch {
    localStorage.removeItem(PUSH_STORAGE_KEYS.subscription);
    return null;
  }
}

export function storeSubscription(subscription: PushSubscription) {
  localStorage.setItem(
    PUSH_STORAGE_KEYS.subscription,
    JSON.stringify(subscription.toJSON()),
  );
}

export function clearStoredSubscription() {
  localStorage.removeItem(PUSH_STORAGE_KEYS.subscription);
}

export function formatSubscriptionEndpoint(subscription: PushSubscriptionSnapshot) {
  const url = new URL(subscription.endpoint);
  const token = url.pathname.split("/").filter(Boolean).slice(-1)[0] ?? "";

  if (!token) return url.origin;
  return `${url.origin}/.../${token.slice(-10)}`;
}
