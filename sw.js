// 版本号单一来源：注册 URL ?v= 由 index.html 从 version.js 注入
const _ver = new URL(self.location.href).searchParams.get("v") || "2.9.7";
const CACHE_NAME = `cathy-literacy-v${_ver.replace(/\./g, "-")}`; // 动态读取版本，避免硬编码（与 version.js 对齐）

// 核心数据文件预缓存列表（源码直出模式默认；构建模式优先用 sw-manifest.json）
const DEFAULT_CORE_ASSETS = [
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
  "./src/utils/morphEngine.js",
  "./src/utils/qrCode.js",
  "./src/utils/playGames/index.js",
  "./src/utils/playGames/playRubReveal.js",
  "./src/utils/playGames/playFeedCreature.js",
  "./src/utils/playGames/playSlingshot.js",
  "./src/utils/playGames/playSproutGrowth.js",
  "./src/utils/playGames/playMagneticFusion.js",
  "./src/utils/audioSafety.js",
  "./src/utils/parentVoice.js",
  "./src/utils/playSceneEngine.js",
  "./src/data/characters.js",
  "./src/data/characterDetails.js",
  "./src/data/books.js",
  "./src/data/idioms.js",
  "./src/data/shop.js",
  // 核心图片资源 (100% 本地 3D 渲染质感位图，支持完全离线学习)
  "./assets/images/cathy_mascot.webp",
  "./assets/images/cathy_world_map.webp",
  "./assets/images/cathy_arcade_cover.webp",
  "./assets/images/cathy_boss_monster.webp",
  "./assets/images/cathy_golden_chest.webp",
  "./assets/images/cathy_island_forest.webp",
  "./assets/images/cathy_island_life.webp",
  "./assets/images/cathy_island_space.webp",
  "./assets/images/cathy_storybook_cover.webp",
  "./assets/images/cathy_trophy_gold.webp",
  "./assets/images/icon_check.webp",
  "./assets/images/icon_star.webp",
  "./assets/images/icon_coin.webp",
  "./assets/images/icon_trophy.webp",
  "./assets/images/icon_home.webp",
  "./assets/images/icon_book.webp",
  "./assets/images/icon_cards.webp",
  "./assets/images/icon_pen.webp",
  "./assets/images/icon_speaker.webp",
  "./assets/images/icon_speaker_muted.webp",
  "./assets/images/icon_bell.webp",
  "./assets/images/icon_brush.webp",
  "./assets/images/icon_calendar.webp",
  "./assets/images/icon_chest.webp",
  "./assets/images/icon_compass.webp",
  "./assets/images/icon_crown.gif",
  "./assets/images/icon_crown.png",
  "./assets/images/icon_crown.webp",
  "./assets/images/icon_gear.webp",
  "./assets/images/icon_gem.webp",
  "./assets/images/icon_lock.webp",
  "./assets/images/icon_mic.webp",
  "./assets/images/icon_parent.webp",
  "./assets/images/icon_scroll.webp",
  "./assets/images/icon_sparkle.webp",
  "./assets/images/icon_swords.webp",
  "./assets/images/icon_hand.webp",
  "./assets/images/icon_print.webp",
  "./assets/images/icon_shield_lock.webp",
  "./assets/images/avatar_fairy.webp",
  "./assets/images/avatar_hero.webp",
  "./assets/images/avatar_unicorn.webp",
  "./assets/images/avatar_panda.webp",
  "./assets/images/cover_cat_fishing.webp",
  "./assets/images/cover_midautumn.webp",
  "./assets/images/cover_space_rocket.webp",
  "./assets/images/cover_dinosaur.webp",
  "./assets/images/cover_dragonboat.webp",
  "./assets/images/cover_bear_share.webp",
  "./assets/images/cover_sleep_alone.webp",
  "./assets/images/cover_forest_squirrel.webp",
  "./assets/images/cover_water_drop.webp",
  "./assets/images/cover_forest_market.webp",
  "./assets/images/cover_town_inventor.webp",
  "./assets/images/cover_space_ship.webp",
  "./assets/images/cover_forest_animals.webp",
  "./assets/images/cover_monkey_mountain.webp",
  "./assets/images/cover_flower_garden.webp",
  "./assets/images/cover_good_friends.webp",
  "./assets/images/cover_happy_school.webp",
  "./assets/images/cover_good_children.webp",
  "./assets/images/cover_monkey_fruit.webp",
  "./assets/images/cover_four_seasons.webp",
  "./assets/images/cover_color_magic.webp",
  "./assets/images/cover_happy_town.webp",
  "./assets/images/cover_busy_bee.webp",
  "./assets/images/cover_little_astronaut.webp",
  "./assets/images/poem_yonge.webp",
  "./assets/images/poem_jingyesi.webp",
  "./assets/images/poem_chunxiao.webp",
  "./assets/images/poem_minnong.webp",
  "./assets/images/poem_dengguanquelou.webp",
  "./assets/images/poem_jiangxue.webp",
  "./assets/images/poem_chishang.webp",
  "./assets/images/poem_xiaochi.webp",
  "./assets/images/poem_gulangyuexing.webp",
  "./assets/images/poem_guyuan_cao.webp",
  "./assets/images/poem_xunyingzhe.webp",
  "./assets/images/poem_wanglushan.webp",
  "./assets/images/poem_zaofabaidi.webp",
  "./assets/images/poem_jueju.webp",
  "./assets/images/poem_feng.webp",
  "./assets/images/poem_meihua.webp",
  "./assets/images/poem_saixiaqu.webp",
  "./assets/images/poem_shanxing.webp",
  "./assets/images/poem_jiangnan.webp",
  "./assets/images/poem_qingming.webp",
  "./assets/images/poem_youziyin.webp",
  "./assets/images/poem_yuanri.webp",
  "./assets/images/idiom_shouzhudaitu.webp",
  "./assets/images/idiom_bamiaozhuzhang.webp",
  "./assets/images/idiom_wangyangbulao.webp",
  "./assets/images/idiom_hualongdianjing.webp",
  "./assets/images/idiom_hujiahuwei.webp",
  "./assets/images/idiom_jingdizhiwa.webp",
  "./assets/images/idiom_mangrenmoxiang.webp",
  "./assets/images/idiom_saiwengshima.webp",
  "./assets/images/idiom_wenjiciwu.webp",
  "./assets/images/idiom_shuidishichuan.webp",
  "./assets/images/idiom_yanerdailing.webp",
  "./assets/images/idiom_kezhouqiujian.webp",
  "./assets/images/idiom_huashetianzu.webp",
  "./assets/images/idiom_yegonghaolong.webp",
  "./assets/images/idiom_beigongsheying.webp",
  "./assets/images/idiom_maidaihuanzhu.webp",
  "./assets/images/idiom_yugongyishan.webp",
  "./assets/images/idiom_chengmenlixue.webp",
  "./assets/images/idiom_shouboushijuan.webp",
  "./assets/images/idiom_xuanliangcigu.webp",
  "./assets/images/idiom_zixiangmaodun.webp",
  "./assets/images/idiom_lanyuchongshu.webp",
  "./assets/images/story_midautumn_p1.webp",
  "./assets/images/story_midautumn_p2.webp",
  "./assets/images/story_midautumn_p3.webp",
  "./assets/images/story_dragonboat_p1.webp",
  "./assets/images/story_dragonboat_p2.webp",
  "./assets/images/story_dragonboat_p3.webp",
  "./assets/images/story_cat_fishing_p1.webp",
  "./assets/images/story_cat_fishing_p2.webp",
  "./assets/images/story_cat_fishing_p3.webp"
];

// 静态资源走 Cache-First（离线秒开，支持 webp 图像格式）
const STATIC_CACHEABLE = /\.(js|css|html|json|jpg|jpeg|png|gif|svg|webp|woff2?|ttf|ico)$/i;

// 构建模式（dist/）优先用 tools/_gen_sw_manifest.mjs 生成的实际产物清单；
// 源码直出模式无 sw-manifest.json，回退硬编码 DEFAULT_CORE_ASSETS。
async function resolvePrecacheList() {
  try {
    const res = await fetch("./sw-manifest.json", { cache: "no-store" });
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list) && list.length) return list;
    }
  } catch (e) {}
  return DEFAULT_CORE_ASSETS;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const assets = await resolvePrecacheList();
      return Promise.allSettled(
        assets.map((asset) =>
          fetch(asset)
            .then((res) => {
              if (res.ok) return cache.put(asset, res);
            })
            .catch(() => {})
        )
      );
    })
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
