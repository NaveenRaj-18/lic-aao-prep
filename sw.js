/* Offline cache: the site works without internet after the first visit. */
const CACHE = 'aao-prep-v1';
const FILES = ['./', 'index.html', 'css/style.css', 'js/content.js', 'js/plan.js', 'js/questions.js', 'js/core.js', 'js/views-a.js', 'js/views-b.js', 'js/views-c.js', 'js/main.js', 'manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});
