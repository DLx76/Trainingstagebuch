const CACHE_NAME = 'trainingstagebuch-v1.1.0';
const ASSETS = [
  '/Trainingstagebuch/',
  '/Trainingstagebuch/index.html'
];

// Installation: App-Shell im Cache sichern
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Aktivierung: Alte Caches aufräumen (localStorage-Daten bleiben unangetastet)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Netzwerk-zuerst-Strategie: Online immer frisch, offline sofort aus dem Cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/Trainingstagebuch/index.html')))
  );
});

// Auf Nutzer-Klick ("Laden" im Update-Banner) sofort aktivieren
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});