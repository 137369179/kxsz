/**
 * tests/unit/microReviewScheduler.test.js
 * ================================================================
 * 微复习调度器单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  startMicroScheduler,
  stopMicroScheduler,
  resetMicroTimer,
  triggerMicroReview,
  dismissMicroReview,
  snoozeMicroReview,
  getMicroReviewStatus,
  getMicroReviewStats,
  MICRO_EVENTS,
  _resetMicroState,
} from '../../src/utils/microReviewScheduler.js'
import { eventBus } from '../../src/utils/eventBus.js'

describe('MicroReviewScheduler', () => {

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-03T10:00:00'));
    _resetMicroState();
  });

  afterEach(() => {
    stopMicroScheduler();
    vi.useRealTimers();
  });

  // ── 基础状态 ──────────────────────────────────────────────

  it('默认状态 enabled=false（需要 startMicroScheduler 启用）', () => {
    // _resetMicroState() 初始化为 enabled=false
    const status = getMicroReviewStatus();
    expect(status.enabled).toBe(false);
  });

  it('startMicroScheduler({}) 默认启用（enabled=true）', () => {
    startMicroScheduler({});
    expect(getMicroReviewStatus().enabled).toBe(true);
  });

  it('disabled 时 enabled=false', () => {
    startMicroScheduler({ enabled: false });
    const status = getMicroReviewStatus();
    expect(status.enabled).toBe(false);
  });

  it('stopMicroScheduler 后 enabled=false', () => {
    startMicroScheduler({});
    stopMicroScheduler();
    expect(getMicroReviewStatus().enabled).toBe(false);
  });

  // ── resetMicroTimer ─────────────────────────────────────

  it('resetMicroTimer 重置计时', () => {
    vi.advanceTimersByTime(5 * 60 * 1000); // 5 min
    resetMicroTimer();
    vi.advanceTimersByTime(5 * 60 * 1000); // +5 min = 10 min total
    const status = getMicroReviewStatus();
    expect(status.next20Min).toBeGreaterThan(0);
  });

  // ── triggerMicroReview ─────────────────────────────────

  it('triggerMicroReview 返回正确结构', () => {
    startMicroScheduler({});
    vi.advanceTimersByTime(25 * 60 * 1000);
    const result = triggerMicroReview(['字001', '字002', '字003']);
    expect(result.is20Min).toBe(true);
    expect(result.charIds).toHaveLength(3);
    expect(typeof result.triggeredAt).toBe('number');
  });

  it('triggerMicroReview 增加计数', () => {
    startMicroScheduler({});
    triggerMicroReview(['字001']);
    const stats = getMicroReviewStats();
    expect(stats.microCount20).toBe(1);
  });

  it('连续调用 triggerMicroReview 间隔加长', () => {
    startMicroScheduler({});
    triggerMicroReview(['字001']);
    vi.advanceTimersByTime(1 * 60 * 1000);
    triggerMicroReview(['字002']);
    const stats = getMicroReviewStats();
    expect(stats.microCount20).toBe(2);
  });

  // ── dismissMicroReview ─────────────────────────────────

  it('dismissMicroReview 不增加计数', () => {
    startMicroScheduler({});
    dismissMicroReview();
    expect(getMicroReviewStats().totalMicroReviews).toBe(0);
  });

  // ── snoozeMicroReview ─────────────────────────────────

  it('snoozeMicroReview 延迟触发', () => {
    startMicroScheduler({});
    vi.advanceTimersByTime(21 * 60 * 1000); // 21min → 应该触发
    const status1 = getMicroReviewStatus();
    snoozeMicroReview();
    const status2 = getMicroReviewStatus();
    expect(status2.snoozed).toBe(true);
  });

  // ── 计时精度 ───────────────────────────────────────────

  it('sessionMinutes 随时间递增', () => {
    startMicroScheduler({});
    vi.advanceTimersByTime(10 * 60 * 1000);
    expect(getMicroReviewStatus().sessionMinutes).toBe(10);
    vi.advanceTimersByTime(10 * 60 * 1000);
    expect(getMicroReviewStatus().sessionMinutes).toBe(20);
  });

  it('next20Min 随时间递减', () => {
    startMicroScheduler({});
    vi.advanceTimersByTime(5 * 60 * 1000);
    const status = getMicroReviewStatus();
    expect(status.next20Min).toBe(15);
  });

  // ── 跨天重置 ──────────────────────────────────────────

  it('新的一天重置计数', () => {
    startMicroScheduler({});
    triggerMicroReview(['字001']);
    vi.setSystemTime(new Date('2026-09-04T00:00:01'));
    const stats = getMicroReviewStats();
    expect(stats.microCount20).toBe(0);
    expect(stats.microCount60).toBe(0);
  });

  // ── MICRO_EVENTS 常量存在 ──────────────────────────────

  it('MICRO_EVENTS 包含所有必要事件', () => {
    expect(MICRO_EVENTS.TRIGGER).toBe('microReview:trigger');
    expect(MICRO_EVENTS.DISMISS).toBe('microReview:dismiss');
    expect(MICRO_EVENTS.SNOOZE).toBe('microReview:snooze');
    expect(MICRO_EVENTS.RESET).toBe('microReview:reset');
  });
});
