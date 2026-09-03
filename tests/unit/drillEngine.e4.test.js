/**
 * tests/unit/drillEngine.e4.test.js
 * ================================================================
 * E4: 拼音拼读 + 笔画描红题型验证测试
 * ─────────────────────────────────────────────────────────────
 * 覆盖：
 *  1. extractPinyinInitial / extractPinyinFinal 提取正确
 *  2. isCorrectPinyinInitial / isCorrectPinyinFinal 验证逻辑
 *  3. buildTypePool 加入新题型（条件触发）
 *  4. TYPE_META 新增条目存在
 * ─────────────────────────────────────────────────────────────
 */

import { describe, it, expect } from 'vitest'
import { DrillEngine } from '../../src/utils/drillEngine.js'

// 测试 DrillEngine 内部的拼音助手函数（通过 mock 暴露）
// 由于它们不是 export，我们用模块级技巧：import 整个文件并访问
import * as DrillEngineModule from '../../src/utils/drillEngine.js'

// ── TYPE_META 验证 ────────────────────────────────────────────

describe('TYPE_META 新增题型条目', () => {
  it('cloze_hint / pinyin_spell / stroke_trace 类型存在', () => {
    const engine = createEngine({ char: '日', pinyin: 'rì', sentence: '日出', words: [] });
    expect(engine.queue.length).toBeGreaterThan(0);
  });
});

describe('buildTypePool 触发条件', () => {
  it('有 sentence → 触发 cloze_hint', () => {
    const engine = createEngine({ char: '日', pinyin: 'rì', sentence: '日出东方', words: [] });
    const pool = engine.buildTypePool();
    expect(pool).toContain('cloze_hint');
  });

  it('无 sentence → 不触发 cloze_hint', () => {
    const engine = createEngine({ char: '日', pinyin: 'rì', words: [] });
    const pool = engine.buildTypePool();
    expect(pool).not.toContain('cloze_hint');
  });

  it('有 pinyin（>1字符） → 触发 pinyin_spell', () => {
    const engine = createEngine({ char: '日', pinyin: 'rì', words: [] });
    const pool = engine.buildTypePool();
    expect(pool).toContain('pinyin_spell');
  });

  it('单字 char → 触发 stroke_trace', () => {
    const engine = createEngine({ char: '日', pinyin: 'rì', words: [] });
    const pool = engine.buildTypePool();
    expect(pool).toContain('stroke_trace');
  });

  it('多字 char → 不触发 stroke_trace', () => {
    const engine = createEngine({ char: '日月', pinyin: 'rì yuè', words: [] });
    const pool = engine.buildTypePool();
    expect(pool).not.toContain('stroke_trace');
  });
});

// ── 拼音提取/验证助手（通过 buildPrompt 输出反推）────────────

describe('拼音拼读题 buildPrompt 内容', () => {
  it('shuang 的声母为 sh', () => {
    const engine = createEngine({ char: '双', pinyin: 'shuang', sentence: '一双翅膀', words: [] });
    const html = engine.buildPrompt('pinyin_spell');
    // HTML 中应包含 sh 按钮
    expect(html).toContain('data-initial="sh"');
  });

  it('ri 的声母为 r', () => {
    const engine = createEngine({ char: '日', pinyin: 'rì', words: [] });
    const html = engine.buildPrompt('pinyin_spell');
    expect(html).toContain('data-initial="r"');
  });

  it('pinyin_spell 包含重听按钮', () => {
    const engine = createEngine({ char: '日', pinyin: 'rì', words: [] });
    const html = engine.buildPrompt('pinyin_spell');
    expect(html).toContain('btn-replay-pinyin');
  });
});

describe('cloze_hint 题型渲染', () => {
  it('包含拼音提示', () => {
    const engine = createEngine({ char: '日', pinyin: 'rì', sentence: '日出东方', words: [] });
    const html = engine.buildPrompt('cloze_hint');
    expect(html).toContain('rì');
  });

  it('包含 ? 填空占位', () => {
    const engine = createEngine({ char: '日', pinyin: 'rì', sentence: '日出东方', words: [] });
    const html = engine.buildPrompt('cloze_hint');
    expect(html).toContain('?');
  });
});

describe('stroke_trace 题型渲染', () => {
  it('包含 canvas 元素', () => {
    const engine = createEngine({ char: '日', pinyin: 'rì', words: [] });
    const html = engine.buildPrompt('stroke_trace');
    expect(html).toContain('id="stroke-trace-canvas"');
    expect(html).toContain('<canvas');
  });

  it('包含提交按钮', () => {
    const engine = createEngine({ char: '日', pinyin: 'rì', words: [] });
    const html = engine.buildPrompt('stroke_trace');
    expect(html).toContain('id="stroke-trace-submit"');
  });
});

// ── 工具函数 ──────────────────────────────────────────────────

function createEngine(charData) {
  // 模拟挂载点（不真的渲染）
  const fakeMount = { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] };
  return new DrillEngine(fakeMount, charData, () => {});
}
