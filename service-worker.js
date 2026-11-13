const CACHE_NAME = 'quadro-manual-offline-v6';
const APP_BASE = new URL('./', self.registration.scope);
const APP_INDEX = new URL('index.html', APP_BASE).href;
const APP_FILES = [
  APP_INDEX,
  new URL('manifest.webmanifest', APP_BASE).href,
  new URL('icon.svg', APP_BASE).href,
  new URL('icon-180.png', APP_BASE).href,
  new URL('icon-192.png', APP_BASE).href,
  new URL('icon-512.png', APP_BASE).href
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('quadro-manual-offline-') && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(caches.match(APP_INDEX).then(cached => cached || fetch(request)));
    return;
  }

  if (APP_FILES.includes(url.href)) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
  }
});
