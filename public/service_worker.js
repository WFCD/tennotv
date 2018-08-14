self.addEventListener('install', (event) => {
  event.waitUntil(caches
    .open('v1')
    .then((cache) => {
      return cache.addAll([
        '/',
        'js/utility.js',
        'js/dataHelper.js',
        'js/playerControl.js',
        'js/uiControl.js',
      ]);
    })
  );
});
self.addEventListener('fetch', (e) => {
  e.respondWith(caches
    .match(e.request)
    .then((response) => {
      return response || fetch(e.request);
    })
  );
});
