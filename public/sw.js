/* globals caches, fetch */
/* eslint-disable no-restricted-globals, no-console */
const files = [
  '/',
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
const register = sums => {
  const filesToRegister = sums ? files.map((file, index) => {
    if (index > 0) {
      return `${file}?v=${sums[file]}`;
    }
    return file;
  }) : files;

  self.addEventListener('install', event => {
    event.waitUntil(caches
      .open('v1')
      .then(cache => cache.addAll(filesToRegister)));
  });

  self.addEventListener('fetch', e => {
    e.respondWith(caches
      .match(e.request)
      .then(response => response || fetch(e.request)));
  });
};

fetch('/sums.json')
  .then(response => {
    if (!response.ok) {
      console.error('[Tenno.tv][Worker] Something went wrong getting sums in service worker.');
      return undefined;
    }
    return response.json();
  })
  .then(register)
  .catch(error => {
    console.log('Looks like there was a problem: \n', error);
  });

/* eslint-enable no-restricted-globals, no-console */
