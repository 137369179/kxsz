import { describe, it, expect } from "vitest";
import { buildInterleavePack } from "../../src/utils/reviewHub/interleavePack.js";

const DB = [
  { id: "a", char: "日", confusingChars: ["目", "白"], confusingHint: "日中间有横" },
  { id: "b", char: "目", confusingChars: ["日"], confusingHint: "目多一横" },
  { id: "c", char: "白", confusingChars: ["日"], confusingHint: "" },
  { id: "d", char: "未学", confusingChars: ["日"], confusingHint: "" },
];

describe("buildInterleavePack", () => {
  it("requires learned target and at least one learned distractor", () => {
    const pack = buildInterleavePack({
      chars: DB,
      learnedIds: new Set(["a", "b"]),
      errorProfiles: {},
      limit: 4,
    });
    expect(pack.length).toBeGreaterThan(0);
    for (const q of pack) {
      expect(["a", "b"]).toContain(q.targetId);
      expect(q.options).toContain(q.targetChar);
      expect(q.options.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("returns empty when fewer than 2 learned among confuse graph", () => {
    const pack = buildInterleavePack({
      chars: DB,
      learnedIds: new Set(["a"]),
      errorProfiles: {},
      limit: 4,
    });
    expect(pack).toEqual([]);
  });

  it("switches target at least twice across pack when possible", () => {
    const pack = buildInterleavePack({
      chars: DB,
      learnedIds: new Set(["a", "b", "c"]),
      errorProfiles: {},
      limit: 6,
    });
    const targets = pack.map((q) => q.targetId);
    expect(new Set(targets).size).toBeGreaterThanOrEqual(2);
  });

  it("keeps targetChar in options when confuse set has 5+ learned chars", () => {
    const wide = [
      { id: "t", char: "木", confusingChars: ["本", "未", "末", "术", "禾"], confusingHint: "" },
      { id: "1", char: "本", confusingChars: ["木"], confusingHint: "" },
      { id: "2", char: "未", confusingChars: ["木"], confusingHint: "" },
      { id: "3", char: "末", confusingChars: ["木"], confusingHint: "" },
      { id: "4", char: "术", confusingChars: ["木"], confusingHint: "" },
      { id: "5", char: "禾", confusingChars: ["木"], confusingHint: "" },
    ];
    const learnedIds = new Set(wide.map((c) => c.id));
    const pack = buildInterleavePack({
      chars: wide,
      learnedIds,
      errorProfiles: {},
      limit: 8,
    });
    expect(pack.length).toBeGreaterThan(0);
    for (const q of pack) {
      expect(q.options).toContain(q.targetChar);
      expect(q.options.length).toBeLessThanOrEqual(4);
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });
});
