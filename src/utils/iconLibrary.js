/**
 * 凯茜识字 (Cathy Literacy) - 常用图标门面库
 * 全部采用高质量 3D 图片资产包装，零 SVG & 零 Emoji
 */

import { GAME_ICONS } from "./gameIcons.js";

const DEFAULT_CLS = "w-full h-full";

export const Icons = {
  // Navigation
  home: GAME_ICONS.home(DEFAULT_CLS),
  back: GAME_ICONS.back(DEFAULT_CLS),
  compass: GAME_ICONS.compass(DEFAULT_CLS),
  
  // System & Settings
  shield: GAME_ICONS.shieldLock(DEFAULT_CLS),
  lock: GAME_ICONS.lock(DEFAULT_CLS),
  gear: GAME_ICONS.gear(DEFAULT_CLS),
  parent: GAME_ICONS.parent(DEFAULT_CLS),
  
  // Rewards & Items
  star: GAME_ICONS.star(DEFAULT_CLS),
  coin: GAME_ICONS.coin(DEFAULT_CLS),
  sparkle: GAME_ICONS.sparkle(DEFAULT_CLS),
  gem: GAME_ICONS.gem(DEFAULT_CLS),
  crown: GAME_ICONS.crown(DEFAULT_CLS),
  trophy: GAME_ICONS.trophy(DEFAULT_CLS),
  chest: GAME_ICONS.chest(DEFAULT_CLS),
  cards: GAME_ICONS.cards(DEFAULT_CLS),
  
  // Learn & Audio
  audio: GAME_ICONS.audio(DEFAULT_CLS),
  speaker: GAME_ICONS.speaker(DEFAULT_CLS),
  speakerMuted: GAME_ICONS.speaker(true),
  book: GAME_ICONS.book(DEFAULT_CLS),
  scroll: GAME_ICONS.scroll(DEFAULT_CLS),
  mic: GAME_ICONS.mic(DEFAULT_CLS),
  pen: GAME_ICONS.pen(DEFAULT_CLS),
  brush: GAME_ICONS.brush(DEFAULT_CLS),
  
  // Status & General
  calendar: GAME_ICONS.calendar(DEFAULT_CLS),
  bell: GAME_ICONS.reviewBell(DEFAULT_CLS),
  swords: GAME_ICONS.swords(DEFAULT_CLS),
  monster: GAME_ICONS.monster(DEFAULT_CLS),
  arcade: GAME_ICONS.arcade(DEFAULT_CLS),
  print: GAME_ICONS.print(DEFAULT_CLS),
  
  // Modules & Utilities
  game: GAME_ICONS.arcade(DEFAULT_CLS),
  chart: GAME_ICONS.calendar(DEFAULT_CLS),
  brain: GAME_ICONS.sparkle(DEFAULT_CLS),
  idiom: GAME_ICONS.scroll(DEFAULT_CLS),
  bulb: GAME_ICONS.gem(DEFAULT_CLS),
  target: GAME_ICONS.trophy(DEFAULT_CLS)
};

if (typeof window !== "undefined") {
  window.Icons = Icons;
}

export default Icons;
