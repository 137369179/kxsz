import { describe, it, expect } from "vitest";
import {
  PINYIN_DICT,
  PINYIN_INITIALS,
  PINYIN_FINALS,
  PINYIN_OVERALL_READINGS,
  PINYIN_TONES
} from "../../src/data/pinyinData.js";

describe("Pinyin Standard Tables & Phonetics Database", () => {
  it("should have 2000+ characters in PINYIN_DICT", () => {
    const keys = Object.keys(PINYIN_DICT);
    expect(keys.length).toBeGreaterThanOrEqual(2000);
    expect(PINYIN_DICT["日"]).toBeDefined();
    expect(PINYIN_DICT["日"][0]).toBe("rì");
    expect(PINYIN_DICT["日"][1]).toBe(4);
  });

  it("should define exactly 23 standard initials (声母)", () => {
    expect(PINYIN_INITIALS.length).toBe(23);
    const pinyinList = PINYIN_INITIALS.map(i => i.pinyin);
    expect(pinyinList).toContain("b");
    expect(pinyinList).toContain("zh");
    expect(pinyinList).toContain("y");
    expect(pinyinList).toContain("w");
  });

  it("should define exactly 24 standard finals (韵母)", () => {
    expect(PINYIN_FINALS.length).toBe(24);
    const simpleFinals = PINYIN_FINALS.filter(f => f.category === "simple");
    expect(simpleFinals.length).toBe(6); // a, o, e, i, u, ü

    const compoundFinals = PINYIN_FINALS.filter(f => f.category === "compound");
    expect(compoundFinals.length).toBe(8); // ai, ei, ui, ao, ou, iu, ie, üe

    const specialFinals = PINYIN_FINALS.filter(f => f.category === "special");
    expect(specialFinals.length).toBe(1); // er

    const frontNasal = PINYIN_FINALS.filter(f => f.category === "front_nasal");
    expect(frontNasal.length).toBe(5); // an, en, in, un, ün

    const backNasal = PINYIN_FINALS.filter(f => f.category === "back_nasal");
    expect(backNasal.length).toBe(4); // ang, eng, ing, ong
  });

  it("should define exactly 16 overall readings (整体认读音节)", () => {
    expect(PINYIN_OVERALL_READINGS.length).toBe(16);
    expect(PINYIN_OVERALL_READINGS).toContain("zhi");
    expect(PINYIN_OVERALL_READINGS).toContain("yi");
    expect(PINYIN_OVERALL_READINGS).toContain("yue");
    expect(PINYIN_OVERALL_READINGS).toContain("yuan");
  });

  it("should define 4 tones with mnemonics", () => {
    expect(PINYIN_TONES.length).toBe(4);
    expect(PINYIN_TONES[0].name).toContain("平");
    expect(PINYIN_TONES[3].name).toContain("降");
  });
});
