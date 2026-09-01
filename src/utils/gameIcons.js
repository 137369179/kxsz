/**
 * 凯茜识字 - 3D图片图标库
 * 采用统一的 <img> 标签，object-cover 填充容器
 * 
 * 使用方式:
 *   GAME_ICONS.star()          - 默认尺寸
 *   GAME_ICONS.star(true)      - 灰色星星
 *   GAME_ICONS.star("w-8 h-8") - 自定义尺寸
 *   GAME_ICONS.star("w-8 h-8", true) - 自定义尺寸 + 灰色
 */

export const GAME_ICONS = {
  // 内部辅助函数：解析参数
  _parseIconParams: function(args) {
    let cls = "w-6 h-6";
    let extra = {};
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (typeof arg === 'boolean') {
        // 布尔参数：isGrey, isMuted 等
        if (Object.keys(extra).length === 0) extra.firstBool = arg;
        else if (Object.keys(extra).length === 1) extra.secondBool = arg;
      } else if (typeof arg === 'string' && arg.startsWith('w-')) {
        cls = arg;
      }
    }
    return { cls, extra };
  },

  islandForest: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_home.webp" class="${cls} object-cover rounded-full shadow-md" alt="forest" />`;
  },
  islandTown: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_star.webp" class="${cls} object-cover rounded-full shadow-md" alt="town" />`;
  },
  islandSpace: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_sparkle.webp" class="${cls} object-cover rounded-full shadow-md" alt="space" />`;
  },
  arcade: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_cards.webp" class="${cls} object-cover rounded-full shadow-md" alt="arcade" />`;
  },
  coin: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_coin.webp" class="${cls} object-cover rounded-full shadow-md" alt="coin" />`;
  },
  star: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    const isGrey = extra.firstBool || false;
    const greyClass = isGrey ? 'grayscale opacity-50' : '';
    return `<img src="assets/images/icon_star.webp" class="${cls} object-cover rounded-full shadow-md ${greyClass}" alt="star" />`;
  },
  trophy: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_trophy.webp" class="${cls} object-cover rounded-full shadow-md" alt="trophy" />`;
  },
  lock: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_lock.webp" class="${cls} object-cover rounded-full shadow-md" alt="lock" />`;
  },
  chest: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_chest.webp" class="${cls} object-cover rounded-full shadow-md" alt="chest" />`;
  },
  home: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_home.webp" class="${cls} object-cover rounded-full shadow-md" alt="home" />`;
  },
  back: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_back.webp" class="${cls} object-cover rounded-full shadow-md" alt="back" />`;
  },
  shieldLock: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_parent.webp" class="${cls} object-cover rounded-full shadow-md" alt="parent" />`;
  },
  speaker: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    const isMuted = extra.firstBool || false;
    const src = isMuted ? 'icon_speaker_muted.webp' : 'icon_speaker.webp';
    return `<img src="assets/images/${src}" class="${cls} object-cover rounded-full shadow-md" alt="speaker" onerror="this.src='assets/images/icon_speaker.webp'" />`;
  },
  book: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_book.webp" class="${cls} object-cover rounded-full shadow-md" alt="book" />`;
  },
  audio: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_speaker.webp" class="${cls} object-cover rounded-full shadow-md" alt="audio" />`;
  },
  pen: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_pen.webp" class="${cls} object-cover rounded-full shadow-md" alt="pen" />`;
  },
  sparkle: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_sparkle.webp" class="${cls} object-cover rounded-full shadow-md" alt="sparkle" />`;
  },
  cards: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_cards.webp" class="${cls} object-cover rounded-full shadow-md" alt="cards" />`;
  },
  calendar: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_calendar.webp" class="${cls} object-cover rounded-full shadow-md" alt="calendar" />`;
  },
  crown: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_trophy.webp" class="${cls} object-cover rounded-full shadow-md" alt="crown" />`;
  },
  gem: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_sparkle.webp" class="${cls} object-cover rounded-full shadow-md" alt="gem" />`;
  },
  monster: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_parent.webp" class="${cls} object-cover rounded-full shadow-md" alt="monster" />`;
  },
  reviewBell: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_book.webp" class="${cls} object-cover rounded-full shadow-md" alt="review" />`;
  },
  compass: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_home.webp" class="${cls} object-cover rounded-full shadow-md" alt="compass" />`;
  },
  brush: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_pen.webp" class="${cls} object-cover rounded-full shadow-md" alt="brush" />`;
  },
  scroll: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_book.webp" class="${cls} object-cover rounded-full shadow-md" alt="scroll" />`;
  },
  swords: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_chest.webp" class="${cls} object-cover rounded-full shadow-md" alt="swords" />`;
  },
  print: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_book.webp" class="${cls} object-cover rounded-full shadow-md" alt="print" />`;
  },
  parent: (...args) => {
    const { cls, extra } = GAME_ICONS._parseIconParams(args);
    return `<img src="assets/images/icon_parent.webp" class="${cls} object-cover rounded-full shadow-md" alt="parent" />`;
  }
};

export default GAME_ICONS;
