/**
 * 凯茜识字 - 3D图片图标库 (替代旧的SVG系统)
 * 采用统一的 <img> 标签和自适应大小 (w-full h-full object-contain)
 */

export const GAME_ICONS = {

  islandForest: (cls = "w-6 h-6") => `<img src="assets/images/icon_home.jpg" class="${cls} object-contain rounded-full shadow-md" alt="forest" />`,
  islandTown: (cls = "w-6 h-6") => `<img src="assets/images/icon_star.jpg" class="${cls} object-contain rounded-full shadow-md" alt="town" />`,
  islandSpace: (cls = "w-6 h-6") => `<img src="assets/images/icon_sparkle.jpg" class="${cls} object-contain rounded-full shadow-md" alt="space" />`,
  arcade: (cls = "w-6 h-6") => `<img src="assets/images/icon_cards.jpg" class="${cls} object-contain rounded-full shadow-md" alt="arcade" />`,
  coin: (cls = "w-6 h-6") => `<img src="assets/images/icon_coin.jpg" class="${cls} object-contain rounded-full shadow-md" alt="coin" />`,
  star: (cls = "w-6 h-6") => `<img src="assets/images/icon_star.jpg" class="${cls} object-contain rounded-full shadow-md" alt="star" />`,
  trophy: (cls = "w-6 h-6") => `<img src="assets/images/icon_trophy.jpg" class="${cls} object-contain rounded-full shadow-md" alt="trophy" />`,
  lock: (cls = "w-6 h-6") => `<img src="assets/images/icon_lock.jpg" class="${cls} object-contain rounded-full shadow-md" alt="lock" />`,
  chest: (cls = "w-6 h-6") => `<img src="assets/images/icon_chest.jpg" class="${cls} object-contain rounded-full shadow-md" alt="chest" />`,
  home: (cls = "w-6 h-6") => `<img src="assets/images/icon_home.jpg" class="${cls} object-contain rounded-full shadow-md" alt="home" />`,
  back: (cls = "w-6 h-6") => `<img src="assets/images/icon_back.jpg" class="${cls} object-contain rounded-full shadow-md" alt="back" />`,
  shieldLock: (cls = "w-6 h-6") => `<img src="assets/images/icon_parent.jpg" class="${cls} object-contain rounded-full shadow-md" alt="parent" />`,
  speaker: (cls = "w-6 h-6") => `<img src="assets/images/icon_speaker.jpg" class="${cls} object-contain rounded-full shadow-md" alt="speaker" />`,
  book: (cls = "w-6 h-6") => `<img src="assets/images/icon_book.jpg" class="${cls} object-contain rounded-full shadow-md" alt="book" />`,
  audio: (cls = "w-6 h-6") => `<img src="assets/images/icon_speaker.jpg" class="${cls} object-contain rounded-full shadow-md" alt="audio" />`, // Fallback
  pen: (cls = "w-6 h-6") => `<img src="assets/images/icon_pen.jpg" class="${cls} object-contain rounded-full shadow-md" alt="pen" />`,
  sparkle: (cls = "w-6 h-6") => `<img src="assets/images/icon_sparkle.jpg" class="${cls} object-contain rounded-full shadow-md" alt="sparkle" />`,
  cards: (cls = "w-6 h-6") => `<img src="assets/images/icon_cards.jpg" class="${cls} object-contain rounded-full shadow-md" alt="cards" />`,
  calendar: (cls = "w-6 h-6") => `<img src="assets/images/icon_calendar.jpg" class="${cls} object-contain rounded-full shadow-md" alt="calendar" />`
};

export default GAME_ICONS;
