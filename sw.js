// 常にネットワークの最新を先に取り、取れたときだけ手元に控える（オフラインのときは控えを出す）。
// v1 は「手元を先に出す」作りで、iPhone で古い data.enc が居座ったため、v2 で作り直し、古い控えは起動時に消す。
const C = 'ideas-app-v2';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, {cache: 'no-cache'})
      .then(r => {
        if (r.ok) { const copy = r.clone(); caches.open(C).then(c => c.put(e.request, copy)).catch(() => {}); }
        return r;
      })
      .catch(() => caches.match(e.request).then(hit => hit || Response.error()))
  );
});
