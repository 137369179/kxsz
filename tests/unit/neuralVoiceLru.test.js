import { describe, it, expect, beforeEach } from "vitest";
import { neuralVoice } from "../../src/utils/neuralVoice.js";

describe("neuralVoice LRU eviction", () => {
  beforeEach(() => {
    neuralVoice._mem.clear();
    neuralVoice._memMax = 3;
  });

  it("evicts least-recently-used entry, not FIFO insertion order", () => {
    neuralVoice._mem.set("a", { buffer: {}, lastUsed: 100 });
    neuralVoice._mem.set("b", { buffer: {}, lastUsed: 200 });
    neuralVoice._mem.set("c", { buffer: {}, lastUsed: 300 });

    // Touch "a" so it becomes hottest; "b" stays coldest among survivors after insert
    neuralVoice._mem.get("a").lastUsed = 400;

    neuralVoice._mem.set("d", { buffer: {}, lastUsed: 500 });
    neuralVoice._evictIfNeeded();

    expect(neuralVoice._mem.has("a")).toBe(true);
    expect(neuralVoice._mem.has("b")).toBe(false);
    expect(neuralVoice._mem.has("c")).toBe(true);
    expect(neuralVoice._mem.has("d")).toBe(true);
    expect(neuralVoice._mem.size).toBe(3);
  });
});
