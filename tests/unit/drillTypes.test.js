/**
 * tests/unit/drillTypes.test.js
 * ================================================================
 * E4 扩展题型单元测试
 */

import { describe, it, expect } from 'vitest'
import {
  clozeFill,
  pinyinRead,
  pictureWrite,
  NEW_TYPE_META,
  canApplyNewType,
} from '../../src/utils/drillTypes.js'

const sampleChar = {
  char: "明",
  pinyin: "míng",
  meaning: "光明",
  sentence: "今天阳光很明（　）。",
  words: [{ word: "明天", pinyin: "míng tiān" }],
  confusingChars: ["朋", "星"],
  oracleGlyph: "日",
};

const allChars = [
  sampleChar,
  { char: "朋", pinyin: "péng", sentence: "我们有朋友。", confusingChars: [] },
  { char: "星", pinyin: "xīng", sentence: "星星很亮。", confusingChars: [] },
  { char: "日", pinyin: "rì", sentence: "日出东方。", confusingChars: [] },
  { char: "月", pinyin: "yuè", sentence: "月亮真圆。", confusingChars: [] },
];

describe('clozeFill', () => {
  it('返回有效题目结构', () => {
    const result = clozeFill(sampleChar, allChars);
    expect(result).not.toBeNull();
    expect(result.type).toBe('cloze_fill');
    expect(result.options).toHaveLength(4);
    expect(result.options[result.correctIndex]).toBe('明');
  });

  it('挖空后句子包含（　）', () => {
    const result = clozeFill(sampleChar, allChars);
    expect(result.promptHTML).toContain('（　）');
  });

  it('字符不含于句子时返回 null', () => {
    const badChar = { char: 'X', sentence: '你好世界。' };
    expect(clozeFill(badChar, allChars)).toBeNull();
  });

  it('sentence 缺失返回 null', () => {
    expect(clozeFill({ char: '明' }, allChars)).toBeNull();
  });

  it('干扰项至少包含 2 个不同字符', () => {
    const result = clozeFill(sampleChar, allChars);
    const distractors = result.options.filter((c) => c !== '明');
    expect(distractors.length).toBeGreaterThanOrEqual(2);
    const unique = new Set(distractors);
    expect(unique.size).toBe(distractors.length);
  });

  it('HTML 转义安全：用户输入的尖括号不破坏 DOM', () => {
    const evil = { ...sampleChar, sentence: '今天<script>alert(1)</script>很明（）。' };
    const result = clozeFill(evil, allChars);
    expect(result.promptHTML).not.toContain('<script>');
    expect(result.promptHTML).toContain('&lt;script&gt;');
  });
});

describe('pinyinRead', () => {
  it('返回有效题目', () => {
    const result = pinyinRead(sampleChar, allChars);
    expect(result).not.toBeNull();
    expect(result.type).toBe('pinyin_read');
    expect(result.correctIndex).toBeGreaterThanOrEqual(0);
    expect(result.options[result.correctIndex]).toBe('míng');
  });

  it('4 个选项中包含正确拼音', () => {
    const result = pinyinRead(sampleChar, allChars);
    expect(result.options).toContain('míng');
  });

  it('4 个选项不重复', () => {
    const result = pinyinRead(sampleChar, allChars);
    expect(new Set(result.options).size).toBe(4);
  });

  it('缺拼音返回 null', () => {
    expect(pinyinRead({ char: '明' }, allChars)).toBeNull();
  });

  it('提示文本包含 word 或 meaning', () => {
    const result = pinyinRead(sampleChar, allChars);
    expect(result.promptHTML).toMatch(/(明天|光明)/);
  });
});

describe('pictureWrite', () => {
  it('返回有效题目', () => {
    const result = pictureWrite(sampleChar, allChars);
    expect(result).not.toBeNull();
    expect(result.type).toBe('picture_write');
    expect(result.options).toContain('明');
  });

  it('使用 oracleGlyph 作为图示', () => {
    const result = pictureWrite(sampleChar, allChars);
    expect(result.promptHTML).toContain('日'); // oracleGlyph
  });

  it('无 oracleGlyph 时回退到 char', () => {
    const noGlyph = { char: '明', meaning: '光明' };
    const result = pictureWrite(noGlyph, allChars);
    expect(result.promptHTML).toContain('明');
  });

  it('包含 4 个不同选项', () => {
    const result = pictureWrite(sampleChar, allChars);
    expect(result.options).toHaveLength(4);
    expect(new Set(result.options).size).toBe(4);
  });
});

describe('canApplyNewType', () => {
  it('cloze_fill: 需要 sentence 包含 char', () => {
    expect(canApplyNewType('cloze_fill', sampleChar)).toBe(true);
    expect(canApplyNewType('cloze_fill', { char: '明' })).toBe(false);
    expect(canApplyNewType('cloze_fill', { char: '明', sentence: '你好世界。' })).toBe(false);
  });

  it('pinyin_read: 需要 pinyin', () => {
    expect(canApplyNewType('pinyin_read', sampleChar)).toBe(true);
    expect(canApplyNewType('pinyin_read', { char: '明' })).toBe(false);
  });

  it('picture_write: 总是返回 true', () => {
    expect(canApplyNewType('picture_write', sampleChar)).toBe(true);
    expect(canApplyNewType('picture_write', { char: '明' })).toBe(true);
  });

  it('未知类型返回 false', () => {
    expect(canApplyNewType('unknown', sampleChar)).toBe(false);
  });
});

describe('NEW_TYPE_META', () => {
  it('包含 3 种新题型', () => {
    expect(NEW_TYPE_META.cloze_fill).toBeDefined();
    expect(NEW_TYPE_META.pinyin_read).toBeDefined();
    expect(NEW_TYPE_META.picture_write).toBeDefined();
  });

  it('每种题型都有 name/tip/iconSvg', () => {
    Object.values(NEW_TYPE_META).forEach((m) => {
      expect(typeof m.name).toBe('string');
      expect(typeof m.tip).toBe('string');
      expect(typeof m.iconSvg).toBe('function');
      expect(m.iconSvg('w-6')).toContain('w-6');
    });
  });

  it('每种题型的 renderer 返回有效题目', () => {
    Object.entries(NEW_TYPE_META).forEach(([key, meta]) => {
      if (canApplyNewType(key, sampleChar)) {
        const result = meta.renderer(sampleChar, allChars);
        expect(result.options.length).toBe(4);
        expect(result.promptHTML).toBeTruthy();
      }
    });
  });
});

describe("pinyin_link", () => {
  it("builds options for char with pinyin", async () => {
    const { pinyinLink, canApplyNewType } = await import("../../src/utils/drillTypes.js");
    const char = { char: "日", pinyin: "ri", confusingChars: ["曰", "目"] };
    expect(canApplyNewType("pinyin_link", char)).toBe(true);
    const q = pinyinLink(char, [{ char: "月", pinyin: "yue" }, { char: "水", pinyin: "shui" }]);
    expect(q.type).toBe("pinyin_link");
    expect(q.options).toContain("日");
    expect(q.correctIndex).toBeGreaterThanOrEqual(0);
  });
});
