// ============================================
// SERVICE WORKER — Сроки после вскрытия
// Пути относительные — работает из своей папки.
// ============================================
const CACHE_NAME = 'sroki-cache-v3';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE_NAME).then(function(c) { return c.addAll(ASSETS); }));
  self.skipWaiting();
});
self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(keys) {
    return Promise.all(keys.filter(function(k) { return k.indexOf('sroki-') === 0 && k !== CACHE_NAME; })
                           .map(function(k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});
self.addEventListener('fetch', function(e) {
  // Данные из Google Таблицы не кэшируем здесь — последняя версия хранится в localStorage страницы
  if (e.request.url.includes('docs.google.com') || e.request.url.includes('googleusercontent.com')) return;
  e.respondWith(
    fetch(e.request).then(function(res) {
      const clone = res.clone();
      caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
      return res;
    }).catch(function() { return caches.match(e.request); })
  );
});
