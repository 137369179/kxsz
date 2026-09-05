/**
 * motionBudget.js — 动效预算（M2）：按设备能力分级限制装饰性动效
 *
 * 分级：
 *  - low   : 设备内存 < 4GB / CPU 核心数 ≤ 4 / 系统减少动效偏好 → 粒子最少、无涟漪
 *  - medium: 其余默认设备 → 减半粒子
 *  - high  : 高配设备 → 完整动效
 *
 * 使用方：appFx.sparkleAt、feedbackHub 等；只约束装饰性动效，不约束功能性反馈。
 */

export function getMotionTier() {
  try {
    if (typeof window === "undefined") return "high";
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "low";
    if (typeof localStorage !== "undefined" && localStorage.getItem("cathy_reduced_motion") === "1") return "low";
    const mem = navigator.deviceMemory; // Chrome/Edge：GB
    const cores = navigator.hardwareConcurrency; // 逻辑核心数
    if ((typeof mem === "number" && mem > 0 && mem < 4) || (typeof cores === "number" && cores > 0 && cores <= 4)) return "low";
    if ((typeof mem === "number" && mem >= 8) || (typeof cores === "number" && cores >= 8)) return "high";
    return "medium";
  } catch {
    return "medium";
  }
}

/**
 * @returns {{throttleMs:number, maxParticles:number, burstMax:number, allowRipple:boolean}}
 */
export function fxLimit() {
  const tier = getMotionTier();
  if (tier === "low") return { throttleMs: 500, maxParticles: 10, burstMax: 1, allowRipple: false };
  if (tier === "medium") return { throttleMs: 300, maxParticles: 20, burstMax: 2, allowRipple: true };
  return { throttleMs: 240, maxParticles: 30, burstMax: 2, allowRipple: true };
}
