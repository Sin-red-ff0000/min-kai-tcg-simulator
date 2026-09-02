const CACHE_NAME = 'minkai-tcg-simulator-v24-1';
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
  './frames/rework-black-silver-reliquary.png',
  './frames/second-mechanical-reactor.png',
  './frames/second-cosmic-nebula.png',
  './frames/second-verdant-nature.png',
  './frames/rework-royal-gold-crest.png',
  './frames/second-magical-crystal.png',
  './frames/rework-obsidian-armor.png',
  './frames/rework-platinum-sanctum.png',
  './frames/rework-yokai-vermilion-lacquer.png',
  './frames/rework-deepsea-pearl.png',
  './frames/rework-scorched-iron-chain.png',
  './frames/second-ancient-forest-temple.png',
  './frames/second-luxury-cyber.png',
  './frames/rework-amethyst-fault.png',
  './frames/material-forged-black-iron.png',
  './frames/material-white-porcelain.png',
  './frames/material-ancient-bronze.png',
  './frames/material-leather-binding.png',
  './frames/material-metal-inlay.png',
  './frames/erotic-black-lace-corset.png',
  './frames/erotic-rose-veil.png',
  './frames/erotic-satin-ribbon.png',
  './frames/erotic-luxury-night.png',
  './frames/erotic-neon-heart.png',
  './frames/erotic-sheer-drape.png',
  './effects/holographic-film-soft.png',
  './effects/surface-diamond-cut.png',  './effects/surface-anodized-metal.png',  './effects/surface-carbon-iridescent.png',
  './effects/surface-velvet-matte.png',
  './effects/surface-diamond-cut-fine.png',
  './effects/surface-diamond-cut-deep.png',
  './effects/surface-diamond-cut-aurora.png',
  './effects/surface-dichroic-glass.png',  './effects/surface-heat-titanium.png',  './effects/surface-rainbow-facet.png',
  './effects/surface-burnished-copper.png',
  './effects/surface-gunmetal.png',
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
  './effects/surface-black-pearl.png',
  './effects/surface-dark-mother-pearl.png',
  './effects/surface-cracked-crystal.png',
  './effects/surface-black-crystal.png',
  './effects/surface-aurora-quartz.png',
  './effects/surface-labradorite.png',
  './effects/surface-tiger-eye.png',
  './effects/surface-black-opal.png',
  './effects/surface-mineral-vein.png',
  './effects/surface-lava-glass.png',
  './effects/surface-abyss-lacquer.png',
  './effects/surface-raden.png',
  './effects/surface-cloisonne.png',
  './effects/surface-crackle-glaze.png',
  './effects/surface-stained-glass-material.png',
  './effects/surface-dichroic-mosaic.png',
  './effects/surface-smoke-resin.png',
  './effects/surface-ink-resin.png',
  './effects/surface-scale-emboss.png',
  './effects/surface-ripple-emboss.png',
  './frames/night-midnight-orchid.png',
  './frames/night-black-diamond.png',
  './frames/night-velvet-curtain.png',
  './frames/night-moon-chain.png',
  './frames/night-neon-lounge.png',
  './frames/night-crystal-dresser.png',
  './effects/surface-heart-emboss.png',
  './effects/surface-heart-emboss-dense.png',
  './effects/erotic-black-lace-veil.png',
  './effects/erotic-satin-sheen.png',
  './effects/erotic-rouge-gloss.png',
  './effects/erotic-black-velvet.png',
  './effects/erotic-perfume-mist.png',
  './effects/erotic-sheer.png',

];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(
        APP_SHELL.map(path =>
          cache.add(path).catch(err => {
            console.warn('PWA cache skipped:', path, err);
            return null;
          })
        )
      ))
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
