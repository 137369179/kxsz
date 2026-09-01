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
