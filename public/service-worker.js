const NOTIFICATION_ICON = "/icon.png";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {};

  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = {
        title: "MarketX alert",
        body: event.data.text(),
      };
    }
  }

  const title = payload.title || "MarketX alert";
  const options = {
    body: payload.body || "You have a new MarketX update.",
    icon: payload.icon || NOTIFICATION_ICON,
    badge: payload.badge || NOTIFICATION_ICON,
    tag: payload.tag || "marketx-update",
    data: {
      url: payload.url || "/dashboard/orders",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification?.data?.url || "/dashboard/orders";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ("focus" in client && client.url.includes(targetUrl)) {
            return client.focus();
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }

        return null;
      }),
  );
});
