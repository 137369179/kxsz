/**
 *  (Cathy Literacy) - 
 * ------------------------------------------------------------
 * //  
 * price = 0  shop.ownedisOwned 
 *  value  profile.avatar  emoji
 */

export const SHOP_AVATARS = [
  { id: "av_cathy",   type: "avatar", name: "凯茜",     icon: "assets/images/cathy_mascot.webp",        value: "assets/images/cathy_mascot.webp",        price: 0 },
  { id: "av_fairy",   type: "avatar", name: "森林仙子", icon: "assets/images/cathy_island_forest.webp", value: "assets/images/cathy_island_forest.webp", price: 0 },
  { id: "av_hero",    type: "avatar", name: "冒险勇士", icon: "assets/images/cathy_island_life.webp",   value: "assets/images/cathy_island_life.webp",   price: 0 },
  { id: "av_unicorn", type: "avatar", name: "幻彩之星", icon: "assets/images/cathy_trophy_gold.webp",   value: "assets/images/cathy_trophy_gold.webp",   price: 200 },
  { id: "av_panda",   type: "avatar", name: "星空先锋", icon: "assets/images/cathy_island_space.webp",  value: "assets/images/cathy_island_space.webp",  price: 260 },
  { id: "av_dragon",  type: "avatar", name: "喷火霸王", icon: "assets/images/cathy_boss_monster.webp",  value: "assets/images/cathy_boss_monster.webp",  price: 500 }
];

export const SHOP_FRAMES = [
  { id: "frame_none",    type: "frame", name: "无边框", price: 0 },
  { id: "frame_gold",    type: "frame", name: "黄金相框", price: 150 },
  { id: "frame_rainbow", type: "frame", name: "彩虹流光", price: 300 },
  { id: "frame_flame",   type: "frame", name: "烈焰战魂", price: 450 },
  { id: "frame_crystal", type: "frame", name: "冰晶雪魄", price: 600 }
];

/**  id   */
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
