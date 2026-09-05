const CACHE = 'pixel-vault-v0.2.0';
const ASSETS = [
  './', './index.html', './play.html', './manifest.webmanifest', './assets/css/styles.css',
  './assets/icons/icon-192.png', './assets/icons/icon-512.png',
  './assets/js/app.js', './assets/js/player.js', './assets/js/catalog.js',
  './assets/js/core/storage.js', './assets/js/core/input.js', './assets/js/core/game-host.js',
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
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Builds 3D podem ser grandes e mudam em bloco. Evitamos cache opaco/stale no Service Worker.
  if (url.pathname.includes('/games-web/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok && response.type === 'basic') {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    }
    return response;
  })));
});
