/**
 * ============================================================================
 * MemoClass AI - Service Worker (PWA Network-First con Respaldo Offline)
 * ============================================================================
 * Autores / Desarrolladores:
 *   - Iván Andrés Urbano Rivera
 *   - Lucy Adriana Muñoz Cabrera
 * ============================================================================
 */

const CACHE_NAME = 'memoclass-ai-v3.0.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-maskable.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia Network-First con respaldo en Caché para evitar estilos desactualizados
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.hostname.includes('generativelanguage.googleapis.com')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          return cached || caches.match('./index.html');
        });
      })
  );
});
