import { GAME_ICONS } from "../gameIcons.js";

export const LEARN_STEP_META = {
  1: { name: "玩", iconSvg: (cls) => GAME_ICONS.gem(cls) },
  2: { name: "认", iconSvg: (cls) => GAME_ICONS.cards(cls) },
  3: { name: "读", iconSvg: (cls) => GAME_ICONS.speaker(cls) },
  4: { name: "练", iconSvg: (cls) => GAME_ICONS.arcade(cls) },
  5: { name: "控笔", iconSvg: (cls) => GAME_ICONS.hand(cls) },
  6: { name: "描红", iconSvg: (cls) => GAME_ICONS.brush(cls) },
  7: { name: "写", iconSvg: (cls) => GAME_ICONS.pen(cls) },
  8: { name: "测", iconSvg: (cls) => GAME_ICONS.chest(cls) },
};

export function getLearnStepMeta(stepNum) {
  return LEARN_STEP_META[stepNum] || { name: "?", iconSvg: () => "" };
}
