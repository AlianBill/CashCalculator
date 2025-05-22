const CACHE_NAME = "vydaje-cache-v1";
const BASE = self.location.pathname.replace(/\/sw\.js$/, "");

const urlsToCache = [
    `${BASE}/`,
    `${BASE}/index.html`,
    `${BASE}/css/style.css`,
    `${BASE}/js/script.js`
];


// Instalace
self.addEventListener("install", function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

// Aktivace
self.addEventListener("activate", function(event) {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            )
        )
    );
});

// Načítání (fetch)
self.addEventListener("fetch", function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});
