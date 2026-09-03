/**
 * 
 *
 *  Module  container
 * - this.container : 
 * - this._cleanups  : 
 * - this._on / _onWindow / _onDocument : 
 * - this._interval / this._timeout : destroy 
 * - this._busOn / this._busEmit : 
 * - this.destroy() : 
 */
import { eventBus } from "./eventBus.js";

export class BaseModule {
  constructor(container) {
    this.container = container;
    this._cleanups = [];
    this.bus = eventBus;
    // E7: 专注模式 — 订阅文档级切换
    this._focusCleanup = eventBus.on(EVENTS.FOCUS_MODE_CHANGED, ({ enabled }) => {
      if (typeof document !== "undefined") {
        document.body.classList.toggle("focus-mode", enabled);
      }
    });
    this._addCleanup(() => eventBus.off(EVENTS.FOCUS_MODE_CHANGED, this._focusCleanup));
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
