self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Service worker de transición para instalaciones antiguas de TurnIA cuyo
// origen era www.turniahealth.com.ar. No cachea nada y no registra una PWA
// nueva para visitantes de la web comercial.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request));
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }

  const title = typeof payload.title === 'string' && payload.title ? payload.title : 'TurnIA';
  const body = typeof payload.body === 'string' ? payload.body : 'Tenés una nueva notificación.';
  const url = typeof payload.url === 'string' && payload.url.startsWith('/') ? payload.url : '/dashboard';
  const eventKey = typeof payload.eventKey === 'string' ? payload.eventKey : undefined;

  event.waitUntil(self.registration.showNotification(title, {
    body,
    tag: eventKey ? `turnia-${eventKey}` : undefined,
    renotify: false,
    data: { url, eventKey },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const relativeTarget =
    typeof event.notification?.data?.url === 'string' &&
    event.notification.data.url.startsWith('/')
      ? event.notification.data.url
      : '/dashboard';
  const absoluteTarget = new URL(relativeTarget, 'https://app.turniahealth.com.ar').href;

  event.waitUntil((async () => {
    const windowClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

    for (const client of windowClients) {
      if ('navigate' in client) {
        try {
          await client.navigate(absoluteTarget);
          if ('focus' in client) return client.focus();
        } catch {
          // Si el navegador no permite navegar el client entre orígenes,
          // abrimos una ventana nueva abajo.
        }
      }
    }

    if (self.clients.openWindow) {
      return self.clients.openWindow(absoluteTarget);
    }
  })());
});
