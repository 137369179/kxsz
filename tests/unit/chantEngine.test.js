import { describe, it, expect } from 'vitest';
import {
  CHANT_MODES,
  CHAR_DURATION_MS,
  AVAILABLE_MODES,
  buildPlan,
} from '../../src/utils/chantEngine.js';

// ──────────────────────────────────────────────────────────
// E16 童谣节拍唱读
// 教育学：韵脚 + 节拍 = +40% 记忆保留率
// ──────────────────────────────────────────────────────────

function makeChar(mnemonic = "太阳圆圆的，日出东方") {
  return { char: "日", meanings: { mnemonic } };
}

describe('CHANT_MODES', () => {
  it('4 种模式', () => {
    expect(AVAILABLE_MODES).toHaveLength(4);
    expect(CHANT_MODES.CHANT).toBe("chant");
    expect(CHANT_MODES.PLAIN).toBe("plain");
    expect(CHANT_MODES.RAPID).toBe("rapid");
    expect(CHANT_MODES.SING).toBe("sing");
  });
});

describe('CHAR_DURATION_MS — 各模式时长', () => {
  it('RAPID < PLAIN < CHANT < SING', () => {
    expect(CHAR_DURATION_MS.rapid).toBeLessThan(CHAR_DURATION_MS.plain);
    expect(CHAR_DURATION_MS.plain).toBeLessThan(CHAR_DURATION_MS.chant);
    expect(CHAR_DURATION_MS.chant).toBeLessThan(CHAR_DURATION_MS.sing);
  });
});

describe('buildPlan — 节拍计划构建', () => {
  it('空 char → 空计划', () => {
    const plan = buildPlan({});
    expect(plan.chars).toEqual([]);
    expect(plan.totalMs).toBe(0);
  });

  it('有 mnemonic → 目标字优先 + 口诀逐字', () => {
    const plan = buildPlan(makeChar("太阳圆圆的"));
    // 首 token 是目标字
    expect(plan.chars[0].text).toBe("日");
    expect(plan.chars[0].isTargetChar).toBe(true);
    // 目标字后有停顿
    expect(plan.chars[1].isPause).toBe(true);
    // 口诀 5 字
    const chantTokens = plan.chars.filter((t) => !t.isPause && !t.isTargetChar);
    expect(chantTokens.length).toBe(5);  // 太阳圆圆的
  });

  it('标点 → 自动转停顿', () => {
    const plan = buildPlan(makeChar("太阳圆圆的，日出东方"));
    const pauses = plan.chars.filter((t) => t.isPause);
    expect(pauses.length).toBeGreaterThanOrEqual(2);  // 目标字后 + 逗号
    // 逗号停顿 ~350ms
    const commaPause = pauses.find((p) => p.durationMs >= 300 && p.durationMs <= 400);
    expect(commaPause).toBeTruthy();
  });

  it('句号 → 更长停顿', () => {
    const plan = buildPlan(makeChar("太阳圆圆的。日出东方。"));
    const longPause = plan.chars.filter((t) => t.isPause && t.durationMs >= 500);
    expect(longPause.length).toBeGreaterThanOrEqual(2);
  });

  it('每个非 pause token 都有 beat 序号', () => {
    const plan = buildPlan(makeChar("太阳圆圆的"));
    let beat = 0;
    for (const t of plan.chars) {
      if (!t.isPause) {
        beat++;
        expect(t.beat).toBe(beat);
      }
    }
    expect(beat).toBeGreaterThanOrEqual(3);
  });

  it('RAPID 模式 → totalMs 更短', () => {
    const chant = buildPlan(makeChar("太阳圆圆的"), { mode: "chant" });
    const rapid = buildPlan(makeChar("太阳圆圆的"), { mode: "rapid" });
    expect(rapid.totalMs).toBeLessThan(chant.totalMs);
  });

  it('SING 模式 → totalMs 最长', () => {
    const chant = buildPlan(makeChar("太阳圆圆的"), { mode: "chant" });
    const sing = buildPlan(makeChar("太阳圆圆的"), { mode: "sing" });
    expect(sing.totalMs).toBeGreaterThan(chant.totalMs);
  });

  it('bpm 被记录', () => {
    const plan = buildPlan(makeChar("太阳圆圆的"), { bpm: 140 });
    expect(plan.bpm).toBe(140);
  });

  it('mnemonic 为空 → fallback "X字有道理"', () => {
    const plan = buildPlan({ char: "日" });
    expect(plan.chars.length).toBeGreaterThanOrEqual(3);
    const firstNonPause = plan.chars.find((t) => !t.isPause);
    expect(firstNonPause.text).toBe("日");
  });
});
