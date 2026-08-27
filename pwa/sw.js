const CACHE_NAME = 'khmer-vocab-v1.1';
const urlsToCache = [
  '/',
  '/index.html',
  '/pwa/manifest.json',
  '/pwa/appicon-192.png',
  '/pwa/appicon-512.png',
  'https://cdn.jsdelivr.net/gh/Ion-o-koji/portuguese-Vocabulary-Assets@main/scripts/portugueseVocabularyScripts.js',
  'https://cdn.jsdelivr.net/gh/Ion-o-koji/portuguese-Vocabulary-Assets@main/styles/portugueseVocabularyStyles.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResp => {
      if (cachedResp) return cachedResp;
      return fetch(event.request).then(networkResp => {
        if (networkResp && networkResp.status === 200 && networkResp.type !== 'opaque') {
          const responseClone = networkResp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return networkResp;
      }).catch(() => caches.match('/pwa/appicon-192.png'));
    })
  );
});
