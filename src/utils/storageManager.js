/**
 * StorageManager — 统一的读写封装
 *
 * 替代各模块散落重复的 localStorage / IndexedDB 调用：
 * - getItem(key) / setItem(key, value)   localStorage（自动 JSON 序列化）
 * - getJSON(key, fallback)              解析 JSON，失败时返回 fallback
 * - putJSON(key, data)                  序列化并写入
 * - removeItem(key)                     删除
 *
 * 后续可在此层接入 IndexedDB 作为大体积数据（如家长录音）的持久化后端
 */

export class StorageManager {
  constructor() {
    this._lsSupported = typeof localStorage !== "undefined";
  }

  isAvailable() {
    return this._lsSupported;
  }

  getItem(key) {
    if (!this._lsSupported) return null;
    try { return localStorage.getItem(key); } catch { return null; }
  }

  setItem(key, value) {
    if (!this._lsSupported) return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch { return false; }
  }

  getJSON(key, fallback = null) {
    const raw = this.getItem(key);
    if (!raw) return fallback;
    try { return JSON.parse(raw); } catch { return fallback; }
  }

  putJSON(key, data) {
    try {
      return this.setItem(key, JSON.stringify(data));
    } catch { return false; }
  }

  removeItem(key) {
    if (!this._lsSupported) return;
    try { localStorage.removeItem(key); } catch {}
  }

  /** 清除所有凯茜识字相关的存储键 */
  clearAllCathyKeys() {
    const KEYS = [
      "CATHY_LITERACY_USER_PROGRESS_V1",
      "cathy_audio_v1",
      "cathy_audio_pin_v1",
    ];
    KEYS.forEach((k) => this.removeItem(k));
  }
}

export const storageManager = new StorageManager();
export default storageManager;
