const CACHE = "pontaj-v633a02a4";
const CORE = ["./", "./index.html", "./manifest.json", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-512-maskable.png"];
const CDN = ["https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js", "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js", "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(async (c) => {
    await c.addAll(CORE.map((u) => new Request(u, { cache: "reload" })));
    await Promise.all(CDN.map((u) => fetch(u, { mode: "no-cors" }).then((r) => c.put(u, r)).catch(() => {})));
  }));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
// Pagina: intai reteaua (ca sa vina versiunea noua), cache doar fara semnal. Restul: cache, apoi reteaua.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const isPage = e.request.mode === "navigate";
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    if (isPage) {
      try { const r = await fetch(e.request.url, { cache: "no-cache", credentials: "same-origin" }); if (r.ok) c.put("./index.html", r.clone()); return r; }
      catch (_) { return (await c.match("./index.html")) || Response.error(); }
    }
    const hit = await c.match(e.request);
    if (hit) return hit;
    try {
      const r = await fetch(e.request);
      if (r.ok || r.type === "opaque") c.put(e.request, r.clone());
      return r;
    } catch (_) { return Response.error(); }
  })());
});
