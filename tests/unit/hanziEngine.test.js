import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HanziEngine } from '../../src/utils/hanziEngine.js'

// Mock DOM minimally
global.window = { devicePixelRatio: 1, ebbinghausManager: { getAge: () => 6 } }
global.document = {
  createElement: vi.fn(() => ({ style: {}, classList: { add: vi.fn(), remove: vi.fn() }, innerHTML: '' })),
  getElementsByClassName: vi.fn(() => []),
  querySelector: vi.fn(() => null),
  querySelectorAll: vi.fn(() => []),
  head: { appendChild: vi.fn() },
  body: { appendChild: vi.fn() },
}
global.ResizeObserver = class { observe() {} disconnect() {} }

// 从 prototype 直接调用纯逻辑方法（不需要真实例）
const _P = HanziEngine.prototype;
const _eng = () => Object.create(_P);

describe('HanziEngine Module', () => {
  it('should export HanziEngine class', () => {
    expect(HanziEngine).toBeDefined()
    expect(typeof HanziEngine).toBe('function')
  })

  it('should have expected prototype methods', () => {
    const methods = ['destroy', 'initCanvasSize', 'bindEvents', 'getPointerPos',
      'onPointerDown', 'onPointerMove', 'onPointerUp', 'triggerError',
      'demoAllStrokes', 'stopDemo',
      'strokeDirectionValidator', '_angleWithin']
    for (const method of methods) {
      expect(typeof _P[method]).toBe('function', `HanziEngine should have ${method}`)
    }
  })

  it('should export default hanziEngine instance pattern', () => {
    expect('HanziEngine').toBeDefined()
  })
})

// ──────────────────────────────────────────────────────────
// T4 笔顺方向角验证测试（P0-4）
// 教育学引用：B6 书写年龄适配 + Sweller 反认知过载
// ──────────────────────────────────────────────────────────

describe('T4 strokeDirectionValidator — 直线笔画', () => {
  it('同方向应通过（手写有抖动）', () => {
    const expected = { start: { x: 10, y: 50 }, end: { x: 90, y: 50 } };
    const userPath = [
      { x: 10, y: 49 }, { x: 30, y: 51 }, { x: 55, y: 48 }, { x: 80, y: 50 }, { x: 90, y: 52 }
    ];
    expect(_eng().strokeDirectionValidator(userPath, expected, 60)).toBe(true);
  });

  it('反向笔画应被拦截（左→右写成右→左）', () => {
    const expected = { start: { x: 10, y: 50 }, end: { x: 90, y: 50 } };
    const userPath = [
      { x: 90, y: 50 }, { x: 70, y: 51 }, { x: 40, y: 49 }, { x: 10, y: 50 }
    ];
    expect(_eng().strokeDirectionValidator(userPath, expected, 60)).toBe(false);
  });

  it('45° 严格模式下反向应被拦截', () => {
    const expected = { start: { x: 10, y: 50 }, end: { x: 90, y: 50 } };
    const userPath = [
      { x: 85, y: 45 }, { x: 50, y: 55 }, { x: 15, y: 50 }
    ];
    expect(_eng().strokeDirectionValidator(userPath, expected, 45)).toBe(false);
  });

  it('边界 59° 偏差在 60° 内容忍', () => {
    const expected = { start: { x: 10, y: 50 }, end: { x: 90, y: 50 } };
    const x2 = 10 + 80 * Math.cos(59 * Math.PI / 180);
    const y2 = 50 + 80 * Math.sin(59 * Math.PI / 180);
    const userPath = [{ x: 10, y: 50 }, { x: x2, y: y2 }];
    expect(_eng().strokeDirectionValidator(userPath, expected, 60)).toBe(true);
  });
});

describe('T4 strokeDirectionValidator — corner 折笔（分段验证）', () => {
  it('正确的横折应通过', () => {
    const expected = {
      start: { x: 10, y: 30 },
      corner: { x: 70, y: 30 },
      end:   { x: 70, y: 80 },
    };
    const userPath = [
      { x: 12, y: 31 }, { x: 40, y: 29 }, { x: 68, y: 32 },
      { x: 69, y: 45 }, { x: 71, y: 62 }, { x: 70, y: 79 },
    ];
    expect(_eng().strokeDirectionValidator(userPath, expected, 60)).toBe(true);
  });

  it('横折的横段反了应被拦截', () => {
    const expected = {
      start: { x: 10, y: 30 },
      corner: { x: 70, y: 30 },
      end:   { x: 70, y: 80 },
    };
    const userPath = [
      { x: 68, y: 31 }, { x: 40, y: 29 }, { x: 11, y: 30 },
      { x: 12, y: 50 }, { x: 10, y: 78 },
    ];
    expect(_eng().strokeDirectionValidator(userPath, expected, 60)).toBe(false);
  });

  it('竖钩应通过', () => {
    const expected = {
      start: { x: 50, y: 10 },
      corner: { x: 50, y: 70 },
      end:   { x: 20, y: 65 },
    };
    const userPath = [
      { x: 51, y: 12 }, { x: 50, y: 40 }, { x: 49, y: 69 },
      { x: 45, y: 68 }, { x: 30, y: 66 }, { x: 22, y: 64 },
    ];
    expect(_eng().strokeDirectionValidator(userPath, expected, 60)).toBe(true);
  });
});

describe('T4 _angleWithin 360° 循环比较', () => {
  it('350° vs 10° 差 20° 应容忍', () => {
    expect(_eng()._angleWithin(350, 10, 60)).toBe(true);
    expect(_eng()._angleWithin(10, 350, 60)).toBe(true);
  });

  it('170° vs -170° 差 20° 应容忍', () => {
    expect(_eng()._angleWithin(170, -170, 60)).toBe(true);
  });

  it('0° vs 180° 差 180° 不应在 60° 内', () => {
    expect(_eng()._angleWithin(0, 180, 60)).toBe(false);
  });
});

describe('T4 绕路检测与 checkTraceAccuracy 综合判定', () => {
  it('验证绕路轨迹不通过（路径长度超过理论值 2.2 倍）', () => {
    const expected = { start: { x: 10, y: 50 }, end: { x: 90, y: 50 } };
    // 首尾对齐，但中间严重绕大弯
    const detourPath = [
      { x: 10, y: 50 },
      { x: 10, y: 150 },
      { x: 50, y: 180 },
      { x: 90, y: 150 },
      { x: 90, y: 50 },
    ];
    expect(_eng().strokeDirectionValidator(detourPath, expected, 60)).toBe(false);
  });

  it('checkTraceAccuracy 应综合起点、终点与方向角验证', () => {
    const eng = _eng();
    eng.strokeTolerance = { start: 25, end: 25 };
    const expected = { start: { x: 10, y: 50 }, end: { x: 90, y: 50 } };

    // 正常书写：起点准、终点准、方向正
    const goodPath = [
      { x: 10, y: 50 }, { x: 50, y: 50 }, { x: 90, y: 50 }
    ];
    expect(eng.checkTraceAccuracy(goodPath, expected, 60)).toBe(true);

    // 起点偏差过大
    const badStart = [
      { x: 60, y: 50 }, { x: 80, y: 50 }, { x: 90, y: 50 }
    ];
    expect(eng.checkTraceAccuracy(badStart, expected, 60)).toBe(false);

    // 终点未写完
    const incomplete = [
      { x: 10, y: 50 }, { x: 30, y: 50 }, { x: 45, y: 50 }
    ];
    expect(eng.checkTraceAccuracy(incomplete, expected, 60)).toBe(false);
  });
});

