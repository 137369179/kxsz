import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { stripEmoji, hasEmoji } from "../../src/utils/stripEmoji.js";

const root = path.resolve(__dirname, "../..");
const EMOJI_RE =
  /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/u;

const CHROME_FILES = [
  "src/components/MapModule.js",
  "src/components/ParentModule.js",
  "src/components/BookModule.js",
  "src/utils/mapHub/mapRender.js",
  "src/utils/mapHub/mapEvents.js",
  "src/utils/mapHub/islandConfig.js",
  "src/utils/parentHub/parentGateUI.js",
  "src/utils/parentHub/parentDashboardEvents.js",
  "src/utils/bookHub/bookShelf.js",
  "src/utils/bookHub/bookReader.js",
  "src/components/ReviewModule.js",
  "src/utils/rewardHub/rewardViews.js",
  "src/utils/parentHub/parentTabs.js",
  "src/utils/reviewHub/interleaveView.js",
  "src/utils/reviewHub/mistakeAssault.js",
  "src/utils/playHub/wordExpedition.js",
  "src/utils/morphEngine.js",
  "src/utils/etymologyEngine.js",
  "src/data/radicalFamilies.js",
];

describe("stripEmoji helper", () => {
  it("removes pictographs while keeping Chinese copy", () => {
    expect(stripEmoji("按住 🌞，向上托起")).toBe("按住 ，向上托起");
    expect(hasEmoji("太阳")).toBe(false);
    expect(hasEmoji("🌞")).toBe(true);
  });
});

describe("UI chrome modules: zero Unicode emoji", () => {
  it("shell + hub chrome sources contain no emoji", () => {
    for (const rel of CHROME_FILES) {
      const content = fs.readFileSync(path.join(root, rel), "utf8");
      expect(EMOJI_RE.test(content), rel).toBe(false);
    }
  });
});
