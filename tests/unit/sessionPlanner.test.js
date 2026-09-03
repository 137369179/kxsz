import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getSessionConfig,
  planDailySession,
  expandQueue,
  setDeps,
  _resetDeps,
  AGE_SESSION_TABLE,
} from '../../src/utils/sessionPlanner.js';

// ──────────────────────────────────────────────────────────
// B4 米勒 7±2 法则 + Cowan 4±1 工作记忆块化
// 教育学引用：Miller 1956 / Cowan 2001 / 皮亚杰认知发展理论
// ──────────────────────────────────────────────────────────

function makeDeps({ age = 6, records = {}, dueIds = [], difficultIds = [], charDB = null } = {}) {
  const db = charDB ?? [
    { id: "char_001", char: "日",  index: 1 },
    { id: "char_002", char: "月",  index: 2 },
    { id: "char_003", char: "水",  index: 3 },
    { id: "char_004", char: "火",  index: 4 },
    { id: "char_005", char: "山",  index: 5 },
    { id: "char_006", char: "石",  index: 6 },
    { id: "char_007", char: "田",  index: 7 },
    { id: "char_008", char: "木",  index: 8 },
    { id: "char_009", char: "土",  index: 9 },
    { id: "char_010", char: "人",  index: 10 },
    { id: "char_011", char: "口",  index: 11 },
    { id: "char_012", char: "手",  index: 12 },
  ];

  // records 的 key 是 charId，value 是 { masteryRate, lapses, ... }
  const em = {
    getAge: () => age,
    progress: { charRecords: records },
    getDueReviewCharIds: () => dueIds,
    getDifficultCharIds: () => difficultIds,
  };
  setDeps({ ebbinghaus: em, characterDB: db });
  return { em, db };
}

describe('getSessionConfig — B4 年龄硬约束', () => {
  it('6-7岁：7块 = 3新 + 4复习（米勒 7±2）', () => {
    expect(getSessionConfig(6)).toEqual({ total: 7, newChars: 3, reviews: 4 });
    expect(getSessionConfig(7)).toEqual({ total: 7, newChars: 3, reviews: 4 });
  });

  it('4岁：4块 = 2新 + 2复习（Cowan 4±1 下限）', () => {
    expect(getSessionConfig(4)).toEqual({ total: 4, newChars: 2, reviews: 2 });
  });

  it('5岁：5块 = 2新 + 3复习', () => {
    expect(getSessionConfig(5)).toEqual({ total: 5, newChars: 2, reviews: 3 });
  });

  it('3岁：3块 = 1新 + 2复习（极低工作记忆）', () => {
    expect(getSessionConfig(3)).toEqual({ total: 3, newChars: 1, reviews: 2 });
  });

  it('8岁以上同 6-7 岁（米勒 7±2 硬上限）', () => {
    expect(getSessionConfig(8)).toEqual({ total: 7, newChars: 3, reviews: 4 });
    expect(getSessionConfig(12)).toEqual({ total: 7, newChars: 3, reviews: 4 });
  });

  it('age 非法值回退到 6 岁（或合理 clamp）', () => {
    // -1 clamp 到 3 → 3岁的配置
    expect(getSessionConfig(-1)).toEqual({ total: 3, newChars: 1, reviews: 2 });
    expect(getSessionConfig(999)).toEqual({ total: 7, newChars: 3, reviews: 4 });
    expect(getSessionConfig(NaN)).toEqual({ total: 7, newChars: 3, reviews: 4 });
    expect(getSessionConfig(undefined)).toEqual({ total: 7, newChars: 3, reviews: 4 });
  });
});

describe('planDailySession — 6岁完整场景', () => {
  beforeEach(() => _resetDeps());

  it('新字+复习都充足 → 3新+4复习=7 硬上限', () => {
    // 学过 8 个，剩 4 个新字
    const records = Object.fromEntries(
      ["char_001", "char_002", "char_003", "char_004", "char_005", "char_006", "char_007", "char_008"]
        .map((id) => [id, { masteryRate: 80 }])
    );
    const dueIds = ["char_001", "char_002", "char_003", "char_004"];

    makeDeps({ age: 6, records, dueIds });
    const plan = planDailySession();

    expect(plan.totalBlocks).toBe(7);
    expect(plan.newChars.length).toBe(3);
    expect(plan.reviews.length).toBe(4);
    // 新字应该是 index 最小的未学（char_009/010/011）
    expect(plan.newChars.map((c) => c.id)).toEqual(["char_009", "char_010", "char_011"]);
    // 复习优先 due
    expect(plan.reviews.slice(0, 4).map((c) => c.source)).toEqual(["due", "due", "due", "due"]);
    expect(plan.isPartial).toBe(false);
  });

  it('完全没学过字 → 全新字 isPartial=true', () => {
    makeDeps({ age: 6, records: {}, dueIds: [] }); // 空 records
    const plan = planDailySession();

    expect(plan.newChars.length).toBeGreaterThanOrEqual(3);
    expect(plan.reviews.length).toBe(0);
    expect(plan.isPartial).toBe(true);
  });

  it('新字池耗尽 → isPartial=true 且总块数可能 < 7', () => {
    // 12 字全学了 → 新字池空
    const records = Object.fromEntries(
      Array.from({ length: 12 }, (_, i) => [`char_${String(i + 1).padStart(3, "0")}`, { masteryRate: 80 }])
    );
    makeDeps({ age: 6, records, dueIds: ["char_001", "char_002", "char_003", "char_004"] });
    const plan = planDailySession();

    expect(plan.newChars.length).toBe(0); // 没有新字了
    expect(plan.isPartial).toBe(true);
    expect(plan.reviews.length).toBeGreaterThanOrEqual(4); // 至少复习
  });
});

describe('planDailySession — 不同年龄块化', () => {
  beforeEach(() => _resetDeps());

  it('4岁：4块 = 2新 + 2复习', () => {
    const records = Object.fromEntries(
      ["char_001", "char_002", "char_003"].map((id) => [id, { masteryRate: 50 }])
    );
    makeDeps({ age: 4, records, dueIds: ["char_001", "char_002"] });
    const plan = planDailySession();

    expect(plan.totalBlocks).toBe(4);
    expect(plan.newChars.length).toBe(2);
    expect(plan.reviews.length).toBe(2);
  });

  it('3岁：3块 = 1新 + 2复习', () => {
    const records = { char_001: { masteryRate: 40 } };
    makeDeps({ age: 3, records, dueIds: ["char_001"] });
    const plan = planDailySession();

    expect(plan.totalBlocks).toBe(3);
    expect(plan.newChars.length).toBe(1);
    expect(plan.reviews.length).toBe(2);
  });
});

describe('复习池优先级：FSRS due > 难字档案 > 保底已学', () => {
  beforeEach(() => _resetDeps());

  it('dueIds 优先被选入 reviews', () => {
    const records = Object.fromEntries(
      ["char_001", "char_002", "char_003", "char_004", "char_005", "char_006", "char_007"].map((id) => [id, { masteryRate: 80 }])
    );
    const dueIds = ["char_001", "char_002"];
    const difficultIds = ["char_003"];
    makeDeps({ age: 4, records, dueIds, difficultIds }); // 4岁 2复习
    const plan = planDailySession();

    // 前 2 个复习应该至少有 due 的
    const revSources = plan.reviews.map((r) => r.source);
    expect(revSources).toContain("due");
  });

  it('dueIds 不够时难字档案补位', () => {
    const records = Object.fromEntries(
      ["char_001", "char_002", "char_003", "char_004"].map((id) => [id, { masteryRate: 80 }])
    );
    const dueIds = ["char_001"];
    const difficultIds = ["char_003"];
    makeDeps({ age: 4, records, dueIds, difficultIds }); // 4岁 2复习
    const plan = planDailySession();

    const revSources = plan.reviews.map((r) => r.source);
    expect(revSources).toContain("mistake");
  });
});

describe('expandQueue — blockOrder → 扁平队列', () => {
  beforeEach(() => _resetDeps());

  it('正确交替排列', () => {
    const records = Object.fromEntries(
      ["char_001", "char_002", "char_003", "char_004"].map((id) => [id, { masteryRate: 80 }])
    );
    makeDeps({ age: 4, records, dueIds: ["char_001", "char_002"] });
    const plan = planDailySession();

    const queue = expandQueue(plan);
    expect(queue.length).toBe(4);
    // 4岁 2new+2review → 交替
    expect(queue.map((q) => q.type).filter((t) => t === "new").length).toBe(2);
    expect(queue.map((q) => q.type).filter((t) => t === "review").length).toBe(2);
  });
});

describe('硬边界 / 空数据', () => {
  beforeEach(() => _resetDeps());

  it('ebbinghaus 未注入 → 安全回退（不崩）', () => {
    const plan = planDailySession({ age: 6 });
    // 没有 deps，records 空 → 全是新字（但 charDB 也没）
    expect(plan.totalBlocks).toBe(0);
    expect(plan.isPartial).toBe(true);
  });

  it('0 个新字也能安全 plan', () => {
    const records = Object.fromEntries(
      Array.from({ length: 12 }, (_, i) => [`char_${String(i + 1).padStart(3, "0")}`, { masteryRate: 80 }])
    );
    makeDeps({ age: 6, records, dueIds: ["char_001", "char_002", "char_003", "char_004"] });
    const plan = planDailySession();
    expect(() => expandQueue(plan)).not.toThrow();
  });
});
