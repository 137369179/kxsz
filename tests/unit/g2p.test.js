import { describe, it, expect } from "vitest";
import { g2p, HanziG2P } from "../../src/utils/g2p.js";

describe("HanziG2P Engine", () => {
  it("should instantiate correctly", () => {
    expect(g2p).toBeInstanceOf(HanziG2P);
  });

  it("should convert single character to pinyin token", () => {
    const tokens = g2p.convert("日");
    expect(tokens.length).toBe(1);
    expect(tokens[0].char).toBe("日");
    expect(tokens[0].toneNum).toBe(4);
    expect(tokens[0].pinyinMarked).toBe("rì");
  });

  it("should handle 3-3 Tone Sandhi (三声连读变调: 你好 -> ní hǎo)", () => {
    const tokens = g2p.convert("你好");
    expect(tokens.length).toBe(2);
    // 第一字从 3声 变为 2声
    expect(tokens[0].char).toBe("你");
    expect(tokens[0].originalTone).toBe(3);
    expect(tokens[0].toneNum).toBe(2);
    expect(tokens[0].pinyinMarked).toBe("ní");
    expect(tokens[0].sandhi).toBe("332");

    // 第二字保持 3声
    expect(tokens[1].char).toBe("好");
    expect(tokens[1].toneNum).toBe(3);
  });

  it("should handle '一' (yī) Sandhi rules", () => {
    // 遇到四声变二声: 一定 -> yí dìng
    const t1 = g2p.convert("一定");
    expect(t1[0].char).toBe("一");
    expect(t1[0].toneNum).toBe(2);
    expect(t1[0].pinyinMarked).toBe("yí");

    // 遇到非四声变四声: 一天 -> yì tiān
    const t2 = g2p.convert("一天");
    expect(t2[0].char).toBe("一");
    expect(t2[0].toneNum).toBe(4);
    expect(t2[0].pinyinMarked).toBe("yì");
  });

  it("should handle '不' (bù) Sandhi rules", () => {
    // 遇到四声变二声: 不是 -> bú shì
    const t1 = g2p.convert("不是");
    expect(t1[0].char).toBe("不");
    expect(t1[0].toneNum).toBe(2);
    expect(t1[0].pinyinMarked).toBe("bú");

    // 遇到非四声保持四声: 不好 -> bù hǎo
    const t2 = g2p.convert("不好");
    expect(t2[0].char).toBe("不");
    expect(t2[0].toneNum).toBe(4);
    expect(t2[0].pinyinMarked).toBe("bù");
  });

  it("should handle punctuation and output formatted string", () => {
    const tokens = g2p.convert("日月，山水。");
    expect(tokens.length).toBe(6);
    const marked = g2p.toMarkedString(tokens);
    expect(marked).toContain("，");
    expect(marked).toContain("。");
  });
});
