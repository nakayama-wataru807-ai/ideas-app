// 開くときは手元のキャッシュを即表示し、裏で最新を取ってきて差し替える（stale-while-revalidate）。
const C = 'ideas-app-v1';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const isData = new URL(e.request.url).pathname.endsWith('/data.enc');
  e.respondWith(caches.open(C).then(async c => {
    const hit = await c.match(e.request);
    const net = fetch(e.request, {cache: 'no-cache'}).then(async r => {
      if (r.ok || r.type === 'opaque') {
        if (isData && hit) {
          const [a, b] = await Promise.all([hit.clone().text(), r.clone().text()]);
          await c.put(e.request, r.clone());
          if (a !== b) (await self.clients.matchAll()).forEach(cl => cl.postMessage('data-updated'));
        } else await c.put(e.request, r.clone());
      }
      return r;
    }).catch(() => hit);
    return hit || net;
  }));
});
