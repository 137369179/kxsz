import { GAME_ICONS } from "../gameIcons.js";

export const LEARN_STEP_META = {
  1: { name: "玩", announcement: "第一关：图画魔盒", image: "/assets/images/icon_gem.jpg" },
  2: { name: "认", announcement: "第二关：字形奇遇", image: "/assets/images/icon_cards.jpg" },
  3: { name: "读", announcement: "第三关：声音彩虹", image: "/assets/images/icon_mic.jpg" },
  4: { name: "练", announcement: "第四关：激光打靶", image: "/assets/images/icon_arcade.jpg" },
  5: { name: "控笔", announcement: "第五关：小手热身", image: "/assets/images/icon_hand.jpg" },
  6: { name: "描红", announcement: "第六关：魔法画笔", image: "/assets/images/icon_brush.jpg" },
  7: { name: "写", announcement: "第七关：独立挑战", image: "/assets/images/icon_pen.jpg" },
  8: { name: "测", announcement: "第八关：开启宝箱", image: "/assets/images/icon_chest.jpg" },
};

export function getLearnStepMeta(stepNum) {
  return LEARN_STEP_META[stepNum] || { name: "?", announcement: "关卡", image: "/assets/images/icon_star.jpg" };
}
