const CACHE_NAME = 'ellu-equip-v2';
const BASE = '/controle-equipamentos/';
const ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'style.css',
  BASE + 'app.js',
  BASE + 'manifest.json',
  BASE + 'logo.png',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png'
];

// Instala e faz cache de todos os assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Remove caches antigos e assume controle imediato
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Estratégia: assets locais → cache; Supabase → rede direta
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Requisições ao Supabase: sempre rede, sem cache
  if (url.hostname.includes('supabase.co')) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // Assets locais: cache primeiro, depois rede
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Só faz cache de respostas válidas
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      });
    }).catch(() => {
      // Fallback para o index.html se offline
      if (e.request.destination === 'document') {
        return caches.match(BASE + 'index.html');
      }
    })
  );
});
