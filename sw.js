const CACHE = 'datacentre-v1';
const ASSETS = [
  '/datacentre/',
  '/datacentre/index.html',
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap'
];

// Installation : mise en cache des ressources statiques
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch : réseau d'abord, cache en fallback
// Les requêtes Supabase ne sont jamais cachées (données live)
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Supabase → toujours réseau, jamais cache
  if (url.hostname.includes('supabase.co') || url.hostname.includes('googleapis.com')) {
    e.respondWith(fetch(e.request).catch(() => new Response('', {status: 503})));
    return;
  }

  // Ressources statiques → réseau d'abord, cache si offline
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Mettre à jour le cache avec la version fraîche
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || new Response('Hors ligne', {status: 503})))
  );
});
