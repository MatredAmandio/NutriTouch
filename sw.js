const CACHE = 'nutritouch-v16-10';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-maskable.svg',
  './css/tokens.css',
  './css/components.css',
  './css/photos.css',
  './css/food-engine.css',
  './css/mobile.css',
  './css/design-tweaks.css',
  './js/app.js',
  './js/storage.js',
  './js/engine/metabolism.js',
  './js/engine/goals.js',
  './js/engine/macros.js',
  './js/engine/safety.js',
  './js/engine/nutri-engine.js',
  './js/meals/templates.js',
  './js/meals/substitutions.js',
  './js/meals/generator.js',
  './js/meals/nutrition.js',
  './js/meals/quantified-recipes.js',
  './js/meals/quantified-recipes-3.3.js',
  './js/meals/quantified-recipes-cheese.js',
  './js/meals/quantified-recipes-beverages.js',
  './js/meals/quantified-library.js',
  './js/meals/quantified-generator.js',
  './js/data/foods.js',
  './js/ui/dom.js',
  './js/ui/assessment.js',
  './js/ui/dashboard.js',
  './js/ui/mealplan.js',
  './js/ui/foods.js',
  './js/ui/evolution.js',
  './data/foods.json',
  './data/foods-taco.json',
  './data/foods-3.3.json',
  './data/foods-cheese.json',
  './data/foods-beverages.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('nutritouch-') && key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function cacheSuccessful(request, response) {
  if (response?.ok) {
    const cache = await caches.open(CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, fallback = request) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    return cacheSuccessful(request, response);
  } catch (_) {
    return caches.match(fallback);
  }
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request, './index.html'));
    return;
  }

  event.respondWith(networkFirst(event.request));
});
