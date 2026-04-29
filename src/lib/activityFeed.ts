"use client";

export type ActivityType =
  | "listing"
  | "order"
  | "profile"
  | "payment"
  | "notification"
  | "security";

export type ActivitySeverity = "success" | "info" | "warning";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  severity: ActivitySeverity;
  title: string;
  description: string;
  timestamp: string;
  href?: string;
  isRead: boolean;
}

export interface ActivityInput {
  type: ActivityType;
  severity: ActivitySeverity;
  title: string;
  description: string;
  href?: string;
}

export const ACTIVITY_STORAGE_KEY = "marketx_activity_feed";

export const DEFAULT_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-seed-1",
    type: "security",
    severity: "success",
    title: "Wallet connected successfully",
    description: "Your Freighter wallet was linked to this session.",
    timestamp: "2026-04-29T10:25:00.000Z",
    href: "/profile",
    isRead: false,
  },
  {
    id: "act-seed-2",
    type: "order",
    severity: "info",
    title: "Escrow order updated",
    description: "Order #MX-1048 moved to in-transit and awaits buyer confirmation.",
    timestamp: "2026-04-29T09:25:00.000Z",
    href: "/dashboard/orders",
    isRead: true,
  },
  {
    id: "act-seed-3",
    type: "listing",
    severity: "success",
    title: "Listing published",
    description: "Digital artwork was prepared for escrow deployment.",
    timestamp: "2026-04-29T08:20:00.000Z",
    href: "/dashboard/selling",
    isRead: true,
  },
];

export function createActivityId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadStoredActivities() {
  if (typeof window === "undefined") return DEFAULT_ACTIVITIES;

  const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
  if (!raw) return DEFAULT_ACTIVITIES;

  try {
    const parsed = JSON.parse(raw) as ActivityItem[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ACTIVITIES;
  } catch {
    return DEFAULT_ACTIVITIES;
  }
}

export function createActivity(input: ActivityInput): ActivityItem {
  return {
    id: createActivityId(),
    timestamp: new Date().toISOString(),
    isRead: false,
    ...input,
  };
}
