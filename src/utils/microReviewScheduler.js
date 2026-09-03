/**
 * src/utils/microReviewScheduler.js
 * ================================================================
 * 微复习调度器 — 每 20 分钟/1 小时触发轻量级复习提示
 * ─────────────────────────────────────────────────────────────
 * 触发时机（E8 需求）：
 *   - 20 分钟微复习：连续学习 20 分钟后（未做间隔复习）
 *   - 1 小时微复习：连续学习 60 分钟后（未做间隔复习）
 *
 * 复习内容：当天新学的 3~5 个汉字（随机抽取 3 个）
 * 展示方式：弹窗或 Banner（由调用方控制）
 *
 * 事件：
 *   - microReview:20min   →  触发 20 分钟微复习
 *   - microReview:60min   →  触发 60 分钟微复习
 *   - microReview:dismiss  →  用户关闭微复习弹窗
 * ─────────────────────────────────────────────────────────────
 */

import { eventBus } from "./eventBus.js";

export const MICRO_EVENTS = {
  READY: "microReview:ready",    // 微复习可用（20min 计时到期）
  TRIGGER: "microReview:trigger", // 触发微复习弹窗
  DISMISS: "microReview:dismiss", // 用户关闭
  SKIP: "microReview:skip",      // 用户跳过
  SNOOZE: "microReview:snooze",  // 稍后提醒
  RESET: "microReview:reset",     // 重置计时器（学新字时）
};

// 内部状态（可被测试重置）
let _state = {
  enabled: false,
  sessionStart: null,       // 本次学习会话开始时间
  lastMicroReview: null,    // 上次微复习时间戳
  microCount20: 0,         // 今日 20min 微复习次数
  microCount60: 0,         // 今日 60min 微复习次数
  snoozedUntil: 0,         // snooze 截止时间
  today: new Date().toDateString(),
};

let _timer20 = null;
let _timer60 = null;
let _timerTick = null;

const MS_20MIN = 20 * 60 * 1000;
const MS_60MIN = 60 * 60 * 1000;
const SNOOZE_MS = 5 * 60 * 1000;

// ── 测试辅助：重置内部状态（测试专用）────────────────────────

/** @internal */
export function _resetMicroState() {
  _state = {
    enabled: false,
    sessionStart: null,
    lastMicroReview: null,
    microCount20: 0,
    microCount60: 0,
    snoozedUntil: 0,
    today: new Date().toDateString(),
  };
  _clearTimers();
}

// ── 公开 API ─────────────────────────────────────────────────

/**
 * 启动微复习调度器（每次进入学习场景时调用）
 * @param {object} options
 * @param {boolean} options.enabled - 总开关（来自 settings.enableMicroReview）
 */
export function startMicroScheduler(options = {}) {
  _state.enabled = options.enabled !== false;
  if (!_state.enabled) {
    stopMicroScheduler();
    return;
  }
  _checkDayReset();

  if (!_state.sessionStart) {
    _state.sessionStart = Date.now();
  }

  _clearTimers();
  _startTimers();
  eventBus.emit(MICRO_EVENTS.READY, { canTrigger: _canTrigger() });
}

/**
 * 停止调度器（离开学习场景时调用）
 */
export function stopMicroScheduler() {
  _state.enabled = false;
  _clearTimers();
  eventBus.emit(MICRO_EVENTS.READY, { canTrigger: false });
}

/**
 * 重置计时器（用户学了新字时调用，重启倒计时）
 */
export function resetMicroTimer() {
  _state.sessionStart = Date.now();
  _state.lastMicroReview = null;
  _clearTimers();
  if (_state.enabled) _startTimers();
}

/**
 * 触发微复习（由 UI 调用，用户完成微复习后）
 * @param {string[]} charIds - 本次微复习的字（用于奖励）
 */
export function triggerMicroReview(charIds = []) {
  const now = Date.now();
  const elapsed = now - (_state.sessionStart || now);
  const is20Min = elapsed < MS_60MIN;
  _state.lastMicroReview = now;

  if (is20Min) _state.microCount20++;
  else _state.microCount60++;

  _clearTimers();
  _startTimers();

  return { is20Min, charIds, triggeredAt: now };
}

/**
 * 用户关闭微复习弹窗（不复习）
 */
export function dismissMicroReview() {
  _state.lastMicroReview = Date.now();
  _clearTimers();
  _startTimers();
  eventBus.emit(MICRO_EVENTS.DISMISS);
}

/**
 * 用户稍后提醒（snooze 5 分钟）
 */
export function snoozeMicroReview() {
  _state.snoozedUntil = Date.now() + SNOOZE_MS;
  _clearTimers();
  if (_state.enabled) _startTimers();
  eventBus.emit(MICRO_EVENTS.SNOOZE, { until: _state.snoozedUntil });
}

/**
 * 获取当前微复习状态（供 UI 渲染用）
 * @returns {object}
 */
export function getMicroReviewStatus() {
  const now = Date.now();
  const elapsed = now - (_state.sessionStart || now);
  const next20 = _state.sessionStart ? MS_20MIN - (now - _state.sessionStart) : MS_20MIN;
  const next60 = _state.sessionStart ? MS_60MIN - (now - _state.sessionStart) : MS_60MIN;
  return {
    enabled: _state.enabled,
    sessionMinutes: Math.floor(elapsed / 60000),
    next20Min: Math.max(0, Math.ceil(next20 / 60000)),
    next60Min: Math.max(0, Math.ceil(next60 / 60000)),
    microCount20Today: _state.microCount20,
    microCount60Today: _state.microCount60,
    canTrigger: _canTrigger(),
    snoozed: now < _state.snoozedUntil,
  };
}

/**
 * 获取今日微复习统计数据（供奖励系统用）
 */
export function getMicroReviewStats() {
  _checkDayReset();
  return {
    microCount20: _state.microCount20,
    microCount60: _state.microCount60,
    totalMicroReviews: _state.microCount20 + _state.microCount60,
    lastMicroReview: _state.lastMicroReview,
  };
}

// ── 内部函数 ─────────────────────────────────────────────────

function _canTrigger() {
  if (!_state.enabled || !_state.sessionStart) return false;
  const now = Date.now();
  if (now < _state.snoozedUntil) return false;
  if (_state.lastMicroReview && (now - _state.lastMicroReview) < 10 * 60 * 1000) return false;
  return true;
}

function _startTimers() {
  const now = Date.now();
  const elapsed = now - (_state.sessionStart || now);
  const timeTo20 = Math.max(0, MS_20MIN - elapsed);
  const timeTo60 = Math.max(0, MS_60MIN - elapsed);

  // 20min 计时器
  if (timeTo20 > 0) {
    _timer20 = setTimeout(() => {
      if (_canTrigger()) {
        eventBus.emit(MICRO_EVENTS.TRIGGER, {
          type: "20min",
          sessionStart: _state.sessionStart,
          triggeredAt: Date.now(),
        });
      }
    }, timeTo20);
  } else if (_canTrigger()) {
    // 已经超过 20 分钟，立即触发
    eventBus.emit(MICRO_EVENTS.TRIGGER, {
      type: "20min",
      sessionStart: _state.sessionStart,
      triggeredAt: Date.now(),
    });
  }

  // 60min 计时器
  if (timeTo60 > 0) {
    _timer60 = setTimeout(() => {
      if (_canTrigger()) {
        eventBus.emit(MICRO_EVENTS.TRIGGER, {
          type: "60min",
          sessionStart: _state.sessionStart,
          triggeredAt: Date.now(),
        });
      }
    }, timeTo60);
  } else if (_canTrigger()) {
    // 已经超过 60 分钟，立即触发
    eventBus.emit(MICRO_EVENTS.TRIGGER, {
      type: "60min",
      sessionStart: _state.sessionStart,
      triggeredAt: Date.now(),
    });
  }

  // 每秒 tick 用于检测跨天
  _timerTick = setInterval(_checkDayReset, 60000);
}

function _clearTimers() {
  if (_timer20) { clearTimeout(_timer20); _timer20 = null; }
  if (_timer60) { clearTimeout(_timer60); _timer60 = null; }
  if (_timerTick) { clearInterval(_timerTick); _timerTick = null; }
}

function _checkDayReset() {
  const today = new Date().toDateString();
  if (_state.today !== today) {
    _state.today = today;
    _state.microCount20 = 0;
    _state.microCount60 = 0;
    _state.lastMicroReview = null;
    _state.sessionStart = Date.now();
    _state.snoozedUntil = 0;
  }
}
