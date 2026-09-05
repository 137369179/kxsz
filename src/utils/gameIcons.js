/**
 * 凯茜识字 (Cathy Literacy) - 核心游戏化自适应 3D 图标引擎
 * 全部采用高质量 3D 渲染图片资产（Zero Unicode Emoji & Zero SVG）
 *
 * 智能自适应特性:
 *  1. 自动注入 shrink-0 select-none pointer-events-none inline-block align-middle 防止弹性变形与文本换行挤压
 *  2. 智能区隔形状规范：圆形徽章 (rounded-full) 与道具画卷 (rounded-xl)，支持自定义覆盖
 *  3. 纯 3D 道具采用 object-contain 保持完整立体光影；场景与人物采用 object-cover
 *  4. 完美支持多端响应式断点 (w-4 h-4 sm:w-6 sm:h-6)
 */

export const GAME_ICONS = {
  _parseIconParams: function(args, defaultType = "badge", defaultFit = "object-contain") {
    let customCls = "";
    let extra = {};
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (typeof arg === "boolean") {
        if (Object.keys(extra).length === 0) extra.firstBool = arg;
        else if (Object.keys(extra).length === 1) extra.secondBool = arg;
      } else if (typeof arg === "string" && arg.trim().length > 0) {
        customCls = arg.trim();
      }
    }

    // 基础尺寸：若调用方未指定任何宽高类名，则赋予标准大号 w-8 h-8 sm:w-10 sm:h-10
    const hasWidth = /\b(w-|max-w-|min-w-)/.test(customCls);
    const hasHeight = /\b(h-|max-h-|min-h-)/.test(customCls);
    const sizeCls = (!hasWidth && !hasHeight) ? "w-8 h-8 sm:w-10 sm:h-10" : "";

    // 智能形状：若调用方指定了 rounded- 则尊重调用方，否则按类型赋予
    const hasRounded = /\brounded(-[a-z0-9]+)?\b/.test(customCls);
    let roundCls = "";
    if (!hasRounded) {
      roundCls = defaultType === "badge" ? "rounded-full" : defaultType === "item" ? "rounded-xl" : "rounded-2xl";
    }

    // 智能填充：若调用方指定了 object- 则尊重调用方，否则按类型赋予
    const hasObjectFit = /\bobject-(contain|cover|fill|none|scale-down)\b/.test(customCls);
    const fitCls = !hasObjectFit ? defaultFit : "";

    // 组装最终安全的 CSS 类名序列
    const baseClasses = "shrink-0 select-none pointer-events-none inline-block align-middle";
    const finalCls = [baseClasses, sizeCls, roundCls, fitCls, customCls]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    return { cls: finalCls, extra };
  },

  // -------------------------------------------------------------------------
  // 1. 三大主题岛屿与大地图全景资产
  // -------------------------------------------------------------------------
  islandForest: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "badge", "object-cover");
    return `<img src="assets/images/cathy_island_forest.webp" class="${cls} shadow-md" alt="forest" data-fallback="assets/images/icon_home.webp" />`;
  },
  islandTown: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "badge", "object-cover");
    return `<img src="assets/images/cathy_island_life.webp" class="${cls} shadow-md" alt="town" data-fallback="assets/images/icon_star.webp" />`;
  },
  islandSpace: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "badge", "object-cover");
    return `<img src="assets/images/cathy_island_space.webp" class="${cls} shadow-md" alt="space" data-fallback="assets/images/icon_sparkle.webp" />`;
  },

  // -------------------------------------------------------------------------
  // 2. 核心通关与状态判定图标
  // -------------------------------------------------------------------------
  check: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "badge", "object-contain");
    return `<img src="assets/images/icon_check.webp" class="${cls} shadow-md" alt="check" data-fallback="assets/images/icon_star.webp" />`;
  },
  star: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args, "badge", "object-contain");
    const isGrey = extra.firstBool || false;
    const greyClass = isGrey ? "grayscale opacity-50" : "";
    return `<img src="assets/images/icon_star.webp" class="${cls} shadow-md ${greyClass}" alt="star" />`;
  },
  coin: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "badge", "object-contain");
    return `<img src="assets/images/icon_coin.webp" class="${cls} shadow-md" alt="coin" />`;
  },
  trophy: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "badge", "object-contain");
    return `<img src="assets/images/icon_trophy.webp" class="${cls} shadow-md" alt="trophy" />`;
  },
  crown: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "badge", "object-contain");
    return `<img src="assets/images/icon_crown.gif" class="${cls}" alt="crown" data-fallback="assets/images/icon_crown.png" />`;
  },
  gem: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "badge", "object-contain");
    return `<img src="assets/images/icon_gem.webp" class="${cls} shadow-md" alt="gem" data-fallback="assets/images/icon_sparkle.webp" />`;
  },
  sparkle: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "badge", "object-contain");
    return `<img src="assets/images/icon_sparkle.webp" class="${cls} shadow-md" alt="sparkle" />`;
  },

  // -------------------------------------------------------------------------
  // 3. 学习交互与道具图标 (书籍、卷轴、字卡、书写笔)
  // -------------------------------------------------------------------------
  book: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "item", "object-contain");
    return `<img src="assets/images/icon_book.webp" class="${cls} shadow-md" alt="book" />`;
  },
  scroll: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "item", "object-contain");
    return `<img src="assets/images/icon_scroll.webp" class="${cls} shadow-md" alt="scroll" data-fallback="assets/images/icon_book.webp" />`;
  },
  cards: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "item", "object-contain");
    return `<img src="assets/images/icon_cards.webp" class="${cls} shadow-md" alt="cards" />`;
  },
  chest: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "item", "object-contain");
    return `<img src="assets/images/icon_chest.webp" class="${cls} shadow-md" alt="chest" />`;
  },
  pen: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "item", "object-contain");
    return `<img src="assets/images/icon_pen.webp" class="${cls} shadow-md" alt="pen" />`;
  },
  brush: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "item", "object-contain");
    return `<img src="assets/images/icon_brush.webp" class="${cls} shadow-md" alt="brush" data-fallback="assets/images/icon_pen.webp" />`;
  },
  hand: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "badge", "object-contain");
    return `<img src="assets/images/icon_hand.webp" class="${cls} shadow-md" alt="hand" data-fallback="assets/images/icon_brush.webp" />`;
  },
  swords: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "item", "object-contain");
    return `<img src="assets/images/icon_swords.webp" class="${cls} shadow-md" alt="swords" data-fallback="assets/images/icon_chest.webp" />`;
  },
  calendar: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "item", "object-contain");
    return `<img src="assets/images/icon_calendar.webp" class="${cls} shadow-md" alt="calendar" />`;
  },
  arcade: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "item", "object-cover");
    return `<img src="assets/images/cathy_arcade_cover.webp" class="${cls} shadow-md" alt="arcade" data-fallback="assets/images/icon_cards.webp" />`;
  },

  // -------------------------------------------------------------------------
  // 4. 声音与音频麦克风
  // -------------------------------------------------------------------------
  speaker: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args, "badge", "object-contain");
    const isMuted = extra.firstBool || false;
    const src = isMuted ? "icon_speaker_muted.webp" : "icon_speaker.webp";
    return `<img src="assets/images/${src}" class="${cls} shadow-md" alt="speaker" data-fallback="assets/images/icon_speaker.webp" />`;
  },
  audio: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "badge", "object-contain");
    return `<img src="assets/images/icon_mic.webp" class="${cls} shadow-md" alt="audio" data-fallback="assets/images/icon_speaker.webp" />`;
  },
  mic: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "badge", "object-contain");
    return `<img src="assets/images/icon_mic.webp" class="${cls} shadow-md" alt="mic" data-fallback="assets/images/icon_speaker.webp" />`;
  },

  // -------------------------------------------------------------------------
  // 5. 导航、安全与系统设置
  // -------------------------------------------------------------------------
  home: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "badge", "object-contain");
    return `<img src="assets/images/icon_home.webp" class="${cls} shadow-md" alt="home" />`;
  },
  back: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "badge", "object-contain");
    return `<img src="assets/images/icon_back.webp" class="${cls} shadow-md" alt="back" />`;
  },
  compass: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "badge", "object-contain");
    return `<img src="assets/images/icon_compass.webp" class="${cls} shadow-md" alt="compass" data-fallback="assets/images/icon_home.webp" />`;
  },
  gear: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "badge", "object-contain");
    return `<img src="assets/images/icon_gear.webp" class="${cls} shadow-md" alt="gear" data-fallback="assets/images/icon_lock.webp" />`;
  },
  lock: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "badge", "object-contain");
    return `<img src="assets/images/icon_lock.webp" class="${cls} shadow-md" alt="lock" />`;
  },
  shieldLock: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "badge", "object-contain");
    return `<img src="assets/images/icon_shield_lock.webp" class="${cls} shadow-md" alt="shieldLock" data-fallback="assets/images/icon_parent.webp" />`;
  },
  parent: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "badge", "object-contain");
    return `<img src="assets/images/icon_parent.webp" class="${cls} shadow-md" alt="parent" />`;
  },
  bell: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "badge", "object-contain");
    return `<img src="assets/images/icon_bell.webp" class="${cls} shadow-md" alt="bell" data-fallback="assets/images/icon_book.webp" />`;
  },
  reviewBell: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "badge", "object-contain");
    return `<img src="assets/images/icon_bell.webp" class="${cls} shadow-md" alt="review" data-fallback="assets/images/icon_book.webp" />`;
  },
  print: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "item", "object-contain");
    return `<img src="assets/images/icon_print.webp" class="${cls} shadow-md" alt="print" data-fallback="assets/images/icon_book.webp" />`;
  },
  monster: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "badge", "object-cover");
    return `<img src="assets/images/cathy_boss_monster.webp" class="${cls} shadow-md" alt="monster" data-fallback="assets/images/icon_parent.webp" />`;
  },
  rocket: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args, "badge", "object-contain");
    return `<img src="assets/images/cover_space_rocket.webp" class="${cls} shadow-md" alt="rocket" data-fallback="assets/images/icon_sparkle.webp" />`;
  }
};

if (typeof window !== "undefined") {
  window.GAME_ICONS = GAME_ICONS;
}

export default GAME_ICONS;
