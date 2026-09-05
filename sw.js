const CACHE = 'pixel-vault-v1.0.0';
const CORE = [
  './', './index.html', './play.html', './manifest.webmanifest',
  './assets/css/styles.css',
  './assets/icons/icon-192.png', './assets/icons/icon-512.png',
  './assets/js/app.js', './assets/js/player.js', './assets/js/catalog.js',
  './assets/js/core/security.js', './assets/js/core/storage.js', './assets/js/core/input.js', './assets/js/core/game-host.js',
  './assets/js/games/snake.js', './assets/js/games/pong.js',
  './assets/js/games/breaker.js', './assets/js/games/star-defender.js'
];

const scope = self.registration.scope;
const coreUrls = new Set(CORE.map((path) => new URL(path, scope).href));

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith('pixel-vault-') && key !== CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Builds 3D são atualizadas como um conjunto e não entram no cache da shell.
  if (url.pathname.includes('/games-web/')) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const fallback = url.pathname.endsWith('/play.html') ? './play.html' : './index.html';
        return (await caches.match(fallback)) ?? Response.error();
      })
    );
    return;
  }

  const cleanUrl = new URL(url.href);
  cleanUrl.search = '';
  cleanUrl.hash = '';
  if (!coreUrls.has(cleanUrl.href)) return;

  event.respondWith(
    caches.match(cleanUrl.href).then((cached) => cached ?? fetch(request).then((response) => {
      if (!response.ok || response.type !== 'basic') return response;
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then((cache) => cache.put(cleanUrl.href, copy)));
      return response;
    }))
  );
});
