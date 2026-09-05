/**
 * 凯茜识字 (Cathy Literacy) - 儿童具象认知与零文字门槛渲染引擎
 * -----------------------------------------------------------------
 * 专为 3~6 岁不识字幼儿设计：
 * 1. 象形本源图：为基础汉字映射生动卡通实景图，实现“实物图 -> 甲骨文 -> 规范字”蜕变。
 * 2. 部首魔法符文：将抽象的“偏旁部首”转化为色彩鲜艳、有声音属性的“魔法符文图腾”。
 * 3. 拼音具身手势：攻克 b/d/p/q 镜像混淆，渲染左手/右手大拇指握拳手势及拟物道具。
 * 4. 严守工程红线：绝对零 Unicode Emoji，100% 经过严格标准 CSS 校验。
 */

import { GAME_ICONS } from "./gameIcons.js";
import { escapeHtml } from "./BaseModule.js";

/** 核心象形汉字对应的高清物象图映射库 */
export const CHAR_PICTOGRAM_ASSETS = {
  "日": "assets/images/pinyin_pair_ri.webp",
  "月": "assets/images/pinyin_pair_yue.webp",
  "水": "assets/images/pinyin_pair_shui.webp",
  "火": "assets/images/pinyin_pair_huo.webp",
  "山": "assets/images/pinyin_pair_shan.webp",
  "天": "assets/images/pinyin_pair_tian.webp",
  "风": "assets/images/pinyin_pair_feng.webp",
  "花": "assets/images/pinyin_pair_hua.webp",
  "鸟": "assets/images/pinyin_pair_niao.webp",
  "雨": "assets/images/pinyin_pair_yu.webp",
  "白": "assets/images/pinyin_pair_bai.webp",
  "木": "assets/images/family_mu.webp",
  "大": "assets/images/pinyin_pair_da.webp",
  "爸": "assets/images/pinyin_pair_ba.webp",
  "妈": "assets/images/pinyin_pair_ma.webp",
  "草": "assets/images/cover_flower_garden.webp",
  "田": "assets/images/cathy_island_forest.webp",
  "石": "assets/images/cathy_island_space.webp",
  "地": "assets/images/cathy_world_map.webp",
  "人": "assets/images/avatar_hero.webp",
  "手": "assets/images/icon_hand.webp",
  "鹅": "assets/images/poem_yonge.webp",
  "鱼": "assets/images/story_cat_fishing_p1.webp",
  "叶": "assets/images/family_ye.webp",
  "晴": "assets/images/family_qing.webp",
  "阳": "assets/images/family_ri.webp",
  "林": "assets/images/family_mu.webp",
  "森": "assets/images/family_mu.webp",
  "星": "assets/images/cover_space_rocket.webp",
  "云": "assets/images/story_water_drop_p1.webp",
  "牛": "assets/images/story_zodiac_p1.webp",
  "羊": "assets/images/story_zodiac_p1.webp",
  "马": "assets/images/story_zodiac_p2.webp",
  "兔": "assets/images/story_zodiac_p3.webp"
};

/**
 * 获取汉字对应的真实事物图
 * @param {string} char
 * @returns {string|null}
 */
export function getCharPictogramUrl(char) {
  return CHAR_PICTOGRAM_ASSETS[char] || null;
}

/**
 * 渲染象形物象原图 HTML 节点
 * @param {object} charItem
 * @param {string} customCls
 * @returns {string}
 */
export function renderNaturePictogram(charItem, customCls = "w-32 h-32 sm:w-40 sm:h-40") {
  if (!charItem) return "";
  const picUrl = getCharPictogramUrl(charItem.char);

  if (picUrl) {
    return `
      <div class="${customCls} rounded-3xl overflow-hidden border-4 border-amber-300 shadow-xl bg-amber-100 flex items-center justify-center relative animate-pulse-slow">
        <img src="${picUrl}" alt="${escapeHtml(charItem.char)}" class="w-full h-full object-cover select-none pointer-events-none" />
        <div class="absolute inset-0 bg-black/40"></div>
        <span class="absolute bottom-1.5 left-0 right-0 text-center text-xs font-black text-yellow-200 drop-shadow">
          自然实物图
        </span>
      </div>
    `;
  }

  // 优雅降级：用大图腾与甲骨文结合生成自然象形卡
  return `
    <div class="${customCls} rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-400 to-yellow-300 border-4 border-white shadow-xl flex flex-col items-center justify-center relative text-amber-950">
      <span class="text-6xl sm:text-7xl font-serif font-black drop-shadow-md">${escapeHtml(charItem.oracleGlyph || charItem.char)}</span>
      <span class="text-[11px] font-black bg-amber-900 text-yellow-200 px-3 py-0.5 rounded-full mt-1 border border-yellow-300">
        古人看到的画
      </span>
    </div>
  `;
}

/** 部首魔法符文图腾字典 */
export const RADICAL_RUNES = {
  "氵": { name: "水滴魔法", color: "from-sky-400 to-blue-600", iconBorder: "border-sky-300", hint: "水滴魔法！带它的字都和水有关哦！" },
  "水": { name: "水滴魔法", color: "from-sky-400 to-blue-600", iconBorder: "border-sky-300", hint: "水滴魔法！带它的字都和水有关哦！" },
  "艹": { name: "嫩芽魔法", color: "from-emerald-400 to-green-600", iconBorder: "border-emerald-300", hint: "嫩芽魔法！带它的字都和花草植物有关哦！" },
  "木": { name: "大树魔法", color: "from-amber-600 to-yellow-700", iconBorder: "border-amber-300", hint: "大树魔法！带它的字都和木头、森林有关哦！" },
  "口": { name: "笑嘴魔法", color: "from-rose-400 to-red-600", iconBorder: "border-rose-300", hint: "笑嘴魔法！带它的字都和说话、吃吃喝喝有关哦！" },
  "扌": { name: "小手魔法", color: "from-amber-400 to-orange-600", iconBorder: "border-yellow-300", hint: "小手魔法！带它的字都和小手动作有关哦！" },
  "手": { name: "小手魔法", color: "from-amber-400 to-orange-600", iconBorder: "border-yellow-300", hint: "小手魔法！带它的字都和小手动作有关哦！" },
  "足": { name: "奔跑魔法", color: "from-teal-400 to-cyan-600", iconBorder: "border-teal-300", hint: "奔跑魔法！带它的字都和走路、跳跃有关哦！" },
  "⻊": { name: "奔跑魔法", color: "from-teal-400 to-cyan-600", iconBorder: "border-teal-300", hint: "奔跑魔法！带它的字都和走路、跳跃有关哦！" },
  "火": { name: "火焰魔法", color: "from-orange-500 to-red-600", iconBorder: "border-orange-300", hint: "火焰魔法！带它的字都和光亮、温暖有关哦！" },
  "灬": { name: "火焰魔法", color: "from-orange-500 to-red-600", iconBorder: "border-orange-300", hint: "火焰魔法！带它的字都和光亮、温暖有关哦！" },
  "日": { name: "太阳魔法", color: "from-yellow-400 to-amber-600", iconBorder: "border-yellow-300", hint: "太阳魔法！带它的字都和白天、时间有关哦！" },
  "月": { name: "明月魔法", color: "from-indigo-400 to-purple-600", iconBorder: "border-indigo-300", hint: "明月魔法！带它的字都和夜晚、月亮有关哦！" },
  "犭": { name: "小爪魔法", color: "from-amber-500 to-orange-700", iconBorder: "border-amber-300", hint: "萌宠魔法！带它的字都是可爱的小动物哦！" },
  "讠": { name: "语言魔法", color: "from-blue-400 to-indigo-600", iconBorder: "border-blue-300", hint: "说话魔法！带它的字都和语言、声音有关哦！" },
  "心": { name: "爱心魔法", color: "from-pink-400 to-rose-600", iconBorder: "border-pink-300", hint: "爱心魔法！带它的字都和心里的感受有关哦！" },
  "忄": { name: "爱心魔法", color: "from-pink-400 to-rose-600", iconBorder: "border-pink-300", hint: "爱心魔法！带它的字都和心里的感受有关哦！" },
};

/**
 * 渲染部首魔法符文徽章（带即时语音提示，无需阅读文字）
 * @param {string} radical
 * @returns {string}
 */
export function renderRadicalRuneBadge(radical) {
  const rune = RADICAL_RUNES[radical] || {
    name: "汉字符文",
    color: "from-purple-400 to-indigo-600",
    iconBorder: "border-purple-300",
    hint: `这是「${radical}」字偏旁部首哦！`,
  };

  return `
    <button type="button" id="btn-radical-rune" class="group relative flex items-center gap-2 bg-gradient-to-r ${rune.color} text-white px-4 py-1.5 rounded-full border-2 ${rune.iconBorder} shadow-lg active:scale-95 transition-all cursor-pointer touch-target" data-speak="${escapeHtml(rune.hint)}" aria-label="${escapeHtml(rune.name)}">
      <span class="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center text-xs font-black ring-2 ring-white shrink-0">
        ${escapeHtml(radical || "字")}
      </span>
      <span class="text-xs font-black tracking-wide">${escapeHtml(rune.name)}</span>
      <span class="ml-1 text-yellow-200 shrink-0 flex items-center">${GAME_ICONS.sparkle("w-3.5 h-3.5")}</span>
    </button>
  `;
}

/** 拼音 b/d/p/q 左右手握拳手势与拟物道具图谱 */
export const PINYIN_GESTURES = {
  "b": {
    handSide: "left",
    thumbDir: "up",
    title: "左手竖起大拇指",
    mnemonicObj: "小收音机朝右放",
    audioCue: "伸出左手翘起大拇指，小拳头朝右就是 b！听广播 b b b！",
    image: "assets/images/pinyin_pair_ba.webp",
  },
  "d": {
    handSide: "right",
    thumbDir: "up",
    title: "右手竖起大拇指",
    mnemonicObj: "小马蹄印嗒嗒跑",
    audioCue: "伸出右手翘起大拇指，小拳头朝左就是 d！小马跑 d d d！",
    image: "assets/images/pinyin_pair_da.webp",
  },
  "p": {
    handSide: "left",
    thumbDir: "down",
    title: "左手大拇指向下",
    mnemonicObj: "小红水盆泼水啦",
    audioCue: "伸出左手大拇指向下，端着小盆泼水就是 p！泼水盆 p p p！",
    image: "assets/images/pinyin_pair_hua.webp",
  },
  "q": {
    handSide: "right",
    thumbDir: "down",
    title: "右手大拇指向下",
    mnemonicObj: "彩色彩气球飘呀飘",
    audioCue: "伸出右手大拇指向下，气球细线在右就是 q！放气球 q q q！",
    image: "assets/images/pinyin_pair_niao.webp",
  }
};

/**
 * 渲染 b/d/p/q 左右手具身手势对比微剧场 HTML
 * @param {string} pinyin
 * @returns {string}
 */
export function renderPinyinGestureVisual(pinyin) {
  const p = (pinyin || "").toLowerCase().trim();
  const info = PINYIN_GESTURES[p];
  if (!info) return "";

  const isLeft = info.handSide === "left";
  const isUp = info.thumbDir === "up";

  return `
    <div id="pinyin-gesture-card" class="w-full bg-amber-500/20 rounded-3xl p-4 border-2 border-amber-300/80 shadow-2xl flex flex-col items-center select-none animate-fade-in my-2">
      <div class="flex items-center justify-between w-full mb-3 px-2">
        <span class="bg-amber-400 text-amber-950 font-black text-xs px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
          ${GAME_ICONS.sparkle("w-4 h-4")}
          <span>小手比一比 · 永远不认错</span>
        </span>
        <button type="button" id="btn-gesture-listen" class="btn-game-orange text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow cursor-pointer active:scale-95" data-speak="${escapeHtml(info.audioCue)}">
          ${GAME_ICONS.speaker("w-3.5 h-3.5")}
          <span>听口诀</span>
        </button>
      </div>

      <div class="grid grid-cols-2 gap-4 w-full items-stretch">
        <!-- 具身手势演示 -->
        <div class="bg-white/90 rounded-2xl p-4 border-2 border-amber-300 flex flex-col items-center justify-center text-center shadow-md">
          <div class="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-amber-100 flex items-center justify-center border-2 border-dashed border-amber-400 mb-2">
            <span class="w-16 h-16 flex items-center justify-center">
              ${GAME_ICONS.hand("w-12 h-12")}
            </span>
          </div>
          <h4 class="text-xs sm:text-sm font-black text-amber-950">${escapeHtml(info.title)}</h4>
          <span class="text-[10px] font-bold text-amber-800 mt-0.5">就像拼音字母「${p}」一样！</span>
        </div>

        <!-- 拟物实物道具图 -->
        <div class="bg-white/90 rounded-2xl p-4 border-2 border-amber-300 flex flex-col items-center justify-center text-center shadow-md">
          <div class="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-amber-400 mb-2 shadow-inner">
            <img src="${info.image}" alt="${p}" class="w-full h-full object-cover" />
          </div>
          <h4 class="text-xs sm:text-sm font-black text-amber-950">${escapeHtml(info.mnemonicObj)}</h4>
          <span class="text-[10px] font-bold text-orange-700 mt-0.5">认准图案不糊涂</span>
        </div>
      </div>
    </div>
  `;
}
