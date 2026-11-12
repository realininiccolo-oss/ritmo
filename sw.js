/* Ritmo: l'app si apre subito dalla cache e si aggiorna in sottofondo. I dati cifrati passano sempre dalla rete. */
const V = 'ritmo-v12';
const SHELL = ['./', './index.html', './ornrarv-lib.js', './ornrarv.css', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.pathname.endsWith('data.enc.json')) return;
  const fonts = u.hostname.endsWith('fonts.googleapis.com') || u.hostname.endsWith('fonts.gstatic.com');
  if (u.origin !== location.origin && !fonts) return;
  e.respondWith(caches.open(V).then(async (c) => {
    const hit = await c.match(r, { ignoreSearch: !fonts });
    const net = fetch(r).then((res) => { if (res && (res.ok || res.type === 'opaque')) c.put(r, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const res = await net;
    return res || (r.mode === 'navigate' ? c.match('./index.html') : Response.error());
  }));
});
