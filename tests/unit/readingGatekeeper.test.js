import { describe, it, expect } from 'vitest';
import {
  READING_STATUS,
  extractRequiredChars,
  checkBookReadiness,
  batchCheckReadiness,
  filterReadableBooks,
} from '../../src/utils/readingGatekeeper.js';

// ──────────────────────────────────────────────────────────
// B10 铁律：绘本必须标注 requiredChars
// B10 未学字处理：拼音注音 > 阻止阅读
// 教育学引用：皮亚杰近发展区
// ──────────────────────────────────────────────────────────

function makeBook({ targetChars = null, requiredChars = null, pages = null } = {}) {
  return {
    id: "bk_test",
    title: "测试书",
    targetChars, requiredChars,
    pages: pages ?? [
      { pageNumber: 1, text: "日月经天，江河行地。" },
      { pageNumber: 2, text: "山河壮丽，岁月静好。" },
    ],
  };
}

function makeRecord(chars, masteryRate = 80) {
  // charRecords: key 是 charId 或 字符，value 有 charId + masteryRate
  const rec = {};
  for (const c of chars) {
    rec[c] = { charId: c, masteryRate };
  }
  return rec;
}

describe('extractRequiredChars — targetChars 优先', () => {
  it('显式 targetChars → 直接用', () => {
    const book = makeBook({ targetChars: ["日", "月", "山", "水"] });
    expect(extractRequiredChars(book)).toEqual(["日", "月", "山", "水"]);
  });

  it('显式 requiredChars（别名）也接受', () => {
    const book = makeBook({ targetChars: null, requiredChars: ["人", "口", "手"] });
    expect(extractRequiredChars(book)).toEqual(["人", "口", "手"]);
  });

  it('两者都有 → targetChars 优先', () => {
    const book = makeBook({ targetChars: ["A"], requiredChars: ["B"] });
    expect(extractRequiredChars(book)).toEqual(["A"]);
  });

  it('都没有 → 从 pages[].text 自动去重提取', () => {
    const book = makeBook(); // 默认 pages: "日月经天..."
    const chars = extractRequiredChars(book);
    expect(chars).toContain("日");
    expect(chars).toContain("月");
    expect(chars).toContain("山");
    expect(chars.length).toBeGreaterThan(0);
    // 去重
    expect(new Set(chars).size).toBe(chars.length);
  });

  it('null book → 空', () => {
    expect(extractRequiredChars(null)).toEqual([]);
  });
});

describe('checkBookReadiness — 三种状态', () => {
  const book = makeBook({ targetChars: ["日", "月", "山", "水", "大"] });

  it('READY: 全学过（或未学 ≤ 10%）', () => {
    const records = makeRecord(["日", "月", "山", "水", "大"]);
    const r = checkBookReadiness(book, records);
    expect(r.status).toBe(READING_STATUS.READY);
    expect(r.action).toBe("read");
    expect(r.stats.unknownCount).toBe(0);
  });

  it('PARTIAL: 未学 > 10% 且 ≤ 50% → 标拼音放行', () => {
    // 5 个字里学了 3 个，未学 2 个 = 40%（在 10%~50% 区间）
    const records = makeRecord(["日", "月", "山"]);
    const r = checkBookReadiness(book, records);
    expect(r.status).toBe(READING_STATUS.PARTIAL);
    expect(r.action).toBe("read_with_pinyin");
    expect(r.stats.unknownCount).toBe(2);
    expect(r.message).toContain("拼音");
  });

  it('BLOCKED: 未学 > 50% → 阻止', () => {
    // 5 个只学了 1 个 = 80% 未学
    const records = makeRecord(["日"]);
    const r = checkBookReadiness(book, records);
    expect(r.status).toBe(READING_STATUS.BLOCKED);
    expect(r.action).toBe("go_learn");
    expect(r.message).toContain("先去认识");
  });

  it('EMPTY: requiredChars 为空 → 放行', () => {
    const book = makeBook({ targetChars: [], pages: [{ pageNumber: 1, text: "abc" }] });
    const r = checkBookReadiness(book, {});
    expect(r.status).toBe(READING_STATUS.EMPTY);
    expect(r.action).toBe("read");
  });

  it('模糊字 masteryRate < 50 → 算 fuzzy 但不算 unknown', () => {
    const book = makeBook({ targetChars: ["日", "月", "山", "水"] });
    const records = {
      "日": { charId: "日", masteryRate: 30 },  // 模糊
      "月": { charId: "月", masteryRate: 90 },
      "山": { charId: "山", masteryRate: 90 },
      "水": { charId: "水", masteryRate: 90 },
    };
    const r = checkBookReadiness(book, records);
    expect(r.status).toBe(READING_STATUS.READY);
    expect(r.stats.fuzzyCount).toBe(1);
    expect(r.stats.unknownCount).toBe(0);
  });

  it('空 charRecords → 全 unknown → BLOCKED', () => {
    const r = checkBookReadiness(book, {});
    expect(r.status).toBe(READING_STATUS.BLOCKED);
  });

  it('charRecords key 是 charId 也能匹配', () => {
    const book = makeBook({ targetChars: ["日"] });
    const records = { "char_001": { charId: "日", masteryRate: 100 } };
    const r = checkBookReadiness(book, records);
    expect(r.status).toBe(READING_STATUS.READY);
  });
});

describe('batchCheckReadiness — 整书架批量', () => {
  const books = [
    makeBook({ targetChars: ["日", "月"] }),
    makeBook({ targetChars: ["日", "月", "山", "水", "大", "小"] }),  // 多
    makeBook({ targetChars: ["X", "Y", "Z"] }),        // BLOCKED
  ];

  it('返回每本书的 readiness', () => {
    const records = makeRecord(["日", "月", "山", "水"]);
    const results = batchCheckReadiness(books, records);
    expect(results.length).toBe(3);
    expect(results[0].readiness.status).toBe(READING_STATUS.READY);
    expect(results[1].readiness.status).toBe(READING_STATUS.PARTIAL);
    expect(results[2].readiness.status).toBe(READING_STATUS.BLOCKED);
  });
});

describe('filterReadableBooks — 过滤掉 BLOCKED', () => {
  it('只保留 READY + PARTIAL', () => {
    const books = [
      makeBook({ targetChars: ["日", "月"] }),
      makeBook({ targetChars: ["X", "Y", "Z", "W", "V"] }),  // BLOCKED
    ];
    const records = makeRecord(["日", "月"]);
    const readable = filterReadableBooks(books, records);
    expect(readable.length).toBe(1);
    expect(readable[0].targetChars).toEqual(["日", "月"]);
  });

  it('null books → 空', () => {
    expect(filterReadableBooks(null, {})).toEqual([]);
  });
});
