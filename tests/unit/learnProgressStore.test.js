import { describe, it, expect, beforeEach } from "vitest";

const mockStore = {};
const mockLocalStorage = {
  getItem: (key) => (key in mockStore ? mockStore[key] : null),
  setItem: (key, val) => { mockStore[key] = String(val); },
  removeItem: (key) => { delete mockStore[key]; },
  clear: () => { Object.keys(mockStore).forEach((k) => delete mockStore[k]); },
};
Object.defineProperty(global, "localStorage", { value: mockLocalStorage, writable: true });

import { storageManager } from "../../src/utils/storageManager.js";
import {
  saveLearnProgress,
  loadLearnProgress,
  clearLearnProgress,
  normalizeLearnProgress,
  learnProgressKey,
} from "../../src/utils/learnProgressStore.js";

describe("learnProgressStore", () => {
  beforeEach(() => {
    Object.keys(mockStore).forEach((k) => delete mockStore[k]);
    if (storageManager._lsSupported === false) storageManager._lsSupported = undefined;
  });

  it("normalizeLearnProgress rejects invalid payloads", () => {
    expect(normalizeLearnProgress(null)).toBeNull();
    expect(normalizeLearnProgress("[object Object]")).toBeNull();
    expect(normalizeLearnProgress({ currentStep: 0, completedSteps: [] })).toBeNull();
    expect(normalizeLearnProgress({ currentStep: 9, completedSteps: [] })).toBeNull();
  });

  it("normalizeLearnProgress accepts valid 1-8 step payloads", () => {
    const n = normalizeLearnProgress({
      charId: "char_test",
      currentStep: 4,
      completedSteps: [1, 2, 3],
    });
    expect(n).toEqual({
      charId: "char_test",
      currentStep: 4,
      completedSteps: [1, 2, 3],
    });
  });

  it("save + load round-trips JSON progress (not [object Object])", () => {
    const ok = saveLearnProgress("char_test", {
      currentStep: 3,
      completedSteps: [1, 2],
    });
    expect(ok).toBe(true);

    const raw = storageManager.getItem(learnProgressKey("char_test"));
    expect(raw).not.toBe("[object Object]");
    expect(() => JSON.parse(raw)).not.toThrow();

    const loaded = loadLearnProgress("char_test");
    expect(loaded.currentStep).toBe(3);
    expect(loaded.completedSteps).toEqual([1, 2]);
  });

  it("clearLearnProgress removes the key", () => {
    saveLearnProgress("char_test", { currentStep: 2, completedSteps: [1] });
    clearLearnProgress("char_test");
    expect(loadLearnProgress("char_test")).toBeNull();
  });
});
