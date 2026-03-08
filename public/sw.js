/* Eduiaol PWA Service Worker - offline & installability */
const CACHE_NAME = "eduiaol-v1"
const urlsToCache = ["/", "/manifest.webmanifest"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)).then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.map((name) => name !== CACHE_NAME && caches.delete(name)))).then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate" || (event.request.method === "GET" && event.request.headers.get("accept")?.includes("text/html"))) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          return res
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/")))
    )
    return
  }
  event.respondWith(
    fetch(event.request).then((res) => {
      if (res.ok && event.request.url.startsWith(self.location.origin)) {
        const clone = res.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
      }
      return res
    }).catch(() => caches.match(event.request))
  )
})
