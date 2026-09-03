/**
 * 凯茜识字 - 「玩」环节儿童五大专属游戏路由器与统一控制器
 * -------------------------------------------------------------
 * 1. PlayRubReveal: 云雾拨开/刮刮乐神秘显形
 * 2. PlayFeedCreature: 萌宠大嘴喂食与物理投掷
 * 3. PlaySlingshot: Q弹弹弓蓄力与物理城堡撞击
 * 4. PlaySproutGrowth: 生态奇迹与四季甘霖培育
 * 5. PlayMagneticFusion: 魔法磁力引力拼搭工坊
 * 
 * 规范：绝对零 Unicode Emoji，零 SVG
 */

import { PlayRubReveal } from "./playRubReveal.js";
import { PlayFeedCreature } from "./playFeedCreature.js";
import { PlaySlingshot } from "./playSlingshot.js";
import { PlaySproutGrowth } from "./playSproutGrowth.js";
import { PlayMagneticFusion } from "./playMagneticFusion.js";

const GAME_TYPES = {
  RUB_REVEAL: "rub_reveal",
  FEED_CREATURE: "feed_creature",
  SLINGSHOT: "slingshot",
  SPROUT_GROWTH: "sprout_growth",
  MAGNETIC_FUSION: "magnetic_fusion",
};

// 预置语义关键字映射表
const RUB_CHARS = new Set([
  "日", "月", "星", "云", "雨", "天", "光", "雷", "电", "雪", "夜", "明", "阴", "晴", "霞", "雾", "霜", "冰", "空", "虹"
]);

const FEED_CHARS = new Set([
  "口", "吃", "喝", "水", "果", "米", "鱼", "肉", "瓜", "包", "饱", "尝", "咬", "饭", "糖", "茶", "奶", "菜", "汤", "甜"
]);

const SPROUT_CHARS = new Set([
  "木", "林", "森", "草", "花", "土", "地", "生", "树", "芽", "叶", "春", "禾", "竹", "苗", "田", "谷", "果", "根", "植"
]);

const FUSION_CHARS = new Set([
  "休", "看", "信", "尖", "好", "尘", "男", "泪", "歪", "妈", "爸", "姐", "妹", "哥", "弟", "朋", "友", "品", "众", "森"
]);

const SLING_CHARS = new Set([
  "大", "小", "上", "下", "出", "入", "飞", "石", "射", "打", "弓", "箭", "山", "破", "开", "关", "走", "跑", "跳", "击"
]);

/**
 * 智能判断汉字最契合的玩法类型
 */
export function determinePlayGameType(charData) {
  const c = charData.char;

  if (RUB_CHARS.has(c)) return GAME_TYPES.RUB_REVEAL;
  if (FEED_CHARS.has(c)) return GAME_TYPES.FEED_CREATURE;
  if (SPROUT_CHARS.has(c)) return GAME_TYPES.SPROUT_GROWTH;
  if (FUSION_CHARS.has(c)) return GAME_TYPES.MAGNETIC_FUSION;
  if (SLING_CHARS.has(c)) return GAME_TYPES.SLINGSHOT;

  // 根据造字法与偏旁推断
  const rad = charData.radical || "";
  if (rad === "艹" || rad === "木" || rad === "土" || rad === "禾") return GAME_TYPES.SPROUT_GROWTH;
  if (rad === "口" || rad === "饣" || rad === "氵") return GAME_TYPES.FEED_CREATURE;
  if (rad === "日" || rad === "月" || rad === "雨" || rad === "气") return GAME_TYPES.RUB_REVEAL;
  if (rad === "亻" || rad === "女" || rad === "父" || charData.charType === "phono" || charData.charType === "ideographic") {
    return GAME_TYPES.MAGNETIC_FUSION;
  }

  // 字符 ID 哈希轮询分配，确保趣味不重复
  const code = (c.charCodeAt(0) || 0) % 5;
  switch (code) {
    case 0: return GAME_TYPES.RUB_REVEAL;
    case 1: return GAME_TYPES.FEED_CREATURE;
    case 2: return GAME_TYPES.SLINGSHOT;
    case 3: return GAME_TYPES.SPROUT_GROWTH;
    default: return GAME_TYPES.MAGNETIC_FUSION;
  }
}

/**
 * 实例化并启动玩法
 */
export function createPlayGame(container, charData, onComplete) {
  const gameType = determinePlayGameType(charData);

  switch (gameType) {
    case GAME_TYPES.RUB_REVEAL:
      return new PlayRubReveal(container, charData, onComplete);
    case GAME_TYPES.FEED_CREATURE:
      return new PlayFeedCreature(container, charData, onComplete);
    case GAME_TYPES.SLINGSHOT:
      return new PlaySlingshot(container, charData, onComplete);
    case GAME_TYPES.SPROUT_GROWTH:
      return new PlaySproutGrowth(container, charData, onComplete);
    case GAME_TYPES.MAGNETIC_FUSION:
    default:
      return new PlayMagneticFusion(container, charData, onComplete);
  }
}
