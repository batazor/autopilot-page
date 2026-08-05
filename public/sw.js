// Offline support for the docs site and the browser tools (planner / label
// editor). Strategy: stale-while-revalidate for same-origin GETs — first visit
// fills the cache, later visits are instant and work offline; fresh copies
// replace cached ones in the background. Plan data itself lives in
// localStorage, so the planner is fully usable offline once loaded.
const CACHE = 'autopilot-page-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== location.origin) return;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(event.request);
      const network = fetch(event.request)
        .then((res) => {
          if (res.ok && (res.type === 'basic' || res.type === 'default')) {
            cache.put(event.request, res.clone());
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
