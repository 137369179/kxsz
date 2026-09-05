import { GAME_ICONS } from "../gameIcons.js";

export const LEARN_STEP_META = {
  1: { name: "玩", announcement: "第一关：图画魔盒", iconSvg: (cls) => GAME_ICONS.gem(cls) },
  2: { name: "认", announcement: "第二关：字形奇遇", iconSvg: (cls) => GAME_ICONS.cards(cls) },
  3: { name: "读", announcement: "第三关：声音彩虹", iconSvg: (cls) => GAME_ICONS.speaker(cls) },
  4: { name: "练", announcement: "第四关：激光打靶", iconSvg: (cls) => GAME_ICONS.arcade(cls) },
  5: { name: "控笔", announcement: "第五关：小手热身", iconSvg: (cls) => GAME_ICONS.hand(cls) },
  6: { name: "描红", announcement: "第六关：魔法画笔", iconSvg: (cls) => GAME_ICONS.brush(cls) },
  7: { name: "写", announcement: "第七关：独立挑战", iconSvg: (cls) => GAME_ICONS.pen(cls) },
  8: { name: "测", announcement: "第八关：开启宝箱", iconSvg: (cls) => GAME_ICONS.chest(cls) },
};

export function getLearnStepMeta(stepNum) {
  return LEARN_STEP_META[stepNum] || { name: "?", announcement: "关卡", iconSvg: () => "" };
}
