import { describe, it, expect, vi, beforeEach } from "vitest";
import { setupTestDom, createMockElement } from "../testDomMock.js";

setupTestDom();

import { PlayModule } from "../../src/components/PlayModule.js";
import { soundAndFX } from "../../src/utils/soundEngine.js";
import { IDIOMS_DATABASE } from "../../src/data/idioms.js";

describe("PlayModule (凯茜游乐场)", () => {
  let container;

  // SharedShell 把真实内容注入到 .shell-content main slot
  const mainContent = (el) => {
    const main = el.querySelector?.(".shell-content");
    return main && main.innerHTML ? main.innerHTML : el.innerHTML;
  };

  beforeEach(() => {
    container = createMockElement("div", "play-container");
    vi.spyOn(soundAndFX, "stopSpeaking").mockImplementation(() => {});
    vi.spyOn(soundAndFX, "playPop").mockImplementation(() => {});
    vi.spyOn(soundAndFX, "toggleMute").mockReturnValue(false);
    vi.spyOn(soundAndFX, "speakPriority").mockImplementation(() => {});
  });

  it("should initialize with null mode (hub view)", () => {
    const play = new PlayModule(container);
    expect(play.currentMode).toBeNull();
    expect(play._cleanups).toBeDefined();
    expect(Array.isArray(play._cleanups)).toBe(true);
  });

  it("should render hub with arcade heading and game cards", () => {
    const play = new PlayModule(container);
    play.render();

    const html = mainContent(container);
    expect(html.length).toBeGreaterThan(100);
    expect(html).toContain("凯茜游乐场");
    expect(html).toContain("拓展竞技馆");
  });

  it("should dispatch to idiom hall when currentMode is idiom", () => {
    const play = new PlayModule(container);
    play.currentMode = "idiom";
    play.render();

    const html = mainContent(container);
    expect(html.length).toBeGreaterThan(100);
    expect(html).toContain("成语国学微课堂");
    expect(html).toContain("听故事闯关");
  });

  it("should dispatch to poem hall when currentMode is poem", () => {
    const play = new PlayModule(container);
    play.currentMode = "poem";
    play.render();

    const html = mainContent(container);
    expect(html.length).toBeGreaterThan(100);
    // SharedShell 不渲染 heading，但 poem hall 内部必有诗句/古诗关键词
    expect(html).toMatch(/古诗|诗句|品读/);
  });

  it("should render idiom story and quiz without runtime errors", () => {
    const play = new PlayModule(container);
    const sampleIdiom = IDIOMS_DATABASE[0] || {
      name: "画龙点睛",
      pinyin: "huà lóng diǎn jīng",
      meaning: "比喻说话或写文章在关键处点明要旨",
      story: "从前有个画家叫张僧繇...",
      chars: ["画", "龙", "点", "睛"],
      gameQuestion: {
        question: "哪个字是'龙'？",
        options: ["龙", "尤"],
        answer: "龙"
      }
    };

    play._renderIdiomStory(sampleIdiom, [sampleIdiom]);
    expect(container.innerHTML).toContain("成语释义");
    expect(container.innerHTML).toContain(sampleIdiom.meaning || sampleIdiom.desc);

    play._renderIdiomQuiz(sampleIdiom, [sampleIdiom]);
    expect(container.innerHTML).toContain("国学成语小测验");
  });

  it("should invoke stopSpeaking and cleanup listeners on destroy()", () => {
    const play = new PlayModule(container);
    const cleanupSpy = vi.fn();
    play._addCleanup(cleanupSpy);

    play.destroy();
    expect(soundAndFX.stopSpeaking).toHaveBeenCalled();
    expect(cleanupSpy).toHaveBeenCalledTimes(1);
    expect(play._cleanups.length).toBe(0);
  });
});
