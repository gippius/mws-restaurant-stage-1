const CACHE_VER = 'v1';
const CACHE_WHITELIST = ['v1'];
const CASHING_FILES = [
  '/js/dbhelper.js',
  '/js/main.js',
  '/js/restaurant_info.js',
  '/index.html',
  '/restaurant.html',
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
  '/css/styles.css'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open('v1').then(function (cache) {
      console.log('SW installed, files: ' + CACHING_FILES)
      return cache.addAll(CASHING_FILES);
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  )
});

self.addEventListener('activate', function(event){
  var cacheWhitelist = ['v1'];
  event.waitUntil(
    caches.keys().then(function(cacheNames){
      return Promise.all(
        cacheNames.map(function(cacheName){
          if (cacheWhitelist.indexOf(cacheName) === -1){
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});