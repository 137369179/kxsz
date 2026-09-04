/**
 * tests/unit/soundEngineQueue.test.js
 * ================================================================
 * 声音状态机与音频并发重叠/抢占防抖专项测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { soundAndFX, PrioritySpeechQueue, SpeechQueueItem } from "../../src/utils/soundEngine.js";
import { neuralVoice } from "../../src/utils/neuralVoice.js";
import { voiceGuide } from "../../src/utils/voiceGuide.js";
import { PinyinModule } from "../../src/components/PinyinModule.js";
import { setupTestDom } from "../testDomMock.js";

describe("Sound Engine Speech Queue & Audio Concurrency Fixes", () => {
  let psq;

  beforeEach(() => {
    setupTestDom();
    psq = new PrioritySpeechQueue(() => {});
  });

  afterEach(() => {
    psq.cancelAll();
    vi.restoreAllMocks();
  });

  it("当高优先级语音抢占低优先级语音时，低优先级完成回调不会将当前高优先级 current 误置为空", async () => {
    let lowResolve;
    const lowPromise = new Promise((resolve) => {
      lowResolve = resolve;
    });

    const lowItem = new SpeechQueueItem({
      kind: "tutor",
      priority: 3,
      text: "正在朗读的低优先级导师语音",
      utteranceFactory: () => ({
        cancel: vi.fn(),
        onEndPromise: lowPromise,
      }),
    });

    // 播放低优先级
    psq.enqueue(lowItem);
    expect(psq.current).toBe(lowItem);

    // 用户交互高优先级单字点击（kind: char, priority: 1）
    let highResolve;
    const highPromise = new Promise((resolve) => {
      highResolve = resolve;
    });
    const highItem = new SpeechQueueItem({
      kind: "char",
      priority: 1,
      text: "人",
      utteranceFactory: () => ({
        cancel: vi.fn(),
        onEndPromise: highPromise,
      }),
    });

    // 抢占进入
    psq.enqueue(highItem);
    expect(psq.current).toBe(highItem);

    // 此时低优先级由于被中断，其底层 Promise 异步完成回调触发
    lowResolve({ interrupted: true });
    await Promise.resolve();

    // 关键断言：psq.current 必须依然是 highItem，绝不能被误置为 null！
    expect(psq.current).toBe(highItem);
    expect(psq.queue.length).toBe(0);

    // 高优先级完成
    highResolve({ interrupted: false });
    await Promise.resolve();
    expect(psq.current).toBeNull();
  });

  it("stopSpeaking 联动停止 neuralVoice 的所有活动音轨", () => {
    const stopAllSpy = vi.spyOn(neuralVoice, "stopAll").mockImplementation(() => {});
    const cancelAllSpy = vi.spyOn(soundAndFX.speechQueue, "cancelAll");

    soundAndFX.stopSpeaking();

    expect(stopAllSpy).toHaveBeenCalled();
    expect(cancelAllSpy).toHaveBeenCalled();
  });

  it("playPop 具有 40ms 防抖节流，防快速狂点导致音效重叠撕裂", () => {
    const toneSpy = vi.spyOn(soundAndFX, "_tone").mockImplementation(() => {});
    soundAndFX._lastPopTime = 0;

    soundAndFX.playPop();
    expect(toneSpy).toHaveBeenCalledTimes(1);

    // 5ms 内立即再次点击，应被节流拦截
    soundAndFX.playPop();
    expect(toneSpy).toHaveBeenCalledTimes(1);
  });

  it("voiceGuide 在按钮被点击时立即取消待播放的悬浮引导，避免音频撞车", () => {
    const cancelSpy = vi.spyOn(voiceGuide, "cancelGuidance");
    const container = document.createElement("div");
    const btn = document.createElement("button");
    btn.setAttribute("data-voice-hint", "教学引导");
    btn.dataset.voiceHint = "教学引导";
    container.appendChild(btn);
    document.body.appendChild(container);

    voiceGuide.attach(container);
    btn.click();
    expect(cancelSpy).toHaveBeenCalled();

    container.remove();
  });

  it("拼音岛声调大挑战正确绑定重听发音与答题选项并触发对应音效", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const mod = new PinyinModule(container);
    mod.currentTab = "coaster";
    mod.startToneQuiz();

    const mockMain = document.createElement("div");
    const replayBtn = document.createElement("button");
    replayBtn.id = "btn-play-tone-sound";
    replayBtn.dataset.sound = "mā";
    mockMain.appendChild(replayBtn);

    const optBtn = document.createElement("button");
    optBtn.className = "btn-tone-quiz-opt";
    optBtn.dataset.val = "1";
    mockMain.appendChild(optBtn);

    mod._bindEvents(mockMain);

    const speakSpy = vi.spyOn(soundAndFX, "speakPriority").mockImplementation(() => {});
    replayBtn.click();
    expect(speakSpy).toHaveBeenCalledWith("mā", expect.objectContaining({ kind: "pinyin" }));

    const successSpy = vi.spyOn(soundAndFX, "playSuccess").mockImplementation(() => {});
    const errorSpy = vi.spyOn(soundAndFX, "playSoftError").mockImplementation(() => {});

    optBtn.click();
    expect(mod.toneQuizLastResult).not.toBeNull();
    expect(successSpy.mock.calls.length + errorSpy.mock.calls.length).toBeGreaterThan(0);

    mod.destroy();
    container.remove();
  });

  it("playCoinClink 具有 80ms 防抖节流，防止连续金币飞行导致金属音爆音", () => {
    const toneSpy = vi.spyOn(soundAndFX, "_tone").mockImplementation(() => {});
    soundAndFX._lastCoinClinkTime = 0;

    soundAndFX.playCoinClink();
    expect(toneSpy).toHaveBeenCalledTimes(2);

    // 10ms 内再次触发被节流拦截
    soundAndFX.playCoinClink();
    expect(toneSpy).toHaveBeenCalledTimes(2);
  });

  it("当 AudioContext 处于挂起状态时，_tone 触发主动 resume", () => {
    const resumeMock = vi.fn().mockReturnValue(Promise.resolve());
    soundAndFX.audioCtx = {
      state: "suspended",
      resume: resumeMock,
      currentTime: 10,
      createOscillator: () => ({
        frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      }),
      createGain: () => ({
        gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
      }),
    };

    soundAndFX._tone({ from: 440, dur: 0.1 });
    expect(resumeMock).toHaveBeenCalled();
  });

  it("pinyin 类型的语音具有正确的优先级与音频总线路由", () => {
    expect(soundAndFX._priorityForKind("pinyin")).toBe(3);
    soundAndFX.init();
    expect(soundAndFX._voiceGainForKind("pinyin")).toBe(soundAndFX.voiceCharGain);
  });

  it("playStrokeSound 在 AudioContext 挂起时自动调用 resume 唤醒上下文", () => {
    const resumeMock = vi.fn().mockReturnValue(Promise.resolve());
    soundAndFX.audioCtx = {
      state: "suspended",
      resume: resumeMock,
      currentTime: 10,
      sampleRate: 44100,
      createBuffer: () => ({
        getChannelData: () => new Float32Array(100),
      }),
      createBufferSource: () => ({
        buffer: null,
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      }),
      createBiquadFilter: () => ({
        type: "lowpass",
        frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
      }),
      createGain: () => ({
        gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
      }),
    };

    soundAndFX.playStrokeSound(0);
    expect(resumeMock).toHaveBeenCalled();
  });

  it("pinyin 作为交互点击能即时抢占正在朗读的陈述性导师导语", () => {
    let tutorResolve;
    const tutorPromise = new Promise((resolve) => {
      tutorResolve = resolve;
    });

    const tutorItem = new SpeechQueueItem({
      kind: "tutorial",
      priority: 1,
      text: "欢迎来到拼音岛，请点击发音卡片",
      utteranceFactory: () => ({
        cancel: vi.fn(),
        onEndPromise: tutorPromise,
      }),
    });

    psq.enqueue(tutorItem);
    expect(psq.current).toBe(tutorItem);

    const pinyinItem = new SpeechQueueItem({
      kind: "pinyin",
      priority: 3,
      text: "b",
      utteranceFactory: () => ({
        cancel: vi.fn(),
        onEndPromise: Promise.resolve({ interrupted: false }),
      }),
    });

    // 交互点击进入，应抢占 tutorial
    psq.enqueue(pinyinItem);
    expect(psq.current).toBe(pinyinItem);
  });
});

