/* Wediplan service worker — app shell cache + stale-while-revalidate for API.
   Plan & favoriti su u localStorage, pa rade offline i bez mreže. */
const SHELL = "wediplan-shell-v1";
const RUNTIME = "wediplan-runtime-v1";
const PRECACHE = ["/", "/budzet", "/usporedba", "/profil", "/manifest.webmanifest", "/data/croatia-regions.geojson"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => ![SHELL, RUNTIME].includes(k)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;

  // API + static data: stale-while-revalidate
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/data/") || url.pathname.startsWith("/_next/static/")) {
    e.respondWith(
      caches.open(RUNTIME).then(async (cache) => {
        const cached = await cache.match(e.request);
        const fresh = fetch(e.request)
          .then((res) => {
            if (res.ok) cache.put(e.request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || fresh;
      })
    );
    return;
  }

  // navigations: network first, fall back to cached shell
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          caches.open(RUNTIME).then((c) => c.put(e.request, res.clone()));
          return res;
        })
        .catch(async () => (await caches.match(e.request)) || (await caches.match("/")))
    );
  }
});
