const CACHE_NAME = 'monthlyquran-v1.5.7';
const urlsToCache = [
  './',
  './index.html',
  './core/css/fonts.css',
  './core/css/themes.css',
  './core/css/components.css',
  './core/css/styles.css',
  './core/css/navigation.css',
  './core/js/env.js',
  './core/js/constants.js',
  './core/js/utils/logger.js',
  './core/js/utils/svg.js',
  './core/js/utils/debounce.js',
  './core/js/adapter/storage.js',
  './core/js/adapter/notifications.js',
  './core/js/storage.js',
  './core/js/quran-api.js',
  './core/js/algorithm.js',
  './core/js/i18n.js',
  './core/js/theme.js',
  './core/js/dialog.js',
  './core/js/components.js',
  './core/js/calendar.js',
  './core/js/ui.js',
  './core/js/app.js',
  './manifest.json'
];

// CSS files — always fetch fresh from network (never serve from cache)
const CSS_FILES = [
  './core/css/components.css',
  './core/css/styles.css',
  './core/css/themes.css',
  './core/css/navigation.css',
  './core/css/fonts.css',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((err) => console.log('Cache install failed:', err))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isCSSFile = CSS_FILES.some(f => url.pathname.endsWith(f.replace('./', '/')));

  if (isCSSFile) {
    // Network-first for CSS: always get fresh styles, fall back to cache
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Update cache with fresh version
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for everything else
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
      .catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      })
  );
});


