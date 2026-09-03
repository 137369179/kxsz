/**
 * tests/unit/voiceGuide.test.js
 * ================================================================
 * T16 单元测试：全流程语音引导系统
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { VoiceGuideService } from "../../src/utils/voiceGuide.js";
import { setupTestDom } from "../testDomMock.js";
import { storageManager } from "../../src/utils/storageManager.js";
import { soundAndFX } from "../../src/utils/soundEngine.js";

describe("VoiceGuideService (T16 全流程语音引导)", () => {
  beforeEach(() => {
    setupTestDom();
    storageManager.removeItem("CATHY_VOICE_GUIDANCE_ENABLED");
    vi.clearAllMocks();
  });

  it("默认开启语音引导功能", () => {
    const service = new VoiceGuideService();
    expect(service.isEnabled()).toBe(true);

    service.setEnabled(false);
    expect(service.isEnabled()).toBe(false);
  });

  it("speakGuidance 正确调用 soundAndFX.speakPriority", async () => {
    const service = new VoiceGuideService();
    const spy = vi.spyOn(soundAndFX, "speakPriority").mockImplementation(() => {});

    service.speakGuidance("点击麦克风开始跟读", { debounceMs: 0 });

    await new Promise((r) => setTimeout(r, 20));
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith("点击麦克风开始跟读", expect.objectContaining({ kind: "tutor" }));
  });

  it("2 秒内相同文案自动防抖去重", async () => {
    const service = new VoiceGuideService();
    const spy = vi.spyOn(soundAndFX, "speakPriority").mockImplementation(() => {});

    service.speakGuidance("返回大地图", { debounceMs: 0 });
    await new Promise((r) => setTimeout(r, 20));
    expect(spy).toHaveBeenCalledTimes(1);

    // 立即再次触发相同文案
    service.speakGuidance("返回大地图", { debounceMs: 0 });
    await new Promise((r) => setTimeout(r, 20));
    // 依然只有 1 次调用
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
