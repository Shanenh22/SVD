/* Spring Valley Dental — Service Worker v1.0
 * Strategy: Cache-first for assets, network-first for HTML pages.
 * Provides offline fallback and dramatically speeds up repeat visits.
 */

const CACHE_VERSION = 'svd-v1';
const STATIC_CACHE  = CACHE_VERSION + '-static';
const PAGE_CACHE    = CACHE_VERSION + '-pages';

/* Assets to precache on install */
const PRECACHE_ASSETS = [
  '/css/styles.css',
  '/js/core.js',
  '/js/analytics.js',
  '/js/site-config.js',
  '/images/spring-valley-logo-desktop.svg',
  '/images/spring-valley-logo-mobile.svg',
  '/images/favicon.svg',
  '/images/hero-background.webp',
  '/offline.html',
];

/* ── Install: precache static assets ─────────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: clean up old caches ───────────────────────────── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== STATIC_CACHE && k !== PAGE_CACHE)
            .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch: cache strategy ────────────────────────────────────── */
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  /* Only handle same-origin GET requests */
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  /* HTML pages: network-first, fall back to cache, then offline page */
  if (req.headers.get('Accept') && req.headers.get('Accept').includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const clone = res.clone();
          caches.open(PAGE_CACHE).then(c => c.put(req, clone));
          return res;
        })
        .catch(() =>
          caches.match(req)
            .then(cached => cached || caches.match('/offline.html'))
        )
    );
    return;
  }

  /* Static assets: cache-first */
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then(c => c.put(req, clone));
        }
        return res;
      });
    })
  );
});
