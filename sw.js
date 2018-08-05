const CACHE_NAME = 'restaurant-reviews'
const CACHE_VER = 'v1';
const CACHE_WHITELIST = ['v1'];
const CASHED_URLS = [
  '/',
  '/index.html',
  '/restaurant.html',
  '/css/styles.css',
  '/manifest.json',
  '/js/idb.js',
  '/js/dbhelper.js',
  '/js/main.js',
  '/js/restaurant_info.js',
  '/img/1.jpg',
  '/img/2.jpg',
  '/img/3.jpg',
  '/img/4.jpg',
  '/img/5.jpg',
  '/img/6.jpg',
  '/img/7.jpg',
  '/img/8.jpg',
  '/img/9.jpg',
  '/img/10.jpg',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(`${CACHE_NAME}-${CACHE_VER}`)
      .then(cache => {
        return cache.addAll(CASHED_URLS)
      })
  )
});

self.addEventListener('fetch', e => {
  if (!CASHED_URLS.includes(e.request.url)) return;

  e.respondWith(
    caches.match(e.request).then(res => {
      if (res) {
        return res;
      }

      return fetch(e.res);
    })
  )
});

/*
self.addEventListener('fetch', function (event) {
  console.log(event.request)
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          console.log(response);
          return response;
        }
        return fetch(event.request);
      })
  )
});

self.addEventListener('activate', function (event) {
  var cacheWhitelist = ['v1'];
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

*/