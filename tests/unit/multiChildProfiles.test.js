// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { storageManager } from "../../src/utils/storageManager.js";
import { ebbinghausManager } from "../../src/utils/ebbinghaus.js";
import { eventBus, EVENTS } from "../../src/utils/eventBus.js";
import { planDailySession, setDeps } from "../../src/utils/sessionPlanner.js";
import { CHARACTER_DATABASE } from "../../src/data/characters.js";
import { getQuestWorksheetChars } from "../../src/utils/worksheetGenerator.js";

describe("Multi-Child Profile Isolation & Sleep Consolidation Integration", () => {
  beforeEach(() => {
    storageManager.clearAllCathyKeys();
    storageManager.removeItem("CATHY_PROFILES_LIST");
    storageManager.removeItem("CATHY_ACTIVE_PROFILE_ID");
    storageManager.removeItem("CATHY_LITERACY_PROGRESS_child_1");
    storageManager.removeItem("CATHY_LITERACY_PROGRESS_child_2");
    storageManager.removeItem("CATHY_LITERACY_USER_PROGRESS_V1");
    ebbinghausManager.progress = ebbinghausManager.loadProgress();
    setDeps({ ebbinghaus: ebbinghausManager, characterDB: CHARACTER_DATABASE });
  });

  it("should provide default profiles with clean Chinese names", () => {
    const profiles = storageManager.listProfiles();
    expect(profiles.length).toBeGreaterThanOrEqual(2);
    expect(profiles[0].name).toContain("大宝");
    expect(profiles[1].name).toContain("二宝");
  });

  it("should rename a profile correctly", () => {
    const ok = storageManager.renameProfile("child_1", "晨晨");
    expect(ok).toBe(true);
    const updated = storageManager.listProfiles();
    expect(updated.find(p => p.id === "child_1")?.name).toBe("晨晨");
  });

  it("should delete a profile but protect the last remaining profile", () => {
    const list = storageManager.listProfiles();
    expect(list.length).toBe(2);

    const ok1 = storageManager.deleteProfile("child_2");
    expect(ok1).toBe(true);
    expect(storageManager.listProfiles().length).toBe(1);

    // Attempt to delete the only remaining profile should fail
    const ok2 = storageManager.deleteProfile("child_1");
    expect(ok2).toBe(false);
    expect(storageManager.listProfiles().length).toBe(1);
  });

  it("should completely isolate progress when switching between children", () => {
    // 1. 大宝学习并获得金币和生字掌握
    ebbinghausManager.switchProfile("child_1");
    ebbinghausManager.progress.coins = 999;
    ebbinghausManager.progress.charRecords["char_1"] = {
      id: "char_1",
      masteryRate: 100,
      reps: 5,
      lastInterval: 5
    };
    ebbinghausManager.save();

    expect(ebbinghausManager.progress.coins).toBe(999);
    expect(ebbinghausManager.progress.charRecords["char_1"]).toBeDefined();

    // 2. 切换到二宝 (尚未初始化的新档案)
    ebbinghausManager.switchProfile("child_2");

    // 二宝必须从全新的默认状态开始（60金币，0已学字），绝不继承大宝的 999 金币与 char_1
    expect(ebbinghausManager.progress.coins).toBe(60);
    expect(ebbinghausManager.progress.charRecords["char_1"]).toBeUndefined();

    // 3. 二宝学习新字
    ebbinghausManager.progress.coins = 120;
    ebbinghausManager.progress.charRecords["char_2"] = {
      id: "char_2",
      masteryRate: 80,
      reps: 1
    };
    ebbinghausManager.save();

    // 4. 切回大宝，大宝数据完整保留，且不受二宝影响
    ebbinghausManager.switchProfile("child_1");
    expect(ebbinghausManager.progress.coins).toBe(999);
    expect(ebbinghausManager.progress.charRecords["char_1"]).toBeDefined();
    expect(ebbinghausManager.progress.charRecords["char_2"]).toBeUndefined();
  });

  it("switchProfile should emit PROGRESS_CHANGED with { progress: this.progress } payload", () => {
    let receivedPayload = null;
    const off = eventBus.on(EVENTS.PROGRESS_CHANGED, (data) => {
      receivedPayload = data;
    });

    ebbinghausManager.switchProfile("child_1");
    off();

    expect(receivedPayload).toBeTruthy();
    expect(receivedPayload.progress).toBeDefined();
    expect(receivedPayload.progress.coins).toBeDefined();
  });

  it("sessionPlanner should prioritize overnight consolidation characters in review pool", () => {
    ebbinghausManager.switchProfile("child_1");
    const now = Date.now();
    // 模拟一个 20 小时前初次学过、尚未复习的生字（符合 12~36h 隔夜巩固窗口）
    ebbinghausManager.progress.charRecords["char_r1"] = {
      id: "char_r1",
      learnedAt: now - 20 * 3600 * 1000,
      reviewCount: 0,
      masteryRate: 70
    };
    ebbinghausManager.save();

    setDeps({ ebbinghaus: ebbinghausManager, characterDB: CHARACTER_DATABASE });

    const session = planDailySession({ age: 6 });
    expect(session).toBeDefined();
    expect(session.reviews.length).toBeGreaterThan(0);

    const overnightItem = session.reviews.find(r => r.id === "char_r1");
    expect(overnightItem).toBeDefined();
    expect(overnightItem.source).toBe("overnight");
  });

  it("getQuestWorksheetChars should return worksheet characters from session planner", () => {
    const chars = getQuestWorksheetChars();
    expect(Array.isArray(chars)).toBe(true);
    expect(chars.length).toBeGreaterThan(0);
    expect(chars[0].char).toBeDefined();
  });
});
