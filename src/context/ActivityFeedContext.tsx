"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ACTIVITY_STORAGE_KEY,
  createActivity,
  loadStoredActivities,
  type ActivityInput,
  type ActivityItem,
} from "@/lib/activityFeed";

interface ActivityFeedContextType {
  activities: ActivityItem[];
  unreadCount: number;
  recordActivity: (activity: ActivityInput) => void;
  markAllAsRead: () => void;
  clearActivities: () => void;
}

const ActivityFeedContext = createContext<ActivityFeedContextType | undefined>(
  undefined,
);

export function ActivityFeedProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activities, setActivities] = useState<ActivityItem[]>(loadStoredActivities);

  useEffect(() => {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities));
  }, [activities]);

  const recordActivity = useCallback((activity: ActivityInput) => {
    const next = createActivity(activity);
    setActivities((current) => [next, ...current].slice(0, 12));
  }, []);

  const markAllAsRead = useCallback(() => {
    setActivities((current) =>
      current.map((item) => ({ ...item, isRead: true })),
    );
  }, []);

  const clearActivities = useCallback(() => {
    setActivities([]);
  }, []);

  const unreadCount = activities.filter((item) => !item.isRead).length;

  const value = useMemo(
    () => ({
      activities,
      unreadCount,
      recordActivity,
      markAllAsRead,
      clearActivities,
    }),
    [activities, unreadCount, recordActivity, markAllAsRead, clearActivities],
  );

  return (
    <ActivityFeedContext.Provider value={value}>
      {children}
    </ActivityFeedContext.Provider>
  );
}

export function useActivityFeed() {
  const context = useContext(ActivityFeedContext);
  if (!context) {
    throw new Error("useActivityFeed must be used within an ActivityFeedProvider");
  }
  return context;
}
