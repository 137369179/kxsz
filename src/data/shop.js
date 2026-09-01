/**
 *  (Cathy Literacy) - 
 * ------------------------------------------------------------
 * // → 
 * price = 0  shop.ownedisOwned 
 *  value  profile.avatar  emoji
 */

export const SHOP_AVATARS = [
  { id: "av_cathy",   type: "avatar", name: "凯茜",   icon: "assets/images/cathy_mascot.jpg",      value: "assets/images/cathy_mascot.jpg",      price: 0 },
  { id: "av_fairy",   type: "avatar", name: "森林仙子",   icon: "assets/images/cathy_island_forest.jpg", value: "assets/images/cathy_island_forest.jpg", price: 0 },
  { id: "av_hero",    type: "avatar", name: "冒险勇士",   icon: "assets/images/cathy_island_life.jpg",  value: "assets/images/cathy_island_life.jpg",   price: 0 },
  { id: "av_unicorn", type: "avatar", name: "幻彩独角兽", svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><circle cx="50" cy="50" r="45" fill="#fbcfe8"/><path d="M 40 40 L 50 15 L 60 40 Z" fill="#fcd34d"/><path d="M 25 50 Q 50 30 75 50 Q 50 70 25 50 Z" fill="white"/><circle cx="45" cy="50" r="4" fill="black"/><circle cx="55" cy="50" r="4" fill="black"/></svg>`, price: 200 },
  { id: "av_panda",   type: "avatar", name: "功夫熊猫",   svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><circle cx="50" cy="50" r="45" fill="#f1f5f9"/><circle cx="30" cy="30" r="15" fill="#1e293b"/><circle cx="70" cy="30" r="15" fill="#1e293b"/><ellipse cx="50" cy="60" rx="30" ry="25" fill="white"/><circle cx="40" cy="55" r="8" fill="#1e293b"/><circle cx="60" cy="55" r="8" fill="#1e293b"/><circle cx="50" cy="65" r="4" fill="black"/></svg>`, price: 260 },
  { id: "av_dragon",  type: "avatar", name: "喷火神龙",   svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><circle cx="50" cy="50" r="45" fill="#fef08a"/><path d="M 25 50 Q 50 10 75 50 Q 50 90 25 50 Z" fill="#ef4444"/><circle cx="40" cy="45" r="5" fill="#fcd34d"/><circle cx="60" cy="45" r="5" fill="#fcd34d"/><path d="M 30 65 Q 50 75 70 65" fill="none" stroke="#fcd34d" stroke-width="4"/></svg>`, price: 500 }
];

export const SHOP_FRAMES = [
  { id: "frame_none",    type: "frame", name: "无边框", price: 0 },
  { id: "frame_gold",    type: "frame", name: "黄金相框", price: 150 },
  { id: "frame_rainbow", type: "frame", name: "彩虹流光", price: 300 },
  { id: "frame_flame",   type: "frame", name: "烈焰战魂", price: 450 },
  { id: "frame_crystal", type: "frame", name: "冰晶雪魄", price: 600 }
];

/**  id →  */
export const FRAME_CLASSES = {
  frame_none: "",
  frame_gold: "ring-4 ring-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.9)]",
  frame_rainbow: "ring-4 ring-fuchsia-400 shadow-[0_0_14px_rgba(232,121,249,0.9)]",
  frame_flame: "ring-4 ring-orange-500 shadow-[0_0_14px_rgba(249,115,22,0.95)]",
  frame_crystal: "ring-4 ring-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.95)]"
};

export const SHOP_ALL = [...SHOP_AVATARS, ...SHOP_FRAMES];
export const SHOP_ITEMS = SHOP_ALL;
export const SHOP_DATABASE = SHOP_ALL;

export function findShopItem(itemId) {
  return SHOP_ALL.find((i) => i.id === itemId) || null;
}
