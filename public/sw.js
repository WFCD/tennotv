/* globals caches, fetch */
/* eslint-disable no-restricted-globals, no-console */
const files = [
  '/',
  'js/dashControl.js',
  'js/utility.js',
  'js/dataHelper.js',
  'js/playerControl.js',
  'js/uiControl.js',
  'img/logos/banner.webp',
  'img/logos/logo-50.webp',
  'img/warframes.png',
  'img/streamlab.png',
  'img/weapons.png',
  'img/lotus.svg',
  'img/sfm.svg',
  'css/styles.css',
  'js/flakeid.min.js',
];

self.addEventListener('install', event => {
  event.waitUntil(caches
    .open('v1')
    .then(cache => cache.addAll(files)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches
    .match(e.request)
    .then(response => response || fetch(e.request)));
});

/* eslint-enable no-restricted-globals, no-console */
