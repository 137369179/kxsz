/**
 * 凯茜识字 - 图标库导出
 * 所有SVG已被废弃，统一使用生成的3D游戏资源图片
 */

import { GAME_ICONS } from "./gameIcons.js";

const DEFAULT_CLS = "w-full h-full";

export const Icons = {
  // Navigation
  home: GAME_ICONS.home(DEFAULT_CLS),
  back: GAME_ICONS.back(DEFAULT_CLS),
  
  // System & Settings
  shield: GAME_ICONS.shieldLock(DEFAULT_CLS),
  lock: GAME_ICONS.lock(DEFAULT_CLS),
  gear: GAME_ICONS.shieldLock(DEFAULT_CLS),
  
  // Rewards & Items
  star: GAME_ICONS.star(DEFAULT_CLS),
  coin: GAME_ICONS.coin(DEFAULT_CLS),
  sparkle: GAME_ICONS.sparkle(DEFAULT_CLS),
  trophy: GAME_ICONS.trophy(DEFAULT_CLS),
  chest: GAME_ICONS.chest(DEFAULT_CLS),
  cards: GAME_ICONS.cards(DEFAULT_CLS),
  
  // Learn & Audio
  audio: GAME_ICONS.audio(DEFAULT_CLS),
  book: GAME_ICONS.book(DEFAULT_CLS),
  mic: GAME_ICONS.audio(DEFAULT_CLS),
  pen: GAME_ICONS.pen(DEFAULT_CLS),
  
  // Status & General
  check: GAME_ICONS.calendar(DEFAULT_CLS),
  cross: GAME_ICONS.lock(DEFAULT_CLS),
  calendar: GAME_ICONS.calendar(DEFAULT_CLS),
  
  // Modules (Fallback to relevant icons)
  game: GAME_ICONS.cards(DEFAULT_CLS),
  monster: GAME_ICONS.chest(DEFAULT_CLS),
  print: GAME_ICONS.book(DEFAULT_CLS),
  chart: GAME_ICONS.book(DEFAULT_CLS),
  brain: GAME_ICONS.star(DEFAULT_CLS),
  idiom: GAME_ICONS.book(DEFAULT_CLS),
  bulb: GAME_ICONS.sparkle(DEFAULT_CLS),
  target: GAME_ICONS.trophy(DEFAULT_CLS)
};
