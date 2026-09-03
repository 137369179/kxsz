/**
 * 基础 Module 类 — 所有业务模块的基类
 *
 * 职责：生命周期管理、事件绑定、资源清理
 * - this.container : DOM 容器
 * - this._cleanups  : 生命周期清理队列
 * - this._on / _onWindow / _onDocument : 事件绑定
 * - this._interval / this._timeout : 定时器（自动清理）
 * - this._busOn / this._busEmit : 事件总线
 * - this.destroy() : 清理所有资源
 */
import { eventBus, EVENTS } from "./eventBus.js";

/**
 * HTML 转义 — 防止 XSS 注入
 * 将 < > & " ' 等特殊字符转义为 HTML 实体
 */
export function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export class BaseModule {
  constructor(container) {
    this.container = container;
    this._cleanups = [];
    this.bus = eventBus;
    // E7: 专注模式 — 订阅文档级切换
    const focusHandler = ({ enabled }) => {
      if (typeof document !== "undefined") {
        document.body.classList.toggle("focus-mode", enabled);
        document.documentElement.classList.toggle("focus-mode", enabled);
        document.body.dataset.focusMode = enabled ? "true" : "false";
      }
    };
    const focusCleanup = eventBus.on(EVENTS.FOCUS_MODE_CHANGED, focusHandler);
    this._addCleanup(focusCleanup);
    // 初始化时同步当前状态
    eventBus.once("app:init", () => {
      const { ebbinghausManager } = window._modules || {};
      const focusOn = ebbinghausManager?.isFocusModeEnabled?.();
      if (focusOn) {
        document.body.classList.add("focus-mode");
        document.documentElement.classList.add("focus-mode");
      }
    });
  }

  /** destroy  */
  _addCleanup(fn) {
    this._cleanups.push(fn);
  }

  /**  */
  _on(el, evt, fn, opts) {
    if (!el) return;
    el.addEventListener(evt, fn, opts);
    this._addCleanup(() => el.removeEventListener(evt, fn, opts));
  }

  /**
   * 通用 DOM 监听器绑定与全生命周期回收支持:
   * - 支持单个 DOM 元素 (Element / EventTarget)
   * - 支持字符串选择器 (在 this.container 范围内通过 querySelectorAll 查找并绑定)
   * - 支持 NodeList 或 Element 数组批量绑定
   * 绑定的所有监听器自动进入 this._cleanups，在 destroy() 时一键清理
   */
  _onDom(target, evt, fn, opts) {
    if (!target || !evt || typeof fn !== "function") return;

    if (typeof target === "string") {
      if (!this.container) return;
      const elements = this.container.querySelectorAll(target);
      elements.forEach(el => this._on(el, evt, fn, opts));
      return;
    }

    if (Array.isArray(target) || (typeof NodeList !== "undefined" && target instanceof NodeList) || (typeof target.forEach === "function" && typeof target.length === "number")) {
      Array.from(target).forEach(el => el && this._on(el, evt, fn, opts));
      return;
    }

    this._on(target, evt, fn, opts);
  }


  /**  window  */
  _onWindow(evt, fn, opts) {
    window.addEventListener(evt, fn, opts);
    this._addCleanup(() => window.removeEventListener(evt, fn, opts));
  }

  /**  document  */
  _onDocument(evt, fn, opts) {
    document.addEventListener(evt, fn, opts);
    this._addCleanup(() => document.removeEventListener(evt, fn, opts));
  }

  /**
   * destroy 
   * @param {string} event 
   * @param {Function} handler 
   * @returns {Function} 
   */
  _busOn(event, handler) {
    const off = eventBus.on(event, handler);
    this._addCleanup(off);
    return off;
  }

  /**  eventBus.emit */
  _busEmit(event, data) {
    eventBus.emit(event, data);
  }

  /** setInterval destroy  */
  _interval(fn, ms) {
    const id = setInterval(fn, ms);
    this._addCleanup(() => clearInterval(id));
    return id;
  }

  /** setTimeout destroy  */
  _timeout(fn, ms) {
    const id = setTimeout(() => {
      // 
      const idx = this._cleanups.indexOf(cleanup);
      if (idx > -1) this._cleanups.splice(idx, 1);
      fn();
    }, ms);
    const cleanup = () => clearTimeout(id);
    this._addCleanup(cleanup);
    return id;
  }

  /**
   * 返回大地图（统一返回按钮行为）
   * @param {Object} options 配置选项
   * @param {boolean} options.playSound 是否播放 pop 音效，默认 true
   * @param {string} options.target 目标模式，默认 "map"
   * @param {Function} options.onBack 切换前回调，返回 true 可阻止默认行为
   */
  navigateToMap(options = {}) {
    const { playSound = true, target = "map", onBack } = options;
    // 动态导入 soundAndFX 避免循环依赖
    if (playSound && typeof window !== "undefined" && window.soundAndFX?.playPop) {
      window.soundAndFX.playPop();
    }
    if (typeof onBack === "function") {
      const result = onBack();
      // 如果 onBack 返回 true，表示自行处理了导航，不触发默认行为
      if (result === true) return;
    }
    this._busEmit(EVENTS.SWITCH_MODE, { mode: target });
  }

  /**
   * 通用返回按钮绑定
   * @param {string|Element} btn 返回按钮选择器或元素
   * @param {Object} options 配置选项
   * @param {Function} options.onBack 切换前回调，返回 true 可阻止默认行为
   */
  bindBackButton(btn, options = {}) {
    const { playSound = true, target = "map", onBack } = options;
    if (!btn) return;
    this._on(btn, "click", () => {
      this.navigateToMap({ playSound, target, onBack });
    });
  }

  /**
   *  super.destroy()
   * 
   */
  destroy() {
    while (this._cleanups.length) {
      const fn = this._cleanups.pop();
      try {
        fn && fn();
      } catch (err) {
        console.warn("[BaseModule] cleanup error:", err);
      }
    }
  }
}
