/**
 * feedbackHub.js — 儿童即时反馈集中化（H3）
 * ------------------------------------------------------------------
 * 设计依据（3-8 岁认知）：
 *  - 行为后必须 < 100ms 内给出反馈（多巴胺强化），否则儿童注意力流失
 *  - 反馈需多通道同发：声音 + 动效 + 触感（任一通道缺失可降级）
 *  - 零惩罚：答错只做温和抖动 + 鼓励，不出现红叉/负分
 *
 * 动效时长预算：
 *  - 微反馈（点击）120ms · 成功 400ms · 奖励 800ms · 庆祝 1000ms
 *
 * 降级策略：
 *  - prefers-reduced-motion / 家长关闭时：动效降为无，触感关闭，声音保留
 *
 * 注意：本模块只编排“反馈表现”，不改变任何学习逻辑与判分数据。
 */

import { soundAndFX } from "./soundEngine.js";
import { haptic } from "./haptics.js";
import { sparkleAt } from "./appHub/appFx.js";

/** 是否处于“减少动效”环境（系统偏好） */
export function prefersReducedMotion() {
  try {
    return typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;
  } catch {
    return false;
  }
}

/** 取元素中心点（供粒子定位） */
function centerOf(el) {
  if (!el || typeof el.getBoundingClientRect !== "function") return null;
  try {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  } catch {
    return null;
  }
}

/** 在元素处迸发星屑（受 reduced-motion 约束） */
function sparkleAtEl(el, count = 6) {
  if (prefersReducedMotion()) return;
  const p = centerOf(el);
  if (!p) return;
  for (let i = 0; i < count; i++) {
    try {
      sparkleAt(p.x + (Math.random() - 0.5) * 60, p.y + (Math.random() - 0.5) * 60);
    } catch {}
  }
}

/** 零惩罚：温和抖动（可被 reduced-motion 降级为无） */
function gentleShake(el) {
  if (!el || !el.classList) return;
  if (prefersReducedMotion()) return;
  try {
    el.classList.add("animate-shake");
    setTimeout(() => el.classList.remove("animate-shake"), 420);
  } catch {}
}

export const feedback = {
  /** 轻点反馈（按钮/选项按下） */
  tap() {
    // playPop 内部已联动触感 tap
    try { soundAndFX.playPop(); } catch { haptic("tap"); }
  },

  /** 答对：声音 + 触感 + 星屑（400ms 量级） */
  ok(el = null) {
    try { soundAndFX.playSuccessSound(); } catch { haptic("success"); }
    sparkleAtEl(el, 6);
  },

  /** 答错：零惩罚（温和抖动 + 鼓励音 + 轻触感），不扣星不羞辱 */
  tryAgain(el = null) {
    try { soundAndFX.playSoftError(); } catch { haptic("error"); }
    gentleShake(el);
  },

  /** 获得奖励（星/币）：800ms 量级 */
  reward(kind = "star", el = null) {
    if (kind === "chest") {
      try { soundAndFX.playChestOpen(); } catch {}
    } else if (kind === "coin") {
      try { soundAndFX.playCoinClink(); } catch {}
    } else {
      try { soundAndFX.playStarEarned(); } catch {}
    }
    haptic("success");
    sparkleAtEl(el, 10);
  },

  /** 关卡/任务完成庆祝：1000ms 量级 */
  celebrate(el = null) {
    try { soundAndFX.playVictoryFanfare(); } catch {}
    haptic("fanfare");
    sparkleAtEl(el, 14);
  },
};

export default feedback;
