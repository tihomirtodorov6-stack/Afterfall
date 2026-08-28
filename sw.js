// sw.js - Letishta.bg - Авто-обновяване - 28.08.2026
const CACHE = 'letishta-v6-2026-08-28';

self.addEventListener('install', (event) => {
  console.log('Нов sw.js инсталиран - обновявам веднага!');
  self.skipWaiting(); // Важно: кара стария да се махне веднага
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // За API - винаги взима ново от мрежата, не от кеш
  if (event.request.url.includes('/api/parking')) {
    event.respondWith(fetch(event.request));
    return;
  }
  // За всичко друго - мрежа първо, после кеш
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});