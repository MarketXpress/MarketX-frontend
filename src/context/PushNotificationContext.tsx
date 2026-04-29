"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  clearStoredPushEnabled,
  clearStoredSubscription,
  getStoredPushEnabled,
  getStoredSubscription,
  getVapidPublicKey,
  isPushSupported,
  setStoredPushEnabled,
  storeSubscription,
  urlBase64ToUint8Array,
  type PushSubscriptionSnapshot,
} from "@/lib/pushNotifications";

type PushPermission = NotificationPermission | "unsupported";

interface PushNotificationContextType {
  supported: boolean;
  permission: PushPermission;
  enabled: boolean;
  configured: boolean;
  registrationReady: boolean;
  subscription: PushSubscriptionSnapshot | null;
  isBusy: boolean;
  enableNotifications: () => Promise<void>;
  disableNotifications: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
  refreshState: () => Promise<void>;
}

const PushNotificationContext = createContext<
  PushNotificationContextType | undefined
>(undefined);

const TEST_NOTIFICATION_TITLE = "MarketX alert";

function getNotificationBody() {
  return "You have a new marketplace update ready to review.";
}

export function PushNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<PushPermission>("unsupported");
  const [enabled, setEnabled] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [registrationReady, setRegistrationReady] = useState(false);
  const [subscription, setSubscription] =
    useState<PushSubscriptionSnapshot | null>(null);
  const [isBusy, setIsBusy] = useState(true);

  const syncState = useCallback(() => {
    const isSupported = isPushSupported();
    setSupported(isSupported);
    setPermission(isSupported ? Notification.permission : "unsupported");
    setConfigured(Boolean(getVapidPublicKey()));
    setEnabled(getStoredPushEnabled());
    setSubscription(getStoredSubscription());
    setIsBusy(false);
  }, []);

  useEffect(() => {
    syncState();
  }, [syncState]);

  useEffect(() => {
    let cancelled = false;

    async function registerServiceWorker() {
      if (!isPushSupported()) return;

      try {
        registrationRef.current = await navigator.serviceWorker.register(
          "/service-worker.js",
          { scope: "/" },
        );

        if (!cancelled) {
          setRegistrationReady(true);
        }
      } catch {
        if (!cancelled) {
          setRegistrationReady(false);
        }
      }
    }

    void registerServiceWorker();

    return () => {
      cancelled = true;
    };
  }, []);

  const ensureRegistration = useCallback(async () => {
    if (registrationRef.current) {
      return registrationRef.current;
    }

    if (!isPushSupported()) {
      throw new Error("This browser does not support push notifications.");
    }

    registrationRef.current = await navigator.serviceWorker.register(
      "/service-worker.js",
      { scope: "/" },
    );

    setRegistrationReady(true);
    return registrationRef.current;
  }, []);

  const enableNotifications = useCallback(async () => {
    if (!isPushSupported()) {
      throw new Error("This browser does not support push notifications.");
    }

    setIsBusy(true);

    try {
      const currentPermission = Notification.permission;
      if (currentPermission === "denied") {
        throw new Error(
          "Notifications are blocked in this browser. Enable them in site settings first.",
        );
      }

      const permissionResult =
        currentPermission === "granted"
          ? "granted"
          : await Notification.requestPermission();

      setPermission(permissionResult);

      if (permissionResult !== "granted") {
        throw new Error("Notification permission was not granted.");
      }

      const registration = await ensureRegistration();
      const vapidPublicKey = getVapidPublicKey();

      if (vapidPublicKey) {
        const existingSubscription = await registration.pushManager.getSubscription();
        const pushSubscription =
          existingSubscription ??
          (await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
          }));

        storeSubscription(pushSubscription);
        setSubscription(pushSubscription.toJSON() as PushSubscriptionSnapshot);
      } else {
        clearStoredSubscription();
        setSubscription(null);
      }

      setStoredPushEnabled(true);
      setEnabled(true);
    } finally {
      setIsBusy(false);
    }
  }, [ensureRegistration]);

  const disableNotifications = useCallback(async () => {
    setIsBusy(true);

    try {
      const registration = registrationRef.current;
      const pushSubscription = registration
        ? await registration.pushManager.getSubscription()
        : null;

      if (pushSubscription) {
        await pushSubscription.unsubscribe();
      }

      clearStoredPushEnabled();
      clearStoredSubscription();
      setEnabled(false);
      setSubscription(null);
    } finally {
      setIsBusy(false);
    }
  }, []);

  const sendTestNotification = useCallback(async () => {
    if (!isPushSupported()) {
      throw new Error("This browser does not support notifications.");
    }

    if (Notification.permission !== "granted") {
      throw new Error("Please enable notifications before sending a test.");
    }

    const registration = await ensureRegistration();

    if (registration.showNotification) {
      await registration.showNotification(TEST_NOTIFICATION_TITLE, {
        body: getNotificationBody(),
        icon: "/icon.png",
        badge: "/icon.png",
        tag: "marketx-test-notification",
        data: {
          url: "/dashboard/orders",
        },
      });
      return;
    }

    new Notification(TEST_NOTIFICATION_TITLE, {
      body: getNotificationBody(),
      icon: "/icon.png",
    });
  }, [ensureRegistration]);

  const refreshState = useCallback(async () => {
    syncState();

    if (!isPushSupported()) return;

    try {
      const existingRegistration = await navigator.serviceWorker.getRegistration();

      if (existingRegistration) {
        registrationRef.current = existingRegistration;
        setRegistrationReady(true);
      }

      const existingSubscription = existingRegistration
        ? await existingRegistration.pushManager.getSubscription()
        : null;

      setSubscription(
        existingSubscription
          ? (existingSubscription.toJSON() as PushSubscriptionSnapshot)
          : getStoredSubscription(),
      );
    } catch {
      // If the browser rejects the refresh, keep the last known state.
    }
  }, [syncState]);

  const value: PushNotificationContextType = {
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
  };

  return (
    <PushNotificationContext.Provider value={value}>
      {children}
    </PushNotificationContext.Provider>
  );
}

export function usePushNotifications() {
  const context = useContext(PushNotificationContext);
  if (!context) {
    throw new Error("usePushNotifications must be used within PushNotificationProvider");
  }
  return context;
}
