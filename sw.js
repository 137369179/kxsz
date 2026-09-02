// 版本号单一来源：注册 URL ?v= 由 index.html 从 version.js 注入
const _ver = new URL(self.location.href).searchParams.get("v") || "2.7.7";
const CACHE_NAME = `cathy-literacy-v${_ver.replace(/\./g, "-")}`; // 动态读取版本，避免硬编码（与 version.js 对齐）

// 核心数据文件预缓存列表（install 阶段离线就绪）
const CORE_ASSETS = [
  "./index.html",
  `./assets/css/prod.css?v=${_ver}`,
  `./src/app.js?v=${_ver}`,
  "./src/utils/eventBus.js",
  "./src/utils/storageManager.js",
  "./src/utils/version.js",
  "./src/utils/soundEngine.js",
  "./src/utils/neuralVoice.js",
  "./src/utils/ebbinghaus.js",
  "./src/utils/hanziEngine.js",
  "./src/utils/gameIcons.js",
  "./src/utils/pronunciationEval.js",
  "./src/utils/readingModes.js",
  "./src/utils/strokeVoiceSync.js",
  "./src/utils/drillEngine.js",
  "./src/utils/rewardEngine.js",
  "./src/utils/bgmAndChant.js",
  "./src/utils/dspChain.js",
  "./src/utils/g2p.js",
  "./src/utils/audioSafety.js",
  "./src/utils/parentVoice.js",
  "./src/utils/playSceneEngine.js",
  "./src/data/characters.js",
  "./src/data/books.js",
  "./src/data/idioms.js",
  "./src/data/shop.js",
  // 核心图片资源
  "./assets/images/cathy_mascot.webp",
  "./assets/images/cathy_world_map.webp",
  "./assets/images/icon_star.webp",
  "./assets/images/icon_coin.webp",
  "./assets/images/icon_trophy.webp",
  "./assets/images/icon_home.webp",
  "./assets/images/icon_book.webp",
  "./assets/images/icon_cards.webp",
  "./assets/images/icon_pen.webp",
  "./assets/images/icon_speaker.webp",
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

  // 忽略本地 voice-server (8766) 请求，直接走网络直连，不经过 SW 拦截与重复缓存
  if (url.includes(":8766")) return;

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
          .catch(() => caches.match("./index.html").then(res => res || new Response("Offline", { status: 503 }))); // 极端情况回退首页
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
        .catch(() => caches.match(event.request).then(res => res || new Response("Offline", { status: 503 })))
    );
  }
});
