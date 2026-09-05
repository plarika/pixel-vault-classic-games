const CACHE = 'pixel-vault-v0.1.0';
const ASSETS = [
  './', './index.html', './manifest.webmanifest', './assets/css/styles.css',
  './assets/icons/icon-192.png', './assets/icons/icon-512.png',
  './assets/js/app.js', './assets/js/catalog.js', './assets/js/core/storage.js',
  './assets/js/core/input.js', './assets/js/core/game-host.js',
  './assets/js/games/snake.js', './assets/js/games/pong.js',
  './assets/js/games/breaker.js', './assets/js/games/star-defender.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok && response.type === 'basic') {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    }
    return response;
  })));
});
