import { copyFile, readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const root = resolve(import.meta.dirname, '../dist');
// Keep the previous URL available for existing installs on servers that support
// .webmanifest. New installs and the offline cache use .json for IIS compatibility.
await copyFile(resolve(root, 'manifest.json'), resolve(root, 'manifest.webmanifest'));
const assets = (await readdir(resolve(root, 'assets'))).map(file => '/assets/' + file);
const shell = [
  '/',
  '/index.html',
  '/manifest.json',
  '/push-events.js',
  '/ic_launcher_192.png',
  '/ic_launcher_512.png',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-512.png',
  ...assets,
];

const digest = createHash('sha256');
for (const path of shell.filter(path => path !== '/')) {
  digest.update(await readFile(resolve(root, path.slice(1))));
}
const hash = digest.digest('hex').slice(0, 12);

await writeFile(resolve(root, 'sw.js'), `
importScripts('/push-events.js');
const CACHE = 'egmf-shell-${hash}';
const SHELL = ${JSON.stringify(shell)};
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL))));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('egmf-shell-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('message', event => { if (event.data?.type === 'ACTIVATE_UPDATE') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Credentials, private documents and writes are NEVER stored or replayed.
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/') || event.request.method !== 'GET') return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('/index.html')));
    return;
  }
  if (SHELL.includes(url.pathname)) event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
`);
console.log('PWA shell generated: ' + hash);
