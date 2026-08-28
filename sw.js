self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open('letishta-v2').then(c => c.addAll(['/'])))
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== 'letishta-v2' ? caches.delete(k) : null))));
});
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});