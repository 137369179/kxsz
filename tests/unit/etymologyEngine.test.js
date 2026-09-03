import { describe, it, expect } from 'vitest';
import {
  EVOLUTION_STAGES,
  buildEvolutionStages,
  extractMnemonic,
  buildConfusingSet,
  summarizeEtymology,
  buildEtymologyCard,
} from '../../src/utils/etymologyEngine.js';

// ──────────────────────────────────────────────────────────
// 教育学依据：
//   字源教学法 — 4 阶段演变建立形义联系
//   记忆术 — mnemonic 口诀 +40% 保留率
//   对比辨析 — confusingChars 主动暴露易错点
// ──────────────────────────────────────────────────────────

function makeChar(overrides = {}) {
  return {
    id: "char_etym_test",
    char: "日",
    charType: "pictograph",
    oracleGlyph: "",
    bronzeGlyph: "",
    evolution: {
      story: "古人看到的太阳是圆圆的，中间有一个发光的黑子，于是画了一个圆圈中间加一点，后来演变成方正的日字。",
      oracleDesc: "像圆圆的太阳，中间有一点光芒",
      bronzeDesc: "线条逐渐规整，象征白昼与光芒",
      sealDesc: "演变为长圆框与横线",
      modernDesc: "楷书方正规整，代表太阳与日子",
    },
    meanings: {
      primary: "太阳",
      extended: "日常",
      radicalHint: "日字旁和太阳、时间有关",
      mnemonic: "太阳圆圆的",
    },
    confusingChars: ["目", "白", "田", "旦"],
    confusingHint: "目(mù), 白(bái), 田(tián), 旦(dàn)",
    ...overrides,
  };
}

describe('EVOLUTION_STAGES — 4 阶段不变', () => {
  it('固定 4 阶段顺序', () => {
    expect(EVOLUTION_STAGES.length).toBe(4);
    expect(EVOLUTION_STAGES.map(s => s.key)).toEqual(["oracle", "bronze", "seal", "modern"]);
  });

  it('每阶段有 label + age + descField', () => {
    for (const s of EVOLUTION_STAGES) {
      expect(s.label).toBeTruthy();
      expect(s.age).toBeTruthy();
      if (s.descField) expect(s.descField in makeChar().evolution).toBe(true);
    }
  });
});

describe('buildEvolutionStages — 4 阶段 timeline', () => {
  it('null char → 空数组', () => {
    expect(buildEvolutionStages(null)).toEqual([]);
  });

  it('标准 4 阶段输出', () => {
    const stages = buildEvolutionStages(makeChar());
    expect(stages.length).toBe(4);
    expect(stages[0].key).toBe("oracle");
    expect(stages[3].key).toBe("modern");
    expect(stages[3].glyph).toBe("日");  // modern 用 char 本身
    expect(stages[3].isFallback).toBe(false);
  });

  it('oracleGlyph/bronzeGlyph 为空 → fallback 标记', () => {
    const stages = buildEvolutionStages(makeChar());
    expect(stages[0].isFallback).toBe(true);   // oracleGlyph=""
    expect(stages[1].isFallback).toBe(true);   // bronzeGlyph=""
  });

  it('oracleGlyph 有值 → 不 fallback', () => {
    const stages = buildEvolutionStages(makeChar({ oracleGlyph: "☼" }));
    expect(stages[0].glyph).toBe("☼");
    expect(stages[0].isFallback).toBe(false);
  });

  it('seal 阶段 desc 正确取 sealDesc', () => {
    const stages = buildEvolutionStages(makeChar());
    expect(stages[2].desc).toContain("长圆框");
  });
});

describe('extractMnemonic — 口诀生成 3 种来源', () => {
  it('优先 meanings.mnemonic（人工最准）', () => {
    const m = extractMnemonic(makeChar());
    expect(m.source).toBe("mnemonic");
    expect(m.chant).toBe("太阳圆圆的");
  });

  it('mnemonic 缺失 → 从 evolution.story 提炼第一分句', () => {
    const c = makeChar({ meanings: { mnemonic: "" } });
    const m = extractMnemonic(c);
    expect(m.source).toBe("story");
    expect(m.chant.length).toBeGreaterThan(3);
  });

  it('都没有 → charType 通用模板', () => {
    const c = makeChar({ meanings: {}, evolution: {} });
    const m = extractMnemonic(c);
    expect(m.source).toBe("template");
    expect(m.chantType).toBe("pictograph");
    expect(m.chant).toContain("古人画");
  });

  it('null char → 空口诀', () => {
    const m = extractMnemonic(null);
    expect(m.chant).toBe("");
    expect(m.source).toBe("template");
  });
});

describe('buildConfusingSet — 易错字对比', () => {
  it('解析 confusingHint 格式 "目(mù), 白(bái)"', () => {
    const set = buildConfusingSet(makeChar());
    expect(set.hasConfusables).toBe(true);
    expect(set.count).toBeGreaterThanOrEqual(2);
    expect(set.pairs[0].other).toBe("目");
    expect(set.pairs[0].otherPinyin).toBe("mù");
  });

  it('最多 3 个对比对', () => {
    const set = buildConfusingSet(makeChar());
    expect(set.pairs.length).toBeLessThanOrEqual(3);
  });

  it('无 confusingChars → 空', () => {
    const set = buildConfusingSet(makeChar({ confusingChars: [], confusingHint: "" }));
    expect(set.hasConfusables).toBe(false);
    expect(set.count).toBe(0);
  });
});

describe('summarizeEtymology — 一句话讲解', () => {
  it('包含 字 + 甲骨文 + 楷书 + 口诀', () => {
    const text = summarizeEtymology(makeChar());
    expect(text).toContain("日");
    expect(text).toContain("甲骨文");
    expect(text).toContain("楷书");
    expect(text).toContain("口诀");
    expect(text).toContain("太阳圆圆的");
  });

  it('null → 空串', () => {
    expect(summarizeEtymology(null)).toBe("");
  });
});

describe('buildEtymologyCard — 综合卡片', () => {
  it('一次返回所有 UI 需要的数据', () => {
    const card = buildEtymologyCard(makeChar());
    expect(card.stages.length).toBe(4);
    expect(card.mnemonic.chant).toBeTruthy();
    expect(card.confusing.pairs).toBeTruthy();
    expect(card.summary).toBeTruthy();
    expect(card.charType).toBe("pictograph");
  });
});
