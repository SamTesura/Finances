// Service Worker for Finance Control PWA
// Provides offline functionality and caching

// Debug flag - set to true to enable service worker logging
// Can be toggled via: navigator.serviceWorker.controller.postMessage({type: 'SET_DEBUG', value: true})
const DEBUG = false;

const CACHE_NAME = 'finance-control-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];

// Helper function for debug logging
function debugLog(...args) {
  if (DEBUG) {
    console.log('[SW]', ...args);
  }
}

function debugError(...args) {
  if (DEBUG) {
    console.error('[SW]', ...args);
  }
}

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        debugLog('Cache opened successfully');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        debugError('Cache installation failed:', err);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            debugLog('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Message event - allow pages to communicate with SW
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
