// @ts-check

/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />
const sw = /** @type {ServiceWorkerGlobalScope & typeof globalThis}*/ (
  globalThis
);
sw.addEventListener("push", (event) => {
  const message = event.data?.json();
  const { title, body, url } = message;
  const handlePushEvent = async () => {
    const windowClients = await sw.clients.matchAll({ type: "window" });
    if (windowClients.length > 0) {
      const appInForeground = windowClients.some((client) => client.focused);

      if (appInForeground) {
        return;
      }
    }
    await sw.registration.showNotification(title, {
      body,
      data: JSON.stringify({ url }),
    });
  };

  event.waitUntil(handlePushEvent());
});

sw.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  notification.close();
  const handleClick = async () => {
    const windowClient = await sw.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });
    const url = notification.data.url;
    console.log("fuiesfhesuifehs", url);
  };
  event.waitUntil(handleClick());
});
