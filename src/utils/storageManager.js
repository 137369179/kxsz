/**
 * StorageManager — 
 *
 *  localStorage / IndexedDB 
 * - getItem(key) / setItem(key, value)   localStorage JSON 
 * - getJSON(key, fallback)               JSON fallback
 * - putJSON(key, data)                  
 * - removeItem(key)                     
 *
 *  IndexedDB 
 */

export class StorageManager {
  constructor() {}

  isAvailable() {
    if (this._lsSupported === false) return false;
    return typeof localStorage !== "undefined";
  }

  getItem(key, fallback = null) {
    if (!this.isAvailable()) return fallback;
    try {
      const val = localStorage.getItem(key);
      return val !== null ? val : fallback;
    } catch {
      return fallback;
    }
  }

  setItem(key, value) {
    if (!this.isAvailable()) return false;
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
    if (!this.isAvailable()) return;
    try { localStorage.removeItem(key); } catch {}
  }

  /** 清除所有凯茜识字相关的存储键 */
  clearAllCathyKeys() {
    const KEYS = [
      "CATHY_LITERACY_USER_PROGRESS_V1",
      "cathy_audio_v1",
      "cathy_audio_pin_v1",
      "cathy_book_progress_v2",
      "cathy_tree_water_count",
      "cathy_hunger_val",
      "CATHY_ACTIVE_PROFILE_ID",
      "cathy_scrapbook_stickers_v1",
      "cathy_scrapbook_bg_v1",
    ];
    KEYS.forEach((k) => this.removeItem(k));
  }

  // ----------------------------------------------------
  // /
  // ----------------------------------------------------
  getActiveProfileId() {
    return this.getItem("CATHY_ACTIVE_PROFILE_ID") || "child_1";
  }

  setActiveProfileId(profileId) {
    this.setItem("CATHY_ACTIVE_PROFILE_ID", profileId);
  }

  listProfiles() {
    return this.getJSON("CATHY_PROFILES_LIST", [
      { id: "child_1", name: " ()" },
      { id: "child_2", name: " ()" }
    ]);
  }

  saveProfilesList(list) {
    this.putJSON("CATHY_PROFILES_LIST", list);
  }

  exportProgressJSON() {
    const activeId = this.getActiveProfileId();
    const progressKey = `CATHY_LITERACY_PROGRESS_${activeId}`;
    const defaultKey = "CATHY_LITERACY_USER_PROGRESS_V1";
    const data = {
      version: "2.0.0",
      exportedAt: new Date().toISOString(),
      activeProfileId: activeId,
      profiles: this.listProfiles(),
      progress: this.getJSON(progressKey) || this.getJSON(defaultKey) || {},
      bookRecordings: this.getJSON("cathy_book_recordings_v2") || {}
    };
    return JSON.stringify(data, null, 2);
  }

  importProgressJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== "object") return false;

      if (data.activeProfileId) this.setActiveProfileId(data.activeProfileId);
      if (Array.isArray(data.profiles)) this.saveProfilesList(data.profiles);

      const activeId = this.getActiveProfileId();
      if (data.progress && Object.keys(data.progress).length > 0) {
        this.putJSON(`CATHY_LITERACY_PROGRESS_${activeId}`, data.progress);
        this.putJSON("CATHY_LITERACY_USER_PROGRESS_V1", data.progress);
      }
      if (data.bookRecordings) {
        this.putJSON("cathy_book_recordings_v2", data.bookRecordings);
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 生成跨设备极简换机迁移码 (Base64 紧凑编码)
   */
  exportSyncToken() {
    try {
      const activeId = this.getActiveProfileId();
      const progressKey = `CATHY_LITERACY_PROGRESS_${activeId}`;
      const defaultKey = "CATHY_LITERACY_USER_PROGRESS_V1";
      const progress = this.getJSON(progressKey) || this.getJSON(defaultKey) || {};
      
      const payload = {
        v: 1,
        t: Date.now(),
        p: progress
      };
      const jsonStr = JSON.stringify(payload);
      const encoded = btoa(encodeURIComponent(jsonStr));
      return `CATHY_SYNC_V1:${encoded}`;
    } catch (e) {
      console.error("生成换机迁移码失败", e);
      return null;
    }
  }

  /**
   * 解析并导入跨设备换机迁移码
   * @param {string} tokenStr 迁移码或完整 JSON
   */
  importSyncToken(tokenStr) {
    if (!tokenStr || typeof tokenStr !== "string") return { ok: false, msg: "迁移码为空" };
    const trimmed = tokenStr.trim();
    try {
      let progressObj = null;
      if (trimmed.startsWith("CATHY_SYNC_V1:")) {
        const rawBase64 = trimmed.slice("CATHY_SYNC_V1:".length);
        const decodedJson = decodeURIComponent(atob(rawBase64));
        const payload = JSON.parse(decodedJson);
        progressObj = payload.p || payload;
      } else if (trimmed.startsWith("{")) {
        const data = JSON.parse(trimmed);
        progressObj = data.progress || data;
      }

      if (!progressObj || typeof progressObj !== "object") {
        return { ok: false, msg: "无效的换机数据格式" };
      }

      const activeId = this.getActiveProfileId();
      this.putJSON(`CATHY_LITERACY_PROGRESS_${activeId}`, progressObj);
      this.putJSON("CATHY_LITERACY_USER_PROGRESS_V1", progressObj);

      const charCount = Object.keys(progressObj.charRecords || {}).length;
      const coins = progressObj.coins || 0;
      return { ok: true, charCount, coins };
    } catch (e) {
      console.error("解析换机迁移码失败", e);
      return { ok: false, msg: "换机码解析失败，请检查是否完整复制" };
    }
  }
}


export const storageManager = new StorageManager();
export default storageManager;
