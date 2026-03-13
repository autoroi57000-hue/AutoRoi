const CACHE_NAME = 'autoroi-v1';
const CACHE_STATIC = 'autoroi-static-v1';
const CACHE_DYNAMIC = 'autoroi-dynamic-v1';
const MAX_DYNAMIC_IMAGES = 100;

const STATIC_ASSETS = [
  '/',
  '/fr/',
  '/offline.html',
  '/manifest.json',
  '/logo1.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ─── Install: cache static assets ─────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ─── Activate: clean old caches ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter(
            (key) =>
              key !== CACHE_STATIC &&
              key !== CACHE_DYNAMIC &&
              key !== CACHE_NAME
          )
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// ─── Fetch strategies ─────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension, etc.
  if (!url.protocol.startsWith('http')) return;

  // Strategy: CSS/JS → Cache first
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    url.pathname.match(/\/_next\/static\//)
  ) {
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }

  // Strategy: Images → Cache first, store in dynamic cache
  if (
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|webp|avif|svg|gif|ico)$/)
  ) {
    event.respondWith(cacheFirstDynamic(request));
    return;
  }

  // Strategy: API/JSON → Network first, cache 5 min
  if (
    request.headers.get('accept')?.includes('application/json') ||
    url.pathname.startsWith('/api/')
  ) {
    event.respondWith(networkFirstJson(request));
    return;
  }

  // Strategy: HTML pages → Network first, fallback cache, fallback offline
  if (
    request.mode === 'navigate' ||
    request.headers.get('accept')?.includes('text/html')
  ) {
    event.respondWith(networkFirstHtml(request));
    return;
  }

  // Default: network with cache fallback
  event.respondWith(cacheFirst(request, CACHE_STATIC));
});

// ─── Strategy helpers ─────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function cacheFirstDynamic(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(request, response.clone());
      trimCache(CACHE_DYNAMIC, MAX_DYNAMIC_IMAGES);
    }
    return response;
  } catch {
    return new Response('', { status: 503 });
  }
}

async function networkFirstHtml(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match('/offline.html');
  }
}

async function networkFirstJson(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    trimCache(cacheName, maxItems);
  }
}
