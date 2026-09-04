import { describe, it, expect, beforeEach, vi } from "vitest";

// Minimal DOM & Storage mock for Node environment
const mockStorage = new Map();
global.localStorage = {
  getItem: (key) => mockStorage.has(key) ? mockStorage.get(key) : null,
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear()
};
const elementsMap = new Map();

// global RAF / cancelRAF / idle polyfills (memoryLeakDebug uses global cancelAnimationFrame)
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 16);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
globalThis.requestIdleCallback = globalThis.requestIdleCallback || ((cb) => setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 1));
globalThis.cancelIdleCallback = globalThis.cancelIdleCallback || ((id) => clearTimeout(id));

global.window = {
  innerWidth: 1024,
  innerHeight: 768,
  devicePixelRatio: 1,
  requestAnimationFrame: (cb) => setTimeout(cb, 16),
  cancelAnimationFrame: (id) => clearTimeout(id),
  addEventListener: () => {},
  removeEventListener: () => {},
  requestIdleCallback: (cb) => setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 1),
  cancelIdleCallback: (id) => clearTimeout(id)
};

global.document = {
  getElementById: (id) => elementsMap.get(id) || null,
  createElement: (tag) => {
    const el = {
      tagName: tag.toUpperCase(),
      id: "",
      className: "",
      style: {},
      classList: { add: vi.fn(), remove: vi.fn(), contains: () => false, toggle: vi.fn() },
      children: [],
      attributes: {},
      dataset: {},
      setAttribute: function(name, val) { this.attributes[name] = String(val); },
      getAttribute: function(name) { return this.attributes[name]; },
      querySelector: function() { return null; },
      querySelectorAll: function() { return []; },
      appendChild: vi.fn(),
      remove: vi.fn(function() {
        if (this.id) elementsMap.delete(this.id);
      }),
      removeChild: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      innerHTML: "",
      textContent: "",
      onclick: null,
      onmousedown: null,
      getBoundingClientRect: () => ({ left: 100, top: 200, width: 80, height: 40 }),
      parentElement: null,
    };
    return el;
  },
  head: { appendChild: vi.fn() },
  body: {
    appendChild: (el) => {
      if (el && el.id) elementsMap.set(el.id, el);
    }
  },
  querySelector: () => null,
  querySelectorAll: () => []
};

import { ReviewModule } from "../../src/components/ReviewModule.js";
import { showGameToast } from "../../src/components/SharedShell.js";
import { soundAndFX } from "../../src/utils/soundEngine.js";
import { CardModule } from "../../src/components/CardModule.js";
import { BookModule } from "../../src/components/BookModule.js";
import { ParentModule } from "../../src/components/ParentModule.js";
import { TreehouseModule } from "../../src/components/TreehouseModule.js";
import { storageManager } from "../../src/utils/storageManager.js";
import { g2p } from "../../src/utils/g2p.js";
import { POEMS, POEMS_DATABASE } from "../../src/data/poems.js";
import { getTodayWorksheetChars } from "../../src/utils/worksheetGenerator.js";
import { ebbinghausManager } from "../../src/utils/ebbinghaus.js";
import { PKModule } from "../../src/components/PKModule.js";
import { eyeCareManager } from "../../src/utils/eyeCareManager.js";
import { RewardModule } from "../../src/components/RewardModule.js";
import { neuralVoice } from "../../src/utils/neuralVoice.js";
import { CHARACTER_DATABASE } from "../../src/data/characters.js";

describe("Bug Fix Regression Audits", () => {
  let mockContainer;

  beforeEach(() => {
    elementsMap.clear();
    mockContainer = {
      innerHTML: "",
      style: {},
      classList: { add: () => {}, remove: () => {} },
      querySelector: () => mockContainer,
      querySelectorAll: () => [],
      addEventListener: () => {},
      removeEventListener: () => {},
      appendChild: () => {},
      getBoundingClientRect: () => ({ left: 100, top: 200, width: 80, height: 40 }),
      getContext: () => ({ clearRect: () => {}, beginPath: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {}, fill: () => {}, fillText: () => {}, strokeText: () => {}, setLineDash: () => {}, lineWidth: 1, strokeStyle: '#000', fillStyle: '#000', font: '12px sans-serif', save: () => {}, restore: () => {}, translate: () => {}, rotate: () => {}, arc: () => {}, closePath: () => {}, measureText: () => ({ width: 10 }) })
    };
  });

  it("ReviewModule should safely reset queue and currentIndex when re-rendered after completion", () => {
    // P0: queue is learned-only — seed at least one learned char so rebuild is non-empty
    const seedId = CHARACTER_DATABASE[0]?.id || "char_001";
    ebbinghausManager.progress.charRecords = {
      [seedId]: { charId: seedId, masteryRate: 0.4, reviews: 1 },
    };

    const mod = new ReviewModule(mockContainer);
    mod.currentIndex = 5; // simulate completing the queue
    expect(mod.currentIndex).toBe(5);

    // Re-render must not crash and should re-initialize queue
    expect(() => mod.render()).not.toThrow();
    expect(mod.currentIndex).toBe(0);
    expect(mod.queue.length).toBeGreaterThan(0);
  });

  it("showGameToast should support single-string argument without throwing appendChild error", () => {
    expect(() => {
      showGameToast("提示消息测试");
    }).not.toThrow();

    expect(() => {
      showGameToast("危险警告提示", "error");
    }).not.toThrow();
  });

  it("triggerCoinFly should support (container, count) overload and getBoundingClientRect", () => {
    const fakeBtn = {
      getBoundingClientRect: () => ({ left: 200, top: 300, width: 100, height: 50 })
    };

    expect(() => {
      soundAndFX.triggerCoinFly(fakeBtn, 5);
    }).not.toThrow();
  });

  it("CardModule.destroy should remove both modal overlays from DOM", () => {
    const strokeOverlay = document.createElement("div");
    strokeOverlay.id = "stroke-demo-overlay";
    document.body.appendChild(strokeOverlay);

    const slideshowOverlay = document.createElement("div");
    slideshowOverlay.id = "flashcard-slideshow-overlay";
    document.body.appendChild(slideshowOverlay);

    expect(document.getElementById("stroke-demo-overlay")).toBeTruthy();
    expect(document.getElementById("flashcard-slideshow-overlay")).toBeTruthy();

    const mod = new CardModule(mockContainer);
    mod.destroy();

    expect(strokeOverlay.remove).toHaveBeenCalled();
    expect(slideshowOverlay.remove).toHaveBeenCalled();
  });

  it("BookModule.destroy should clean up char popover, catalog drawer, and voice modal overlays", () => {
    const pop = document.createElement("div");
    pop.id = "char-popover-overlay";
    document.body.appendChild(pop);

    const drawer = document.createElement("div");
    drawer.id = "book-catalog-drawer-overlay";
    document.body.appendChild(drawer);

    const voiceModal = document.createElement("div");
    voiceModal.id = "user-voice-modal-overlay";
    document.body.appendChild(voiceModal);

    expect(document.getElementById("char-popover-overlay")).toBeTruthy();
    expect(document.getElementById("book-catalog-drawer-overlay")).toBeTruthy();
    expect(document.getElementById("user-voice-modal-overlay")).toBeTruthy();

    const bookMod = new BookModule(mockContainer);
    bookMod.destroy();

    expect(pop.remove).toHaveBeenCalled();
    expect(drawer.remove).toHaveBeenCalled();
    expect(voiceModal.remove).toHaveBeenCalled();
  });

  it("ParentModule.destroy should remove poster and sync modals", () => {
    const poster = document.createElement("div");
    poster.id = "parent-poster-modal-overlay";
    document.body.appendChild(poster);

    const exp = document.createElement("div");
    exp.id = "parent-sync-export-overlay";
    document.body.appendChild(exp);

    const imp = document.createElement("div");
    imp.id = "parent-sync-import-overlay";
    document.body.appendChild(imp);

    const iframe = document.createElement("iframe");
    iframe.id = "cathy-print-iframe";
    document.body.appendChild(iframe);

    const parentMod = new ParentModule(mockContainer);
    parentMod.destroy();

    expect(poster.remove).toHaveBeenCalled();
    expect(exp.remove).toHaveBeenCalled();
    expect(imp.remove).toHaveBeenCalled();
    expect(iframe.remove).toHaveBeenCalled();
  });

  it("storageManager.getItem should support fallback and clearAllCathyKeys should remove all keys", () => {
    const val = storageManager.getItem("non_existent_key_xyz", "default_val");
    expect(val).toBe("default_val");

    storageManager.setItem("cathy_tree_water_count", "99");
    expect(storageManager.getItem("cathy_tree_water_count")).toBe("99");

    storageManager.clearAllCathyKeys();
    expect(storageManager.getItem("cathy_tree_water_count")).toBeNull();
  });

  it("TreehouseModule constructor should parse integer values safely", () => {
    const tree = new TreehouseModule(mockContainer);
    expect(typeof tree.treeWaterCount).toBe("number");
    expect(typeof tree.cathyHunger).toBe("number");
    expect(isNaN(tree.treeWaterCount)).toBe(false);
    expect(isNaN(tree.cathyHunger)).toBe(false);
  });

  it("g2p.convert should safely handle non-string and empty inputs", () => {
    expect(g2p.convert(null)).toEqual([]);
    expect(g2p.convert(undefined)).toEqual([]);
    expect(g2p.convert("")).toEqual([]);
    expect(() => g2p.convert(123)).not.toThrow();
  });

  it("POEMS and POEMS_DATABASE aliases should be identical", () => {
    expect(POEMS).toBe(POEMS_DATABASE);
    expect(Array.isArray(POEMS)).toBe(true);
    expect(POEMS.length).toBe(20);
  });

  it("getTodayWorksheetChars should correctly handle 1-based currentLevelIndex", () => {
    ebbinghausManager.progress.currentLevelIndex = 1;
    const chars = getTodayWorksheetChars();
    expect(chars.length).toBe(1);
    expect(chars[0].char).toBe(CHARACTER_DATABASE[0].char);
  });

  it("PKModule.playAttackAnimation should resolve safely without throwing when proj.animate is missing", async () => {
    const pk = new PKModule(mockContainer);
    // container with layer
    const mockLayer = document.createElement("div");
    mockContainer.querySelector = (sel) => sel === "#pk-projectile-layer" ? mockLayer : null;

    await expect(pk.playAttackAnimation("player")).resolves.toBeUndefined();
    await expect(pk.playAttackAnimation("boss")).resolves.toBeUndefined();
  });

  it("eyeCareManager.stop should clear restCountdownTimer and remove rest modal from DOM", () => {
    const restModal = document.createElement("div");
    restModal.id = "eye-care-rest-modal";
    document.body.appendChild(restModal);

    eyeCareManager.isRestModalOpen = true;
    eyeCareManager.restCountdownTimer = 12345;

    eyeCareManager.stop();

    expect(restModal.remove).toHaveBeenCalled();
    expect(eyeCareManager.isRestModalOpen).toBe(false);
    expect(eyeCareManager.restCountdownTimer).toBeNull();
  });

  it("soundAndFX._setupVisibilityRecovery should run without errors", () => {
    expect(() => {
      soundAndFX._setupVisibilityRecovery();
    }).not.toThrow();
  });

  it("RewardModule should initialize scrapbook state from storageManager", () => {
    storageManager.putJSON("cathy_scrapbook_stickers_v1", [{ char: "日", pinyin: "rì", x: "30%", y: "40%" }]);
    storageManager.setItem("cathy_scrapbook_bg_v1", "assets/images/cathy_island_space.webp");

    const reward = new RewardModule(mockContainer);
    expect(reward.scrapbookStickers.length).toBe(1);
    expect(reward.scrapbookStickers[0].char).toBe("日");
    expect(reward.scrapbookBg).toBe("assets/images/cathy_island_space.webp");
  });

  it("PKModule.updateHpUI should safely clamp bar percentages even with 0 maxHp", () => {
    const pk = new PKModule(mockContainer);
    const pBar = document.createElement("div");
    pBar.id = "pk-player-hp";
    const bBar = document.createElement("div");
    bBar.id = "pk-boss-hp";
    mockContainer.querySelector = (sel) => {
      if (sel === "#pk-player-hp") return pBar;
      if (sel === "#pk-boss-hp") return bBar;
      return null;
    };

    pk.maxHp = 0;
    pk.playerHp = 50;
    pk.bossHp = -10;
    pk.updateHpUI();

    expect(pBar.style.width).toBe("50%");
    expect(bBar.style.width).toBe("0%");
  });

  it("ebbinghausManager should save and load from activeProfileId key", () => {
    storageManager.setActiveProfileId("profile_test_999");
    ebbinghausManager.progress.coins = 888;
    ebbinghausManager.save();

    const perProfileData = storageManager.getJSON("CATHY_LITERACY_PROGRESS_profile_test_999");
    expect(perProfileData).toBeDefined();
    expect(perProfileData.coins).toBe(888);
  });

  it("ebbinghausManager.incrementTodayLearned should add entry if day is not in studyHistory", () => {
    ebbinghausManager.progress.studyHistory = [];
    ebbinghausManager.progress.todayLearnedCount = 0;
    ebbinghausManager.incrementTodayLearned();

    expect(ebbinghausManager.progress.studyHistory.length).toBe(1);
    expect(ebbinghausManager.progress.studyHistory[0].count).toBe(1);
  });

  it("CanvasRenderingContext2D roundRect polyfill should be operational", () => {
    if (typeof CanvasRenderingContext2D !== "undefined") {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx && typeof ctx.roundRect === "function") {
        expect(() => {
          ctx.beginPath();
          ctx.roundRect(10, 10, 100, 50, 8);
          ctx.stroke();
        }).not.toThrow();
      }
    }
  });

  // ============================================================
  // Round-2 深度排障：5 个真实隐蔽 BUG 修复回归
  // ============================================================

  it("BUG #1: PlaySceneEngine._getRect should return real rect, not infinite-recurse", () => {
    const { PlaySceneEngine } = require("../../src/utils/playSceneEngine.js");
    // 验证核心修复：直接调用 _getRect 不应无限递归
    const fakeEngine = { _rectCache: new WeakMap() };
    const fakeEl = { getBoundingClientRect: () => ({ left: 10, top: 20, width: 100, height: 50, right: 110, bottom: 70 }) };

    // 把 _getRect 拿出来挂到一个最小上下文 (避免完整 mount 触发的 DOM 依赖)
    const fn = PlaySceneEngine.prototype._getRect;
    expect(() => fn.call(fakeEngine, fakeEl)).not.toThrow();
    const rect = fn.call(fakeEngine, fakeEl);
    expect(rect.left).toBe(10);
    expect(rect.width).toBe(100);

    // 再次调用命中缓存，同样不抛
    expect(() => fn.call(fakeEngine, fakeEl)).not.toThrow();

    // null / undefined 输入应安全返回 null (不会进入 getBoundingClientRect)
    expect(fn.call(fakeEngine, null)).toBeNull();
    expect(fn.call(fakeEngine, undefined)).toBeNull();
  });

  it("BUG #2: audioSafety.run_AC_10_scenario must NOT permanently destroy lockParentalLock method", async () => {
    const { audioSafety } = await import("../../src/utils/audioSafety.js");
    storageManager.removeItem("cathy_audio_pin_v1");

    // 跑测试场景
    const result = await audioSafety.run_AC_10_scenario();
    expect(result.ok).toBeDefined();

    // 关键断言：跑完后 lockParentalLock 仍然是实例上的真方法 (不是被覆盖的 () => true)
    expect(typeof audioSafety.lockParentalLock).toBe("function");

    // 验证方法真的能用：再锁一次
    audioSafety.setParentalLock("1234", ["master"]);
    expect(audioSafety.isParentalLocked()).toBe(true);
    const ok = audioSafety.unlockParentalLock("1234");
    expect(ok).toBe(true);
  });

  it("BUG #3: ebbinghausManager.doSignIn should use ISO date key (YYYY-MM-DD), immune to toDateString locale issues", () => {
    ebbinghausManager.progress.signInStreak = 0;
    ebbinghausManager.progress.lastSignInDate = "";
    ebbinghausManager.progress.todaySignedIn = false;
    ebbinghausManager.progress.coins = 100;

    ebbinghausManager.doSignIn();

    // lastSignInDate 必须是 ISO 格式 (YYYY-MM-DD) 而非 toDateString (Thu Sep 03 2026)
    expect(ebbinghausManager.progress.lastSignInDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(ebbinghausManager.progress.todaySignedIn).toBe(true);

    // 第一次签到 streak 必须为 1
    expect(ebbinghausManager.progress.signInStreak).toBe(1);

    // 再次签到（同一天）应早返回不增加 streak
    const beforeStreak = ebbinghausManager.progress.signInStreak;
    ebbinghausManager.doSignIn();
    expect(ebbinghausManager.progress.signInStreak).toBe(beforeStreak);
  });

  it("BUG #3b: ebbinghausManager.doSignIn streak should correctly increment when last sign-in was exactly yesterday", () => {
    // 构造 lastSignInDate 为昨天 (ISO 格式)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    ebbinghausManager.progress.signInStreak = 5;
    ebbinghausManager.progress.lastSignInDate = yKey;
    ebbinghausManager.progress.todaySignedIn = false;

    ebbinghausManager.doSignIn();
    expect(ebbinghausManager.progress.signInStreak).toBe(6);
  });

  it("BUG #4: AudioDebugPanel.unmount should clear drag listener refs and not leak", () => {
    const { audioDebugPanel } = require("../../src/utils/memoryLeakDebug.js");

    // 验证关键字段清理逻辑 (mock 状态而非真实 mount，避免 DOM mock 不全)
    audioDebugPanel.mounted = true;
    audioDebugPanel._root = { remove: vi.fn() };
    audioDebugPanel._onPanelMouseMove = () => {};
    audioDebugPanel._onPanelMouseUp = () => {};
    audioDebugPanel._dragState = { dragging: false, startX: 0, startY: 0, startT: 0, startL: 0 };
    audioDebugPanel._raf = 0;

    // mock window.removeEventListener
    const removed = [];
    const origRemove = window.removeEventListener;
    window.removeEventListener = (evt, fn) => { removed.push({ evt, fn }); };

    audioDebugPanel.unmount();

    expect(audioDebugPanel.mounted).toBe(false);
    expect(audioDebugPanel._onPanelMouseMove).toBeNull();
    expect(audioDebugPanel._onPanelMouseUp).toBeNull();
    expect(audioDebugPanel._dragState).toBeNull();
    expect(audioDebugPanel._root).toBeNull();
    expect(removed.find(r => r.evt === "mousemove")).toBeTruthy();
    expect(removed.find(r => r.evt === "mouseup")).toBeTruthy();

    window.removeEventListener = origRemove;
  });

  it("BUG #5: g2p '过' in V+V context should produce neutral tone (avoid permanent false rule)", () => {
    // 修复前: ctx.nextChar && isVLike(ctx.nextChar) === false  -> 永真 false, 规则永不命中
    // 修复后: ctx.prevChar && isVLike(ctx.prevChar) && (!ctx.nextChar || isVLike(ctx.nextChar)) -> 命中时标轻声
    const tokens = g2p.convert("走过这里");
    // 找出 "过" 的 token
    const guoTok = tokens.find(t => t.char === "过");
    expect(guoTok).toBeDefined();
    // 期望被标为轻声 (toneNum === 0)
    expect(guoTok.toneNum).toBe(0);
    expect(guoTok.sandhi).toBeDefined();

    // 末位 "过" 在动词后也应标轻声
    const tokens2 = g2p.convert("看过");
    const guoTok2 = tokens2.find(t => t.char === "过");
    expect(guoTok2).toBeDefined();
    expect(guoTok2.toneNum).toBe(0);

    // 单独一个 "过" (无动词前缀) 应保留原调 4
    const tokens3 = g2p.convert("过");
    expect(tokens3[0].toneNum).toBe(4);
  });

  it("neuralVoice circuit breaker should trip after 2 failures and skip play with 0 delay", async () => {
    neuralVoice.available = null;
    neuralVoice._consecutiveErrors = 0;

    // 模拟连续 2 次网络或 502 故障
    neuralVoice._recordFailure();
    expect(neuralVoice._consecutiveErrors).toBe(1);
    expect(neuralVoice.available).toBeNull();

    neuralVoice._recordFailure();
    expect(neuralVoice._consecutiveErrors).toBe(2);
    expect(neuralVoice.available).toBe(false);

    // 处于熔断状态下，play 应立即返回 null，无需发起 fetch
    const res = await neuralVoice.play({
      text: "测试熔断快速降级",
      ctx: {},
      dest: {},
    });
    expect(res).toBeNull();
  });

  it("neuralVoice.probe should reject non-voice-server responses", async () => {
    const origFetch = global.fetch;
    try {
      // 模拟本地代理返回 400 Bad Request
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve("Direct IP access is not allowed"),
      });

      neuralVoice.available = null;
      const ok = await neuralVoice.probe(500);
      expect(ok).toBe(false);
      expect(neuralVoice.available).toBe(false);
    } finally {
      global.fetch = origFetch;
    }
  });
});
