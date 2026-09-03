/**
 * rewardThrottle.js — E13 奖励降噪
 *
 * 教育学依据：
 *   B13 铁律：每分钟奖励特效（声音+视觉）不超过 3 次
 *   过度刺激 → 奖励贬值（边际效用递减）
 *   代币经济理论：稀缺性提升奖励感知价值
 *   ADHD 友好：减少视觉/听觉过载
 *
 * 技术：令牌桶算法 — 窗口内按权重消耗配额
 *
 * 用法：
 *   import { rewardThrottle } from '../utils/rewardThrottle.js';
 *
 *   // 每次要播放奖励前先问 throttle 一声
 *   if (rewardThrottle.allow('confetti')) {
 *     soundAndFX.triggerConfetti(container);
 *   }
 *   if (rewardThrottle.allow('star')) {
 *     soundAndFX.playStarEarned(n);
 *   }
 */

// ──────────────────────────────────────────────────────────
// 等级定义（权重越大，越稀有）
// ──────────────────────────────────────────────────────────
export const REWARD_TIERS = Object.freeze({
  CONFETTI: { key: "confetti",  weight: 2, label: "全屏彩屑", cooldown: 15000 },  // 15s 内最多 1 次
  STAR:     { key: "star",      weight: 1, label: "星星音效", cooldown: 3000 },    // 3s 内最多 1 次同类
  SUCCESS:  { key: "success",   weight: 1, label: "成功音效", cooldown: 2000 },
  JELLY:    { key: "jelly",     weight: 1, label: "果冻弹跳", cooldown: 2500 },
  COIN:     { key: "coin",      weight: 1, label: "金币掉落", cooldown: 4000 },
});

// ──────────────────────────────────────────────────────────
// 配置
// ──────────────────────────────────────────────────────────
const DEFAULT_CONFIG = {
  windowMs: 60_000,    // 60 秒窗口
  maxPerWindow: 3,     // 窗口内最多 3 次（总权重）
};

// ──────────────────────────────────────────────────────────
// 节流器（模块级单例）
// ──────────────────────────────────────────────────────────
class RewardThrottle {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this._consumed = [];     // [{ tier, weight, ts }] — 最近 N 次消耗
    this._lastByTier = {};   // { confetti: ts, star: ts, ... } — 每类冷却
    this._listeners = [];    // 监听被拒绝的事件（可选：上报 / 统计）
  }

  /**
   * 询问是否允许播放某奖励。
   * @param {string} tierKey    REWARD_TIERS 的 key（confetti / star / success / jelly / coin）
   * @param {object} [ctx]      可选上下文（用于日志/统计）
   * @returns {boolean} true = 允许播放，false = 跳过（降噪）
   */
  allow(tierKey, ctx = {}) {
    const tier = REWARD_TIERS[tierKey.toUpperCase()];
    if (!tier) {
      // 未知 tier → 默认允许（不阻塞）
      return true;
    }

    const now = Date.now();

    // 1. 同类冷却检查（cooldown 内不重复触发）
    const lastOfThis = this._lastByTier[tierKey] || 0;
    if (now - lastOfThis < tier.cooldown) {
      this._emitDenied(tier, "cooldown", ctx);
      return false;
    }

    // 2. 窗口配额检查（先清理过期）
    this._consumed = this._consumed.filter((c) => now - c.ts < this.config.windowMs);
    const usedWeight = this._consumed.reduce((sum, c) => sum + c.weight, 0);

    if (usedWeight + tier.weight > this.config.maxPerWindow) {
      this._emitDenied(tier, "quota", ctx);
      return false;
    }

    // 3. 放行 → 记录
    this._consumed.push({ tier: tierKey, weight: tier.weight, ts: now });
    this._lastByTier[tierKey] = now;
    this._emitAllowed(tier, ctx);
    return true;
  }

  /** 最近窗口内已消耗多少权重（调试/UI 显示用） */
  getUsedWeight() {
    const now = Date.now();
    this._consumed = this._consumed.filter((c) => now - c.ts < this.config.windowMs);
    return this._consumed.reduce((sum, c) => sum + c.weight, 0);
  }

  /** 重置（用于测试 / 页面切换） */
  reset() {
    this._consumed = [];
    this._lastByTier = {};
  }

  /** 监听被拒绝事件（上报/统计用） */
  onDenied(fn) {
    this._listeners.push(fn);
  }

  _emitDenied(tier, reason, ctx) {
    for (const fn of this._listeners) {
      try { fn({ tier: tier.key, reason, ctx }); } catch (_) {}
    }
  }
  _emitAllowed(tier, ctx) {
    // 可选：onAllowed
  }
}

// 模块级单例（进程内共享）
export const rewardThrottle = new RewardThrottle();

// 构造函数也导出（测试用）
export { RewardThrottle };

// 默认导出
export default rewardThrottle;
