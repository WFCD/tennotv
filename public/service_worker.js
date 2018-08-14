self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('v1').then(function(cache) {
            return cache.addAll([
                '/',
                'js/utility.js',
                'js/dataHelper.js',
                'js/playerControl.js',
                'js/uiControl.js'
            ]);
        })
    );
});
 self.addEventListener('fetch', function (e) {
    e.respondWith(
        caches.match(e.request).then(
            function (response) {
                return response || fetch(e.request);
            }
        )
    );
});
