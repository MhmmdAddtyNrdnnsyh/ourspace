const CACHE_VERSION = 'ourspace-v1'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const FONT_CACHE = `${CACHE_VERSION}-fonts`
const IMAGE_CACHE = `${CACHE_VERSION}-images`
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`

const STATIC_PRECACHE_URLS = [
  '/',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/app-icon.svg',
]

const STATIC_EXTENSIONS = /\.(?:css|js)$/
const FONT_EXTENSIONS = /\.(?:woff2?|ttf|otf|eot)$/
const IMAGE_EXTENSIONS = /\.(?:png|jpg|jpeg|gif|svg|webp|ico)$/

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_PRECACHE_URLS)
    }),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name.startsWith('ourspace-') && name !== CACHE_VERSION + '-static' && name !== CACHE_VERSION + '-fonts' && name !== CACHE_VERSION + '-images' && name !== CACHE_VERSION + '-runtime'
          })
          .map((name) => caches.delete(name)),
      )
    }).then(() => {
      self.clients.claim()
    }),
  )
})

function isStaticAsset(url) {
  return url.pathname.startsWith('/assets/')
}

function isFont(url) {
  return FONT_EXTENSIONS.test(url.pathname)
}

function isImage(url) {
  return IMAGE_EXTENSIONS.test(url.pathname)
}

function isNavigationRequest(request, url) {
  return (
    request.mode === 'navigate' ||
    (request.method === 'GET' &&
      request.headers.get('accept') &&
      request.headers.get('accept').includes('text/html'))
  )
}

function staleWhileRevalidate(request, cacheName) {
  return caches.open(cacheName).then((cache) => {
    return cache.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone())
          }
          return networkResponse
        })
        .catch(() => cachedResponse)

      return cachedResponse || fetchPromise
    })
  })
}

function cacheFirst(request, cacheName) {
  return caches.open(cacheName).then((cache) => {
    return cache.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          cache.put(request, networkResponse.clone())
        }
        return networkResponse
      })
    })
  })
}

function networkFirst(request, cacheName) {
  return caches.open(cacheName).then((cache) => {
    return fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          cache.put(request, networkResponse.clone())
        }
        return networkResponse
      })
      .catch(() => {
        return cache.match(request)
      })
  })
}

function navigationFallback(request) {
  return caches.match('/').then((cachedRoot) => {
    if (cachedRoot) {
      return cachedRoot
    }
    return fetch(request)
  })
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') {
    return
  }

  if (url.origin !== self.location.origin) {
    return
  }

  if (url.pathname.startsWith('/api/')) {
    return
  }

  if (isFont(url)) {
    event.respondWith(cacheFirst(request, FONT_CACHE))
    return
  }

  if (isImage(url)) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE))
    return
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      staleWhileRevalidate(request, STATIC_CACHE)
    )
    return
  }

  if (isNavigationRequest(request, url)) {
    event.respondWith(
      networkFirst(request, RUNTIME_CACHE).catch(() => {
        return navigationFallback(request)
      }),
    )
    return
  }
})