const CACHE_NAME = 'minkai-tcg-simulator-v12-11-fx-cleanup';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './frames/sample-royal-gold.png',
  './frames/sample-silver-prism.png',
  './frames/sample-sakura-lacquer.png',
  './frames/sample-arcane-halo.png',
  './frames/sample-cyber-circuit.png',
  './frames/second-japanese-shrine.png',
  './frames/second-mythic-constellation.png',
  './frames/second-gothic-horror.png',
  './frames/second-mechanical-reactor.png',
  './frames/second-cosmic-nebula.png',
  './frames/second-verdant-nature.png',
  './frames/second-royal-crown.png',
  './frames/second-magical-crystal.png',
  './frames/second-dark-abyss.png',
  './frames/second-sacred-cathedral.png',
  './frames/second-yokai-lantern.png',
  './frames/second-ocean-abyss.png',
  './frames/second-infernal-sigil.png',
  './frames/second-ancient-forest-temple.png',
  './frames/second-luxury-cyber.png',
  './frames/second-void-fracture.png',  './effects/frost-ice.png',  './effects/holographic-film-soft.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith('minkai-tcg-simulator-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
