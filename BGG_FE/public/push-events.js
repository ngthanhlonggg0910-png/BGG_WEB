/* Shared by development and production service workers. */
self.addEventListener('push', event => {
  let payload = {};
  try { payload = event.data?.json() || {}; } catch { /* Always show a visible fallback. */ }
  let safeUrl = new URL('/production-orders?tab=ddh', self.location.origin);
  try { safeUrl = new URL(payload.url || safeUrl.href, self.location.origin); } catch { /* Use the order list. */ }
  const url = safeUrl.origin === self.location.origin ? safeUrl.href : self.location.origin + '/production-orders?tab=ddh';
  event.waitUntil(self.registration.showNotification(payload.title || 'Đơn đặt hàng mới', {
    body: payload.body || 'Có đơn đặt hàng mới cần kiểm tra.',
    icon: '/ic_launcher_192.png',
    tag: payload.tag || 'bgg-new-order',
    data: { url },
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil((async () => {
    const target = new URL(event.notification.data?.url || '/production-orders?tab=ddh', self.location.origin);
    if (target.origin !== self.location.origin) return;
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if (new URL(client.url).origin === target.origin && 'navigate' in client) {
        await client.navigate(target.href);
        await client.focus();
        return;
      }
    }
    await self.clients.openWindow(target.href);
  })());
});
