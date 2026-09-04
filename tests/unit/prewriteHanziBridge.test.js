/**
 * P0-B1-3 prewrite ↔ hanzi 交互桥测试
 * 直接调原型方法避免启动 requestAnimationFrame 循环
 */
import { describe, it, expect } from 'vitest'
import { HanziEngine } from '../../src/utils/hanziEngine.js'

global.window = global.window || { devicePixelRatio: 1 }

// mockMgr 必须传 prewriteResult 让 getTolerance 能读到
const mockMgr = (age, opts = {}) => ({
  getAge: () => age,
  progress: { settings: opts.settings || {} },
  getLastPrewriteResult: () => opts.prewriteResult || null
});

describe('P0-B1-3 guideMode 三档自动判定', () => {
  const judge = (age, opts = {}) => {
    const mgr = mockMgr(age, opts);
    global.window.ebbinghausManager = mgr;
    return HanziEngine.prototype._ageBasedGuideMode.call({ ebbinghausManager: mgr });
  };
  it('3岁 + 无prewrite → free', () => { expect(judge(3)).toBe('free'); });
  it('3岁 + prewrite完成 → soft', () => { expect(judge(3, { prewriteResult: { avgCoverage: 0.78 } })).toBe('soft'); });
  it('4岁 + 无prewrite → free', () => { expect(judge(4)).toBe('free'); });
  it('4岁 + prewrite完成 → soft', () => { expect(judge(4, { prewriteResult: { avgCoverage: 0.78 } })).toBe('soft'); });
  it('5岁 + 无prewrite → free（放宽到5岁）', () => { expect(judge(5)).toBe('free'); });
  it('5岁 + prewrite完成 → soft', () => { expect(judge(5, { prewriteResult: { avgCoverage: 0.78 } })).toBe('soft'); });
  it('6岁 → soft', () => { expect(judge(6)).toBe('soft'); });
  it('7岁 → strong', () => { expect(judge(7)).toBe('strong'); });
  it('8岁 → strong', () => { expect(judge(8)).toBe('strong'); });
});

describe('P0-B1-3 strictReverseCheck 由 guideMode 决定', () => {
  it('3岁默认 → free → 非 strong', () => {
    const mgr = mockMgr(3); global.window.ebbinghausManager = mgr;
    expect(HanziEngine.prototype._ageBasedGuideMode.call({ ebbinghausManager: mgr }) === 'strong').toBe(false);
  });
  it('7岁默认 → strong', () => {
    const mgr = mockMgr(7); global.window.ebbinghausManager = mgr;
    expect(HanziEngine.prototype._ageBasedGuideMode.call({ ebbinghausManager: mgr }) === 'strong').toBe(true);
  });
});

describe('P0-B1-3 getTolerance 年龄+prewrite 双重调权', () => {
  // 关键：tol 函数必须把 prewriteResult 也传给 mgr！
  const tol = (age, opts = {}) => {
    const mgr = mockMgr(age, opts); // opts 包含 settings + prewriteResult
    global.window.ebbinghausManager = mgr;
    return HanziEngine.prototype.getTolerance.call({ ebbinghausManager: mgr });
  };

  it('家长 strict → 覆盖年龄调权', () => {
    const t = tol(3, { settings: { strokeTolerance: 'strict' } });
    expect(t.start).toBe(16); expect(t.end).toBe(18); expect(t.reverse).toBe(-20);
  });
  it('家长 standard → 覆盖年龄调权', () => {
    const t = tol(3, { settings: { strokeTolerance: 'standard' } });
    expect(t.start).toBe(22); expect(t.end).toBe(24);
  });
  it('3岁默认 → base+6px bonus: start=34 end=36', () => {
    const t = tol(3);
    expect(t.start).toBe(34); expect(t.end).toBe(36);
  });
  it('4岁默认 → base+3px bonus: start=31 end=33', () => {
    const t = tol(4);
    expect(t.start).toBe(31); expect(t.end).toBe(33);
  });
  it('5岁默认 → base 不加不减 start=28', () => { expect(tol(5).start).toBe(28); });
  it('6岁默认 → base 不加不减 start=28 end=30', () => {
    const t = tol(6); expect(t.start).toBe(28); expect(t.end).toBe(30);
  });
  it('3岁 + prewrite cov=0.72（灰色区 0.7-0.85）→ 不动，start=34', () => {
    const t = tol(3, { prewriteResult: { avgCoverage: 0.72 } });
    expect(t.start).toBe(34); expect(t.end).toBe(36);
  });
  it('5岁 + prewrite cov=0.88 → 收紧4px但floor保护→start=26', () => {
    const t = tol(5, { prewriteResult: { avgCoverage: 0.88 } });
    expect(t.start).toBe(26); expect(t.end).toBe(28); // 5-6岁 floor 26/28
  });
  it('3岁 + prewrite cov=0.95 → 收紧4px但floor+age bonus→start=32', () => {
    const t = tol(3, { prewriteResult: { avgCoverage: 0.95 } });
    expect(t.start).toBe(32); expect(t.end).toBe(34); // floor 26 + age bonus +6
  });
  it('3岁 + prewrite cov=0.55 → 再放宽+5px start=39', () => {
    expect(tol(3, { prewriteResult: { avgCoverage: 0.55 } }).start).toBe(39);
  });
  it('7岁 + prewrite cov=0.88 → 收紧4px start=24', () => {
    expect(tol(7, { prewriteResult: { avgCoverage: 0.88 } }).start).toBe(24);
  });
  it('5岁 + prewrite cov=0.82（灰色区 0.7-0.85）→ 不调', () => {
    const t = tol(5, { prewriteResult: { avgCoverage: 0.82 } });
    expect(t.start).toBe(28); // 既不收紧也不放宽
  });
});
