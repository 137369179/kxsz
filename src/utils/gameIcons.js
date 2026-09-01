/**
 * 凯茜识字 - 3D图片图标库 (替代旧的SVG系统)
 * 采用统一的 <img> 标签和自适应大小 (w-full h-full object-contain)
 */

export const GAME_ICONS = {

  islandForest: (cls = "w-6 h-6") => `<img src="assets/images/icon_home.webp" class="${cls} object-contain rounded-full shadow-md" alt="forest" />`,
  islandTown: (cls = "w-6 h-6") => `<img src="assets/images/icon_star.webp" class="${cls} object-contain rounded-full shadow-md" alt="town" />`,
  islandSpace: (cls = "w-6 h-6") => `<img src="assets/images/icon_sparkle.webp" class="${cls} object-contain rounded-full shadow-md" alt="space" />`,
  arcade: (cls = "w-6 h-6") => `<img src="assets/images/icon_cards.webp" class="${cls} object-contain rounded-full shadow-md" alt="arcade" />`,
  coin: (cls = "w-6 h-6") => `<img src="assets/images/icon_coin.webp" class="${cls} object-contain rounded-full shadow-md" alt="coin" />`,
  star: (cls = "w-6 h-6", isGrey = false) => `<img src="assets/images/icon_star.webp" class="${cls} object-contain rounded-full shadow-md ${isGrey ? 'grayscale opacity-50' : ''}" alt="star" />`,
  trophy: (cls = "w-6 h-6") => `<img src="assets/images/icon_trophy.webp" class="${cls} object-contain rounded-full shadow-md" alt="trophy" />`,
  lock: (cls = "w-6 h-6") => `<img src="assets/images/icon_lock.webp" class="${cls} object-contain rounded-full shadow-md" alt="lock" />`,
  chest: (cls = "w-6 h-6") => `<img src="assets/images/icon_chest.webp" class="${cls} object-contain rounded-full shadow-md" alt="chest" />`,
  home: (cls = "w-6 h-6") => `<img src="assets/images/icon_home.webp" class="${cls} object-contain rounded-full shadow-md" alt="home" />`,
  back: (cls = "w-6 h-6") => `<img src="assets/images/icon_back.webp" class="${cls} object-contain rounded-full shadow-md" alt="back" />`,
  shieldLock: (cls = "w-6 h-6") => `<img src="assets/images/icon_parent.webp" class="${cls} object-contain rounded-full shadow-md" alt="parent" />`,
  speaker: (cls = "w-6 h-6", isMuted = false) => `<img src="assets/images/icon_speaker${isMuted ? '_muted' : ''}.webp" class="${cls} object-contain rounded-full shadow-md" alt="speaker" onerror="this.src='assets/images/icon_speaker.webp'" />`,
  book: (cls = "w-6 h-6") => `<img src="assets/images/icon_book.webp" class="${cls} object-contain rounded-full shadow-md" alt="book" />`,
  audio: (cls = "w-6 h-6") => `<img src="assets/images/icon_speaker.webp" class="${cls} object-contain rounded-full shadow-md" alt="audio" />`, // Fallback
  pen: (cls = "w-6 h-6") => `<img src="assets/images/icon_pen.webp" class="${cls} object-contain rounded-full shadow-md" alt="pen" />`,
  sparkle: (cls = "w-6 h-6") => `<img src="assets/images/icon_sparkle.webp" class="${cls} object-contain rounded-full shadow-md" alt="sparkle" />`,
  cards: (cls = "w-6 h-6") => `<img src="assets/images/icon_cards.webp" class="${cls} object-contain rounded-full shadow-md" alt="cards" />`,
  calendar: (cls = "w-6 h-6") => `<img src="assets/images/icon_calendar.webp" class="${cls} object-contain rounded-full shadow-md" alt="calendar" />`,
  crown: (cls = "w-6 h-6") => `<img src="assets/images/icon_trophy.webp" class="${cls} object-contain rounded-full shadow-md" alt="crown" />`,
  gem: (cls = "w-6 h-6") => `<img src="assets/images/icon_sparkle.webp" class="${cls} object-contain rounded-full shadow-md" alt="gem" />`,
  monster: (cls = "w-6 h-6") => `<img src="assets/images/icon_parent.webp" class="${cls} object-contain rounded-full shadow-md" alt="monster" />`,
  reviewBell: (cls = "w-6 h-6") => `<img src="assets/images/icon_book.webp" class="${cls} object-contain rounded-full shadow-md" alt="review" />`,
  compass: (cls = "w-6 h-6") => `<img src="assets/images/icon_home.webp" class="${cls} object-contain rounded-full shadow-md" alt="compass" />`,
  brush: (cls = "w-6 h-6") => `<img src="assets/images/icon_pen.webp" class="${cls} object-contain rounded-full shadow-md" alt="brush" />`,
  scroll: (cls = "w-6 h-6") => `<img src="assets/images/icon_book.webp" class="${cls} object-contain rounded-full shadow-md" alt="scroll" />`,
  swords: (cls = "w-6 h-6") => `<img src="assets/images/icon_chest.webp" class="${cls} object-contain rounded-full shadow-md" alt="swords" />`,
  print: (cls = "w-6 h-6") => `<img src="assets/images/icon_book.webp" class="${cls} object-contain rounded-full shadow-md" alt="print" />`,
  parent: (cls = "w-6 h-6") => `<img src="assets/images/icon_parent.webp" class="${cls} object-contain rounded-full shadow-md" alt="parent" />`
};

export default GAME_ICONS;
