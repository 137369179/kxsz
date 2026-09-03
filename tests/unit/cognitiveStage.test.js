import { describe, it, expect } from "vitest";
import {
  resolveCognitiveStage,
  getCognitiveStageData,
  getCognitiveFullRoadmap,
  getSemanticField,
} from "../../src/utils/cognitiveStage.js";

describe("cognitiveStage.js - 汉字认知分层适配引擎 (外部调研建议A)", () => {
  const mockCharWithExplicit = {
    id: "char_bird",
    char: "鸟",
    pinyin: "niǎo",
    radical: "鸟",
    cognitiveStage: {
      preschool: "这是天上的小鸟，张开翅膀在飞翔",
      grade1: "鸟字由鸟字旁组成，为什么带一点？代表眼睛",
      grade2: "鸟和乌是形近字，乌鸦全身黑看不到眼睛，所以乌没有点",
    },
  };

  const mockCharStandard = {
    id: "char_001",
    char: "日",
    pinyin: "rì",
    radical: "日",
    meanings: {
      primary: "古人画一个太阳表示「日」",
      radicalHint: "日字旁，和太阳、光明、时间有关",
      mnemonic: "太阳圆圆的",
    },
    evolution: {
      story: "古人看到的太阳是圆圆的，中间有一个发光的黑子，演变成为日字",
    },
    words: [{ word: "太阳", pinyin: "tài yáng" }, { word: "日子", pinyin: "rì zi" }],
    confusingChars: ["目", "白", "田"],
  };

  it("should resolve cognitive stages by child age correctly", () => {
    expect(resolveCognitiveStage(4)).toBe("preschool");
    expect(resolveCognitiveStage(5)).toBe("preschool");
    expect(resolveCognitiveStage(6)).toBe("preschool");
    expect(resolveCognitiveStage(7)).toBe("grade1");
    expect(resolveCognitiveStage(8)).toBe("grade2");
    expect(resolveCognitiveStage(9)).toBe("grade2");
  });

  it("should prioritize explicit cognitiveStage data if present", () => {
    const pre = getCognitiveStageData(mockCharWithExplicit, 5);
    expect(pre.stage).toBe("preschool");
    expect(pre.text).toBe("这是天上的小鸟，张开翅膀在飞翔");
    expect(pre.badge).toBe("启蒙期");

    const g1 = getCognitiveStageData(mockCharWithExplicit, 7);
    expect(g1.stage).toBe("grade1");
    expect(g1.text).toBe("鸟字由鸟字旁组成，为什么带一点？代表眼睛");
    expect(g1.badge).toBe("衔接期");

    const g2 = getCognitiveStageData(mockCharWithExplicit, 8);
    expect(g2.stage).toBe("grade2");
    expect(g2.text).toContain("形近字");
    expect(g2.badge).toBe("进阶期");
  });

  it("should dynamically derive adaptive stage data when explicit data is omitted", () => {
    // 5岁 (启蒙期)
    const pre = getCognitiveStageData(mockCharStandard, 5);
    expect(pre.stage).toBe("preschool");
    expect(pre.text).toContain("日");
    expect(pre.title).toContain("5-6岁");

    // 7岁 (幼小衔接期)
    const g1 = getCognitiveStageData(mockCharStandard, 7);
    expect(g1.stage).toBe("grade1");
    expect(g1.text).toContain("rì");
    expect(g1.text).toContain("日字旁");

    // 8岁 (进阶期)
    const g2 = getCognitiveStageData(mockCharStandard, 8);
    expect(g2.stage).toBe("grade2");
    expect(g2.text).toContain("形近字辨析");
    expect(g2.text).toContain("目");
  });

  it("should generate full 3-stage roadmap for parent overview", () => {
    const roadmap = getCognitiveFullRoadmap(mockCharStandard);
    expect(roadmap.preschool).toBeDefined();
    expect(roadmap.grade1).toBeDefined();
    expect(roadmap.grade2).toBeDefined();
    expect(roadmap.preschool.stage).toBe("preschool");
    expect(roadmap.grade1.stage).toBe("grade1");
    expect(roadmap.grade2.stage).toBe("grade2");
  });

  it("should accurately categorize semantic fields by radical and content", () => {
    expect(getSemanticField({ radical: "日" })).toBe("天文与大自然");
    expect(getSemanticField({ radical: "水" })).toBe("天文与大自然");
    expect(getSemanticField({ radical: "木" })).toBe("动植物与生灵");
    expect(getSemanticField({ radical: "鸟" })).toBe("动植物与生灵");
    expect(getSemanticField({ radical: "口" })).toBe("人体与感官");
    expect(getSemanticField({ radical: "走" })).toBe("动作与探索");
    expect(getSemanticField({ radical: "门" })).toBe("生活与日常");
  });

  it("should generate embodied cognition actionPrompt for preschool stage (建议C)", () => {
    const pre = getCognitiveStageData(mockCharStandard, 5);
    expect(pre.actionPrompt).toBeDefined();
    expect(pre.actionPrompt).toContain("太阳");

    const birdStage = getCognitiveStageData(mockCharWithExplicit, 6);
    expect(birdStage.actionPrompt).toContain("翅膀");

    const g1 = getCognitiveStageData(mockCharStandard, 7);
    expect(g1.actionPrompt).toBe("");
  });

  it("should never contain emoji in returned text or action prompt", () => {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    const roadmap = getCognitiveFullRoadmap(mockCharStandard);
    expect(emojiRegex.test(roadmap.preschool.text)).toBe(false);
    expect(emojiRegex.test(roadmap.preschool.actionPrompt)).toBe(false);
    expect(emojiRegex.test(roadmap.grade1.text)).toBe(false);
    expect(emojiRegex.test(roadmap.grade2.text)).toBe(false);
  });
});
