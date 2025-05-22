const CACHE_NAME = "vydaje-cache-v1";
const BASE = self.location.pathname.replace(/\/sw\.js$/, "");

const urlsToCache = [
    `${BASE}/`,
    `${BASE}/index.html`,
    `${BASE}/css/style.css`,
    `${BASE}/css/mainPage.css`,
    `${BASE}/css/transaction.css`,
    `${BASE}/css/modal.css`,
    `${BASE}/css/statistics.css`,
    `${BASE}/css/balance.css`,
    `${BASE}/css/settings.css`,
    `${BASE}/js/script.js`,
    `${BASE}/js/mainPage.js`,
    `${BASE}/js/transaction.js`,
    `${BASE}/js/balance.js`,
    `${BASE}/js/settings.js`,
    `${BASE}/js/utils.js`
];

self.addEventListener("install", function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            for (const url of urlsToCache) {
                try {
                    console.log("Caching:", url);
                    await cache.add(url);
                } catch (err) {
                    console.error("❌ Failed to cache:", url, err);
                }
            }
        })
    );
});

self.addEventListener("activate", function(event) {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            )
        )
    );
});

self.addEventListener("fetch", function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});
