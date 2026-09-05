/**
 *  (Cathy Literacy) - 
 * ------------------------------------------------------------
 * //  
 * price = 0  shop.ownedisOwned 
 *  value  profile.avatar  emoji
 */

export const SHOP_AVATARS = [
  { id: "av_cathy",          type: "avatar", name: "凯茜",     icon: "assets/images/cathy_mascot.webp",          value: "assets/images/cathy_mascot.webp",          price: 0 },
  { id: "av_scholar",        type: "avatar", name: "博学书童", icon: "assets/images/avatar_scholar.webp",        value: "assets/images/avatar_scholar.webp",        price: 0 },
  { id: "av_nezha",          type: "avatar", name: "乾坤小将", icon: "assets/images/avatar_nezha.webp",          value: "assets/images/avatar_nezha.webp",          price: 120 },
  { id: "av_mulan",          type: "avatar", name: "巾帼英豪", icon: "assets/images/avatar_mulan.webp",          value: "assets/images/avatar_mulan.webp",          price: 150 },
  { id: "av_chang_e",        type: "avatar", name: "霓裳仙子", icon: "assets/images/avatar_chang_e.webp",        value: "assets/images/avatar_chang_e.webp",        price: 180 },
  { id: "av_wukong",         type: "avatar", name: "齐天小圣", icon: "assets/images/avatar_wukong.webp",         value: "assets/images/avatar_wukong.webp",         price: 220 },
  { id: "av_guofeng_cathy",  type: "avatar", name: "吉祥小鹿", icon: "assets/images/avatar_guofeng_cathy.webp", value: "assets/images/avatar_guofeng_cathy.webp", price: 280 },
  { id: "av_fairy",          type: "avatar", name: "森林仙子", icon: "assets/images/avatar_fairy.webp",         value: "assets/images/avatar_fairy.webp",         price: 0 },
  { id: "av_hero",           type: "avatar", name: "冒险勇士", icon: "assets/images/avatar_hero.webp",          value: "assets/images/avatar_hero.webp",          price: 0 },
  { id: "av_unicorn",        type: "avatar", name: "幻彩之星", icon: "assets/images/avatar_unicorn.webp",       value: "assets/images/avatar_unicorn.webp",       price: 200 },
  { id: "av_panda",          type: "avatar", name: "星空先锋", icon: "assets/images/avatar_panda.webp",         value: "assets/images/avatar_panda.webp",         price: 260 },
  { id: "av_dragon",         type: "avatar", name: "喷火霸王", icon: "assets/images/avatar_dragon.webp",       value: "assets/images/avatar_dragon.webp",       price: 500 }
];

export const SHOP_FRAMES = [
  { id: "frame_none",    type: "frame", name: "无边框", price: 0 },
  { id: "frame_gold",    type: "frame", name: "黄金相框", price: 150 },
  { id: "frame_rainbow", type: "frame", name: "彩虹流光", price: 300 },
  { id: "frame_flame",   type: "frame", name: "烈焰战魂", price: 450 },
  { id: "frame_crystal", type: "frame", name: "冰晶雪魄", price: 600 }
];

export const SHOP_DECORATIONS = [
  { id: "decor_windchime", type: "decoration", name: "魔法风铃", icon: "assets/images/decor_windchime.jpg", value: "assets/images/decor_windchime.jpg", price: 150 },
  { id: "decor_swing",     type: "decoration", name: "花藤秋千", icon: "assets/images/decor_swing.jpg",     value: "assets/images/decor_swing.jpg",     price: 300 },
  { id: "decor_lantern",   type: "decoration", name: "星光灯笼", icon: "assets/images/decor_lantern.jpg",   value: "assets/images/decor_lantern.jpg",   price: 450 },
  { id: "decor_birdhouse", type: "decoration", name: "知更鸟窝", icon: "assets/images/decor_birdhouse.jpg", value: "assets/images/decor_birdhouse.jpg", price: 600 }
];

/**  id   */
export const FRAME_CLASSES = {
  frame_none: "",
  frame_gold: "ring-4 ring-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.9)]",
  frame_rainbow: "ring-4 ring-fuchsia-400 shadow-[0_0_14px_rgba(232,121,249,0.9)]",
  frame_flame: "ring-4 ring-orange-500 shadow-[0_0_14px_rgba(249,115,22,0.95)]",
  frame_crystal: "ring-4 ring-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.95)]"
};

export const SHOP_ALL = [...SHOP_AVATARS, ...SHOP_FRAMES, ...SHOP_DECORATIONS];
export const SHOP_ITEMS = SHOP_ALL;
export const SHOP_DATABASE = SHOP_ALL;

export function findShopItem(itemId) {
  return SHOP_ALL.find((i) => i.id === itemId) || null;
}
