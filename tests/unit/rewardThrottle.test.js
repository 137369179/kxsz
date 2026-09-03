import { describe, it, expect, beforeEach } from 'vitest';
import { RewardThrottle, REWARD_TIERS, rewardThrottle } from '../../src/utils/rewardThrottle.js';

// ──────────────────────────────────────────────────────────
// E13 奖励降噪 — B13 铁律：每分钟奖励特效 ≤ 3 次
// 教育学：过度刺激 → 奖励贬值（边际效用递减）
// 技术：令牌桶 + 同类冷却
// ──────────────────────────────────────────────────────────

describe('REWARD_TIERS — 等级常量', () => {
  it('confetti weight=2（最稀有）', () => {
    expect(REWARD_TIERS.CONFETTI.weight).toBe(2);
  });
  it('star / success weight=1', () => {
    expect(REWARD_TIERS.STAR.weight).toBe(1);
    expect(REWARD_TIERS.SUCCESS.weight).toBe(1);
  });
  it('confetti cooldown ≥ star（更强效 → 更长冷却）', () => {
    expect(REWARD_TIERS.CONFETTI.cooldown).toBeGreaterThanOrEqual(REWARD_TIERS.STAR.cooldown);
  });
});

describe('RewardThrottle — 令牌桶窗口配额', () => {
  let t;
  beforeEach(() => { t = new RewardThrottle({ windowMs: 60_000, maxPerWindow: 3 }); });

  it('连续 3 个 star (weight=1) → 都放行（同 ms 内冷却拦截第 2、3）', () => {
    // 同 ms 内，star cooldown=3000 会拦截第 2、3 次
    expect(t.allow('star')).toBe(true);
    expect(t.allow('star')).toBe(false);  // cooldown
    expect(t.allow('star')).toBe(false);  // cooldown
  });

  it('confetti weight=2 → 1 次就占 2/3 配额', () => {
    expect(t.allow('confetti')).toBe(true);        // 用了 2
    expect(t.allow('success')).toBe(true);         // 用了 1 → 满
    expect(t.allow('success')).toBe(false);        // 配额耗尽
  });

  it('confetti 连续 2 次 → 第 2 次超配额', () => {
    expect(t.allow('confetti')).toBe(true);   // 用了 2
    expect(t.allow('confetti')).toBe(false);  // 2+2=4 > 3
  });

  it('未知 tier → 默认允许（不阻塞）', () => {
    expect(t.allow('unknown_tier')).toBe(true);
  });

  it('reset() → 清空配额', () => {
    t.allow('confetti');
    t.allow('success');
    t.reset();
    expect(t.getUsedWeight()).toBe(0);
    expect(t.allow('confetti')).toBe(true);
  });

  it('窗口过期 → 配额自动释放', async () => {
    const t2 = new RewardThrottle({ windowMs: 50, maxPerWindow: 3 });
    t2.allow('confetti');
    t2.allow('success');
    expect(t2.getUsedWeight()).toBe(3);
    await new Promise(r => setTimeout(r, 60));
    expect(t2.getUsedWeight()).toBe(0);  // 窗口过期
    // allow 被 cooldown 拦截是正常的，这里只验证窗口配额
  });
});

describe('同类冷却 — cooldown 内不重复触发', () => {
  let t;
  beforeEach(() => { t = new RewardThrottle(); });

  it('success 2 秒内不能连播', () => {
    expect(t.allow('success')).toBe(true);
    // 同 ms
    expect(t.allow('success')).toBe(false);
  });

  it('confetti 15 秒冷却', () => {
    expect(t.allow('confetti')).toBe(true);
    expect(t.allow('confetti')).toBe(false);
  });

  it('不同 tier 互不影响冷却', () => {
    expect(t.allow('success')).toBe(true);
    expect(t.allow('star')).toBe(true);   // 不同类，放行
    expect(t.allow('jelly')).toBe(true);  // 不同类，放行
    // 但配额用完了（1+1+1=3）
    expect(t.allow('star')).toBe(false);  // 被配额 or 冷却
  });
});

describe('onDenied — 被拒绝事件监听', () => {
  it('拒绝时触发回调', () => {
    const t = new RewardThrottle();
    const denied = [];
    t.onDenied((e) => denied.push(e));

    t.allow('star');  // 放行
    t.allow('star');  // 冷却内 → 拒绝
    t.allow('star');  // 拒绝

    expect(denied.length).toBeGreaterThanOrEqual(1);
    expect(denied[0].tier).toBe('star');
  });
});

describe('rewardThrottle — 模块单例', () => {
  it('导出实例是 RewardThrottle', () => {
    expect(rewardThrottle).toBeInstanceOf(RewardThrottle);
  });

  it('模块内共享状态（进程内一致）', () => {
    rewardThrottle.reset();
    expect(rewardThrottle.allow('star')).toBe(true);
    // 再 import 拿到同一个实例
    expect(rewardThrottle.allow('star')).toBe(false);  // 冷却
    rewardThrottle.reset();
  });
});
