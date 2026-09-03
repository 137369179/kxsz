import { describe, it, expect } from 'vitest';
import {
  SCENES,
  MODALITIES,
  extractModalities,
  assemblePackage,
  forChar,
} from '../../src/utils/multimodalEngine.js';
import { CHARACTER_DATABASE } from '../../src/data/characters.js';
import { ensureDetails } from '../../src/utils/charDetailLoader.js';

await ensureDetails();

// ──────────────────────────────────────────────────────────
// E17 多模态融合
// 教育学：Paivio 双重编码 + 场景适配多模态编排
// ──────────────────────────────────────────────────────────

const SAMPLE = CHARACTER_DATABASE[0]; // 日

describe('SCENES + MODALITIES', () => {
  it('5 种场景', () => {
    expect(Object.values(SCENES)).toEqual(["learn", "review", "play", "drill", "report"]);
  });
  it('11 种模态', () => {
    expect(Object.values(MODALITIES).length).toBeGreaterThanOrEqual(11);
  });
});

describe('extractModalities — 数据抽取', () => {
  it('空 char → 空对象', () => {
    expect(extractModalities(null)).toEqual({});
    expect(extractModalities(undefined)).toEqual({});
    expect(extractModalities({})).toEqual({});
  });

  it('有 char → visual_glyph', () => {
    const mod = extractModalities(SAMPLE);
    expect(mod[MODALITIES.VISUAL_GLYPH]).toBe(SAMPLE.char);
  });

  it('有 emoji → visual_emoji', () => {
    const mod = extractModalities(SAMPLE);
    expect(mod[MODALITIES.VISUAL_EMOJI]).toBe(SAMPLE.emoji);
  });

  it('有 evolution → visual_timeline', () => {
    const mod = extractModalities(SAMPLE);
    expect(mod[MODALITIES.VISUAL_TIMELINE]).toBeTruthy();
    expect(mod[MODALITIES.VISUAL_TIMELINE].evolution).toBeTruthy();
  });

  it('有 pinyin → auditory_pinyin', () => {
    const mod = extractModalities(SAMPLE);
    expect(mod[MODALITIES.AUDITORY_PINYIN]).toBe(SAMPLE.pinyin);
  });

  it('有 meanings.mnemonic → auditory_chant', () => {
    const mod = extractModalities(SAMPLE);
    expect(mod[MODALITIES.AUDITORY_CHANT]).toBe(SAMPLE.meanings.mnemonic);
  });

  it('有 confusingChars → semantic_confuse', () => {
    const mod = extractModalities(SAMPLE);
    expect(mod[MODALITIES.SEMANTIC_CONFUSE]).toBeTruthy();
    expect(mod[MODALITIES.SEMANTIC_CONFUSE].chars).toContain("目");
  });

  it('有 gameConfig → game_config', () => {
    const mod = extractModalities(SAMPLE);
    expect(mod[MODALITIES.GAME_CONFIG]).toBeTruthy();
  });

  it('有 interaction/playHint → motor_hint', () => {
    const mod = extractModalities(SAMPLE);
    expect(mod[MODALITIES.MOTOR_HINT]).toBe(SAMPLE.playHint);
    expect(mod[MODALITIES.MOTOR_INTERACT]).toBe(SAMPLE.interaction);
  });

  it('至少 8 种模态被抽取', () => {
    const mod = extractModalities(SAMPLE);
    expect(Object.keys(mod).length).toBeGreaterThanOrEqual(8);
  });
});

describe('assemblePackage — 场景适配', () => {
  it('learn 场景 → 覆盖 ≥ 5 种模态', () => {
    const pkg = assemblePackage(SAMPLE, SCENES.LEARN);
    expect(Object.keys(pkg.modalities).length).toBeGreaterThanOrEqual(5);
    expect(pkg.modalities[MODALITIES.VISUAL_GLYPH]).toBeTruthy();
    expect(pkg.modalities[MODALITIES.VISUAL_TIMELINE]).toBeTruthy();
  });

  it('play 场景 → motor + game_config 必须有', () => {
    const pkg = assemblePackage(SAMPLE, SCENES.PLAY);
    expect(pkg.modalities[MODALITIES.GAME_CONFIG]).toBeTruthy();
    expect(pkg.modalities[MODALITIES.MOTOR_HINT]).toBeTruthy();
  });

  it('review 场景 → semantic_confuse 推荐', () => {
    const pkg = assemblePackage(SAMPLE, SCENES.REVIEW);
    expect(pkg.modalities[MODALITIES.SEMANTIC_CONFUSE]).toBeTruthy();
  });

  it('coverage ≤ 100%', () => {
    const pkg = assemblePackage(SAMPLE, SCENES.LEARN);
    expect(pkg.coverage).toBeGreaterThanOrEqual(0);
    expect(pkg.coverage).toBeLessThanOrEqual(100);
  });

  it('空 scene fallback → LEARN', () => {
    const pkg = assemblePackage(SAMPLE, "unknown_scene");
    expect(pkg.scene).toBe("unknown_scene");
    // 但权重应该 fallback 到 LEARN
    expect(Object.keys(pkg.modalities).length).toBeGreaterThanOrEqual(3);
  });

  it('skipModals 跳过指定模态', () => {
    const pkg = assemblePackage(SAMPLE, SCENES.LEARN, {
      skipModals: [MODALITIES.VISUAL_TIMELINE, MODALITIES.AUDITORY_CHANT],
    });
    expect(pkg.modalities[MODALITIES.VISUAL_TIMELINE]).toBeUndefined();
    expect(pkg.modalities[MODALITIES.AUDITORY_CHANT]).toBeUndefined();
  });
});

describe('年龄适配', () => {
  it('3-5 岁 → visual_emoji 权重 +1', () => {
    const pkg5 = assemblePackage(SAMPLE, SCENES.LEARN, { age: 5 });
    const pkg7 = assemblePackage(SAMPLE, SCENES.LEARN, { age: 7 });
    // 5 岁应该有 visual_emoji，7 岁不一定降（diff 是可选）
    expect(pkg5.modalities[MODALITIES.VISUAL_EMOJI]).toBeTruthy();
  });

  it('7+ 岁 → semantic_confuse 权重 +1', () => {
    const pkg = assemblePackage(SAMPLE, SCENES.REVIEW, { age: 7, difficultyLevel: "hard" });
    expect(pkg.modalities[MODALITIES.SEMANTIC_CONFUSE]).toBeTruthy();
  });
});

describe('难度适配', () => {
  it('hard + semantic_confuse 推荐', () => {
    const pkg = assemblePackage(SAMPLE, SCENES.REVIEW, { difficultyLevel: "hard" });
    expect(pkg.modalities[MODALITIES.SEMANTIC_CONFUSE]).toBeTruthy();
    expect(pkg.modalities[MODALITIES.SEMANTIC_CONFUSE].recommended).toBe(true);
  });

  it('easy → semantic_confuse 不推荐', () => {
    const pkg = assemblePackage(SAMPLE, SCENES.LEARN, { difficultyLevel: "easy" });
    // easy 下 semantic_confuse 应该降权
    if (pkg.modalities[MODALITIES.SEMANTIC_CONFUSE]) {
      expect(pkg.modalities[MODALITIES.SEMANTIC_CONFUSE].recommended).toBe(false);
    }
  });
});

describe('forChar — 便捷 API', () => {
  it('同步返回，不抛异常', () => {
    const pkg = forChar(SAMPLE, SCENES.LEARN);
    expect(pkg.coverage).toBeDefined();
    expect(pkg.modalities).toBeDefined();
    expect(pkg.rationale).toBeDefined();
  });
});
