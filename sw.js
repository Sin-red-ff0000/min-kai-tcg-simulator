const CACHE_NAME = 'minkai-tcg-simulator-v13-7';
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
  './effects/surface-diamond-cut.png',  './effects/surface-anodized-metal.png',  './effects/surface-carbon-iridescent.png',
  './effects/surface-velvet-matte.png',
  './effects/surface-diamond-cut-fine.png',
  './effects/surface-diamond-cut-deep.png',
  './effects/surface-diamond-cut-aurora.png',
  './effects/surface-diamond-cut-black.png',
  './effects/surface-dichroic-glass.png',  './effects/surface-heat-titanium.png',  './effects/surface-rainbow-facet.png',
  './effects/surface-sapphire-cut.png',
  './effects/surface-ruby-cut.png',
  './effects/surface-emerald-cut.png',
  './effects/surface-amethyst-cut.png',
  './effects/surface-burnished-copper.png',
  './effects/surface-gunmetal.png',
  './effects/surface-rose-gold.png',
  './effects/surface-red-lacquer.png',
  './effects/surface-blue-enamel.png',
  './effects/surface-orange-candy.png',
  './effects/surface-green-candy.png',
  './effects/surface-magenta-candy.png',
  './effects/surface-electric-blue.png',
  './effects/surface-hot-pink.png',
  './effects/surface-violet-mirror.png',
  './effects/surface-gold-orange.png',
  './effects/surface-titanium-spectrum.png',
  './effects/surface-dichroic-film.png',
  './effects/surface-polarized-lcd.png',
  './effects/surface-opal-glass.png',
  './effects/surface-beetle-wing.png',
  './effects/surface-verdigris.png',
  './effects/surface-neon-film.png',
  './effects/surface-stained-film.png',
  './effects/surface-azure-marble.png',
  './effects/surface-obsidian.png',
  './effects/surface-amber-resin.png',
  './effects/surface-crystal-resin.png',
  './effects/surface-jade-gloss.png',
  './effects/surface-lenticular.png',
  './effects/surface-damascus.png',
  './effects/surface-morpho-wing.png',
  './effects/surface-aurora-silk.png',
  './effects/surface-black-oil-slick.png',
  './effects/surface-frosted-hologlass.png',
  './effects/surface-molten-metal.png',
  './effects/surface-soap-membrane.png',
  './effects/surface-royal-velvet.png',
  './effects/surface-thermal-liquid-crystal.png',
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
