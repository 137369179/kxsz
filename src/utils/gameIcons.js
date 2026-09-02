/**
 * 凯茜识字 (Cathy Literacy) - 核心游戏化图标库
 * 全部采用高质量 3D 渲染图片资产（Zero Unicode Emoji & Zero SVG）
 *
 * 调用示例:
 *   GAME_ICONS.star()          - 默认尺寸 (w-6 h-6)
 *   GAME_ICONS.star(true)      - 灰色/未点亮状态
 *   GAME_ICONS.star("w-8 h-8") - 自定义宽高样式
 *   GAME_ICONS.speaker(true)   - 静音图标
 */

export const GAME_ICONS = {
  _parseIconParams: function(args) {
    let cls = "w-6 h-6";
    let extra = {};
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (typeof arg === "boolean") {
        if (Object.keys(extra).length === 0) extra.firstBool = arg;
        else if (Object.keys(extra).length === 1) extra.secondBool = arg;
      } else if (typeof arg === "string" && (arg.startsWith("w-") || arg.includes(" "))) {
        cls = arg;
      }
    }
    return { cls, extra };
  },

  islandForest: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/cathy_island_forest.webp" class="${cls} object-cover rounded-full shadow-md" alt="forest" onerror="this.src='assets/images/icon_home.webp'" />`;
  },
  islandTown: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/cathy_island_life.webp" class="${cls} object-cover rounded-full shadow-md" alt="town" onerror="this.src='assets/images/icon_star.webp'" />`;
  },
  islandSpace: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_sparkle.webp" class="${cls} object-cover rounded-full shadow-md" alt="space" />`;
  },
  arcade: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/cathy_arcade_cover.webp" class="${cls} object-cover rounded-full shadow-md" alt="arcade" onerror="this.src='assets/images/icon_cards.webp'" />`;
  },
  coin: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_coin.webp" class="${cls} object-cover rounded-full shadow-md" alt="coin" />`;
  },
  star: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    const isGrey = extra.firstBool || false;
    const greyClass = isGrey ? "grayscale opacity-50" : "";
    return `<img src="assets/images/icon_star.webp" class="${cls} object-cover rounded-full shadow-md ${greyClass}" alt="star" />`;
  },
  trophy: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_trophy.webp" class="${cls} object-cover rounded-full shadow-md" alt="trophy" />`;
  },
  lock: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_lock.webp" class="${cls} object-cover rounded-full shadow-md" alt="lock" />`;
  },
  chest: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_chest.webp" class="${cls} object-cover rounded-full shadow-md" alt="chest" />`;
  },
  home: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_home.webp" class="${cls} object-cover rounded-full shadow-md" alt="home" />`;
  },
  back: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_back.webp" class="${cls} object-cover rounded-full shadow-md" alt="back" />`;
  },
  shieldLock: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_parent.webp" class="${cls} object-cover rounded-full shadow-md" alt="parent" />`;
  },
  speaker: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    const isMuted = extra.firstBool || false;
    const src = isMuted ? "icon_speaker_muted.webp" : "icon_speaker.webp";
    return `<img src="assets/images/${src}" class="${cls} object-cover rounded-full shadow-md" alt="speaker" onerror="this.src='assets/images/icon_speaker.webp'" />`;
  },
  book: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_book.webp" class="${cls} object-cover rounded-full shadow-md" alt="book" />`;
  },
  audio: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_mic.webp" class="${cls} object-cover rounded-full shadow-md" alt="audio" onerror="this.src='assets/images/icon_speaker.webp'" />`;
  },
  mic: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_mic.webp" class="${cls} object-cover rounded-full shadow-md" alt="mic" onerror="this.src='assets/images/icon_speaker.webp'" />`;
  },
  pen: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_pen.webp" class="${cls} object-cover rounded-full shadow-md" alt="pen" />`;
  },
  sparkle: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_sparkle.webp" class="${cls} object-cover rounded-full shadow-md" alt="sparkle" />`;
  },
  cards: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_cards.webp" class="${cls} object-cover rounded-full shadow-md" alt="cards" />`;
  },
  calendar: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_calendar.webp" class="${cls} object-cover rounded-full shadow-md" alt="calendar" />`;
  },
  crown: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_crown.webp" class="${cls} object-cover rounded-full shadow-md" alt="crown" onerror="this.src='assets/images/icon_trophy.webp'" />`;
  },
  gem: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_gem.webp" class="${cls} object-cover rounded-full shadow-md" alt="gem" onerror="this.src='assets/images/icon_sparkle.webp'" />`;
  },
  monster: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/cathy_boss_monster.webp" class="${cls} object-cover rounded-full shadow-md" alt="monster" onerror="this.src='assets/images/icon_parent.webp'" />`;
  },
  reviewBell: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_bell.webp" class="${cls} object-cover rounded-full shadow-md" alt="review" onerror="this.src='assets/images/icon_book.webp'" />`;
  },
  bell: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_bell.webp" class="${cls} object-cover rounded-full shadow-md" alt="bell" onerror="this.src='assets/images/icon_book.webp'" />`;
  },
  compass: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_compass.webp" class="${cls} object-cover rounded-full shadow-md" alt="compass" onerror="this.src='assets/images/icon_home.webp'" />`;
  },
  brush: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_brush.webp" class="${cls} object-cover rounded-full shadow-md" alt="brush" onerror="this.src='assets/images/icon_pen.webp'" />`;
  },
  scroll: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_scroll.webp" class="${cls} object-cover rounded-full shadow-md" alt="scroll" onerror="this.src='assets/images/icon_book.webp'" />`;
  },
  swords: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_swords.webp" class="${cls} object-cover rounded-full shadow-md" alt="swords" onerror="this.src='assets/images/icon_chest.webp'" />`;
  },
  gear: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_gear.webp" class="${cls} object-cover rounded-full shadow-md" alt="gear" onerror="this.src='assets/images/icon_lock.webp'" />`;
  },
  print: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_book.webp" class="${cls} object-cover rounded-full shadow-md" alt="print" />`;
  },
  parent: (...args) => {
    const { cls } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_parent.webp" class="${cls} object-cover rounded-full shadow-md" alt="parent" />`;
  }
};

if (typeof window !== "undefined") {
  window.GAME_ICONS = GAME_ICONS;
}

export default GAME_ICONS;
