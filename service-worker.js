const CACHE_NAME = 'expense-tracker-v1';
const urlsToCache = [
  '/Expense-Tracker/',                // <-- this must match
  '/Expense-Tracker/index.html',
  '/Expense-Tracker/style.css',
  '/Expense-Tracker/app.js',
  '/Expense-Tracker/manifest.json',
  '/Expense-Tracker/icon-192.png',
  '/Expense-Tracker/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
