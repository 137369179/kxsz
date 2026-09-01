const CACHE_NAME = "cathy-literacy-v2-7-1"; // 2026-09-01: 默认音色切换为晓晓·明亮少女

// 核心数据文件预缓存列表（install 阶段离线就绪）
const CORE_ASSETS = [
  "./index.html",
  "./style.css?v=2.7.0",
  "./src/app.js?v=2.7.0",
  "./src/utils/eventBus.js",
  "./src/utils/storageManager.js",
  "./src/utils/soundEngine.js",
  "./src/utils/neuralVoice.js",
  "./src/utils/ebbinghaus.js",
  "./src/utils/hanziEngine.js",
  "./src/utils/gameIcons.js",
  "./src/data/characters.js",
  "./src/data/books.js",
];

// 静态资源走 Cache-First（离线秒开）
const STATIC_CACHEABLE = /\.(js|css|html|json|jpg|jpeg|png|gif|svg|woff2?|ttf|ico)$/i;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // 仅缓存 http 和 https 请求，拦截 chrome-extension:// 等不受支持的 scheme
  const url = event.request.url;
  if (!url.startsWith("http://") && !url.startsWith("https://")) return;

  const isStatic = STATIC_CACHEABLE.test(url);

  if (isStatic) {
    // Cache-First：先读缓存，命中则直接返回；未命中则网络获取并回填缓存
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return networkResponse;
          })
          .catch(() => caches.match("./index.html")); // 极端情况回退首页
      })
    );
  } else {
    // 非静态资源（如 API 请求）：Network-First
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
