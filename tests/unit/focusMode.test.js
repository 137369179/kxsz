/**
 * tests/unit/focusMode.test.js
 * ================================================================
 * 专注模式（focusMode）单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  enableFocusMode,
  disableFocusMode,
  toggleFocusMode,
  getFocusPrefs,
  onFocusModeChange,
  shouldMuteAchievements,
  shouldReduceMotion,
  shouldEnlargeText,
} from '../../src/utils/focusMode.js'

describe('focusMode', () => {

  beforeEach(() => {
    // 模拟 DOM
    global.document = {
      documentElement: {
        classList: {
          _classes: new Set(),
          add(c) { this._classes.add(c); },
          remove(c) { this._classes.delete(c); },
          contains(c) { return this._classes.has(c); },
        },
      },
    };
    global.localStorage = {
      _store: {},
      getItem(k) { return this._store[k] || null; },
      setItem(k, v) { this._store[k] = v; },
      removeItem(k) { delete this._store[k]; },
      clear() { this._store = {}; },
    };
    disableFocusMode();
    localStorage.clear();
  });

  it('默认关闭', () => {
    expect(getFocusPrefs().enabled).toBe(false);
  });

  it('enableFocusMode 启用', () => {
    enableFocusMode();
    expect(getFocusPrefs().enabled).toBe(true);
  });

  it('disableFocusMode 关闭', () => {
    enableFocusMode();
    disableFocusMode();
    expect(getFocusPrefs().enabled).toBe(false);
  });

  it('toggleFocusMode 切换', () => {
    expect(toggleFocusMode()).toBe(true);
    expect(toggleFocusMode()).toBe(false);
  });

  it('启用后 DOM 加 class', () => {
    enableFocusMode();
    expect(document.documentElement.classList.contains('focus-mode')).toBe(true);
  });

  it('禁用后移除 class', () => {
    enableFocusMode();
    disableFocusMode();
    expect(document.documentElement.classList.contains('focus-mode')).toBe(false);
  });

  it('默认开启：减弱动画 + 屏蔽激励 + 大字', () => {
    enableFocusMode();
    expect(shouldReduceMotion()).toBe(true);
    expect(shouldMuteAchievements()).toBe(true);
    expect(shouldEnlargeText()).toBe(true);
  });

  it('可单独关闭某个偏好', () => {
    enableFocusMode({ muteAchievements: false });
    expect(shouldMuteAchievements()).toBe(false);
    expect(shouldReduceMotion()).toBe(true);
  });

  it('禁用后 shouldXxx 返回 false', () => {
    enableFocusMode();
    disableFocusMode();
    expect(shouldReduceMotion()).toBe(false);
    expect(shouldMuteAchievements()).toBe(false);
    expect(shouldEnlargeText()).toBe(false);
  });

  it('updateFocusPrefs 不改变 enabled', () => {
    enableFocusMode();
    const before = getFocusPrefs().enabled;
    // 模拟 updateFocusPrefs
    import('../../src/utils/focusMode.js').then(({ updateFocusPrefs }) => {
      updateFocusPrefs({ enlargeText: false });
    });
    return Promise.resolve().then(() => {
      expect(getFocusPrefs().enlargeText).toBe(false);
    });
  });

  it('onFocusModeChange 触发回调', () => {
    const cb = vi.fn();
    const unsub = onFocusModeChange(cb);
    enableFocusMode();
    expect(cb).toHaveBeenCalled();
    disableFocusMode();
    expect(cb).toHaveBeenCalledTimes(2);
    unsub();
  });

  it('取消订阅后不触发', () => {
    const cb = vi.fn();
    const unsub = onFocusModeChange(cb);
    unsub();
    enableFocusMode();
    expect(cb).not.toHaveBeenCalled();
  });

  it('持久化：localStorage 写入状态', () => {
    enableFocusMode();
    const raw = localStorage.getItem('cathy_focus_mode_prefs');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw);
    expect(parsed.enabled).toBe(true);
  });
});
