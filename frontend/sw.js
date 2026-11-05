/**
 * TravelMate AI - Service Worker v1.0
 * Enables offline caching, fast load times, and Android WebAPK installability.
 */

const CACHE_NAME = 'travelmate-v1';
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/css/style.css',
  '/js/app.js',
  '/js/api.js',
  '/js/auth.js',
  '/js/map.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS).catch(err => {
        console.warn('[SW] Precache partial error:', err);
      });
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  // Let API requests pass directly through to network
  if (req.url.includes('/api/')) {
    event.respondWith(
      fetch(req).catch(() => {
        return caches.match(req);
      })
    );
    return;
  }

  // Stale-while-revalidate for UI assets
  event.respondWith(
    caches.match(req).then(cached => {
      const networkFetch = fetch(req).then(resp => {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const respClone = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, respClone));
        }
        return resp;
      }).catch(() => cached);

      return cached || networkFetch;
    })
  );
});
