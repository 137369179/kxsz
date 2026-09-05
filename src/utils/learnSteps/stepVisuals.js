/**
 * stepVisuals.js — 学字步骤的图形化视觉原语（H2）
 * ------------------------------------------------------------------
 * 依据：3-8 岁儿童处于前运算阶段，抽象文字说明无效；
 *      每步必须提供「图形徽标 + 短标签(≤4字) + 动效 + 语音」四件套。
 *
 * 用法：在 learnSteps 各步骤模板顶部插入 stepBadge("认") 等，
 *      用 progressDots 替代“第 X/6 步”文字，用 hintBubble 承载提示语。
 *
 * 约束：本模块只产出 HTML 字符串，不含业务逻辑、不读写数据。
 */

import { GAME_ICONS } from "../gameIcons.js";

/** 步骤徽标配置：图标 + 主色 + 短标签（≤4 字） */
const STEP_META = {
  recognize: { label: "认", icon: (c) => GAME_ICONS.cards(c), ring: "border-emerald-300", tint: "from-emerald-400 to-teal-500" },
  read:      { label: "读", icon: (c) => GAME_ICONS.speaker(c), ring: "border-sky-300",    tint: "from-sky-400 to-blue-500" },
  play:      { label: "玩", icon: (c) => GAME_ICONS.gem(c),    ring: "border-amber-300",   tint: "from-amber-400 to-orange-500" },
  write:     { label: "写", icon: (c) => GAME_ICONS.pen(c),    ring: "border-rose-300",    tint: "from-rose-400 to-pink-500" },
  practice:  { label: "练", icon: (c) => GAME_ICONS.brush(c),  ring: "border-indigo-300",  tint: "from-indigo-400 to-purple-500" },
  test:      { label: "测", icon: (c) => GAME_ICONS.trophy(c), ring: "border-yellow-300",  tint: "from-yellow-400 to-amber-500" },
};

/**
 * 步骤徽标：大图标（≥56px）+ 单字标签，儿童一眼可辨当前处于哪一步
 * @param {"recognize"|"read"|"play"|"write"|"practice"|"test"} kind
 */
export function stepBadge(kind = "recognize") {
  const m = STEP_META[kind] || STEP_META.recognize;
  return `
    <div class="step-badge shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${m.tint} border-2 ${m.ring} shadow-lg flex flex-col items-center justify-center gap-0.5 animate-scale-up">
      <span class="flex items-center text-white">${m.icon("w-6 h-6")}</span>
      <span class="text-[10px] font-black text-white leading-none">${m.label}</span>
    </div>`;
}

/**
 * 步骤进度点：用点亮/未点亮圆点替代“第 3 / 6 步”文字
 */
export function progressDots(current = 1, total = 6) {
  const dots = [];
  for (let i = 1; i <= total; i++) {
    const on = i <= current;
    dots.push(
      `<span class="inline-block w-2.5 h-2.5 rounded-full ${on ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,.9)]" : "bg-white/25"}"></span>`
    );
  }
  return `<span class="inline-flex items-center gap-1.5" role="progressbar" aria-valuenow="${current}" aria-valuemin="1" aria-valuemax="${total}" aria-label="学习步骤进度">${dots.join("")}</span>`;
}

/**
 * 提示气泡：承载 ≤12 字的儿童口语提示（配合 data-speak 可听）
 */
export function hintBubble(text = "", { tone = "amber" } = {}) {
  const toneCls =
    tone === "sky" ? "bg-sky-500/80 border-sky-200"
    : tone === "rose" ? "bg-rose-500/80 border-rose-200"
    : "bg-amber-500/85 border-amber-200";
  return `<span class="hint-bubble inline-flex items-center px-3 py-1.5 rounded-full ${toneCls} border text-white text-[11px] font-black animate-fade-in">${text}</span>`;
}

/** 喇叭按钮外圈波纹（用于“读”步骤的听示范按钮） */
export function speakerRipple(inner = "w-14 h-14") {
  return `<span class="speaker-ripple relative inline-flex items-center justify-center ${inner}"><span class="ripple-ring"></span></span>`;
}
