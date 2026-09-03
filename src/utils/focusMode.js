/**
 * src/utils/focusMode.js
 * ================================================================
 * E7 专注模式
 * ─────────────────────────────────────────────────────────────
 * 启用时：
 *  1. 在 <html> 上加 .focus-mode class → CSS 自动减弱动画/音效
 *  2. 隐藏侧栏装饰元素
 *  3. 屏蔽激励式弹窗（不调用 soundAndFX.celebrate）
 *  4. 自动启用大字模式（提高字号 1.25x）
 *
 * 持久化：
 *   通过 EbbinghausManager.settings.focusMode 保存（家长可关）
 *
 * 事件：
 *   - focusMode:enabled / focusMode:disabled
 * ─────────────────────────────────────────────────────────────
 */

import { eventBus } from "./eventBus.js";

const FOCUS_CLASS = "focus-mode";
const STORAGE_KEY = "cathy_focus_mode_prefs";

let _state = {
  enabled: false,
  autoReduceMotion: true, // 减弱动画
  muteAchievements: true, // 屏蔽激励式音效
  enlargeText: true,      // 大字模式
};

let _originalSettings = null;
const _subscribers = new Set();

// ── 公开 API ─────────────────────────────────────────────────

/**
 * 启用专注模式
 * @param {object} options
 */
export function enableFocusMode(options = {}) {
  const prev = { ..._state };
  _state = {
    enabled: true,
    autoReduceMotion: options.autoReduceMotion ?? _state.autoReduceMotion ?? true,
    muteAchievements: options.muteAchievements ?? _state.muteAchievements ?? true,
    enlargeText: options.enlargeText ?? _state.enlargeText ?? true,
  };
  _applyToDOM();
  _save();
  eventBus.emit("focusMode:enabled", { prefs: _state, previous: prev });
  _notifySubscribers();
}

/**
 * 关闭专注模式
 */
export function disableFocusMode() {
  const prev = { ..._state };
  _state = {
    ..._state,
    enabled: false,
  };
  _removeFromDOM();
  _save();
  eventBus.emit("focusMode:disabled", { prefs: _state, previous: prev });
  _notifySubscribers();
}

/**
 * 切换专注模式
 * @returns {boolean} 新状态
 */
export function toggleFocusMode() {
  if (_state.enabled) {
    disableFocusMode();
    return false;
  }
  enableFocusMode();
  return true;
}

/**
 * 更新偏好（不影响 enabled 状态）
 */
export function updateFocusPrefs(prefs) {
  _state = { ...(_state.enabled ? _state : { ..._state, enabled: false }), ...prefs };
  if (_state.enabled) {
    _applyToDOM();
  }
  _save();
  _notifySubscribers();
}

/**
 * 当前状态
 */
export function getFocusPrefs() {
  return { ..._state };
}

/**
 * 监听专注模式变化
 * @param {function} callback
 * @returns {function} unsubscribe
 */
export function onFocusModeChange(callback) {
  _subscribers.add(callback);
  return () => _subscribers.delete(callback);
}

/**
 * 检查是否应屏蔽激励式音效
 */
export function shouldMuteAchievements() {
  return _state.enabled && _state.muteAchievements;
}

/**
 * 检查是否应减弱动画
 */
export function shouldReduceMotion() {
  return _state.enabled && _state.autoReduceMotion;
}

/**
 * 检查是否应放大字号
 */
export function shouldEnlargeText() {
  return _state.enabled && _state.enlargeText;
}

// ── 内部 ───────────────────────────────────────────────────

function _applyToDOM() {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.classList.add(FOCUS_CLASS);
  if (_state.autoReduceMotion) html.classList.add("reduce-motion");
  if (_state.muteAchievements) html.classList.add("mute-achievements");
  if (_state.enlargeText) html.classList.add("enlarge-text");
}

function _removeFromDOM() {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.classList.remove(FOCUS_CLASS);
  html.classList.remove("reduce-motion");
  html.classList.remove("mute-achievements");
  html.classList.remove("enlarge-text");
}

function _save() {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
    }
  } catch (e) {
    // 隐私模式可能抛错，静默忽略
  }
}

function _load() {
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        _state = { ..._state, ...saved };
        if (_state.enabled) _applyToDOM();
      }
    }
  } catch (e) {
    // ignore
  }
}

function _notifySubscribers() {
  _subscribers.forEach((cb) => {
    try { cb(_state); } catch (e) { /* ignore */ }
  });
}

// 启动时加载
_load();
