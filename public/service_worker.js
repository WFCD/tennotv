/* eslint-disable no-restricted-globals */
window.self.addEventListener('install', event => {
  event.waitUntil(caches
    .open('v1')
    .then(cache => cache.addAll([
        '/',
        'js/utility.js',
        'js/dataHelper.js',
        'js/playerControl.js',
        'js/uiControl.js',
      ])));
});
window.self.addEventListener('fetch', e => {
  e.respondWith(caches
    .match(e.request)
    .then(response => response || fetch(e.request)));
});
/* eslint-enable no-restricted-globals */
