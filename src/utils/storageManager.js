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

const IDB_NAME = "cathy_literacy_db";
const IDB_VERSION = 1;
const IDB_STORE = "kv_store";

function openIDB() {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function idbSet(key, val) {
  openIDB().then((db) => {
    if (!db) return;
    try {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(val, key);
    } catch {}
  }).catch(() => {});
}

function idbDelete(key) {
  openIDB().then((db) => {
    if (!db) return;
    try {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).delete(key);
    } catch {}
  }).catch(() => {});
}

function idbGetAll() {
  return openIDB().then((db) => {
    if (!db) return {};
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(IDB_STORE, "readonly");
        const store = tx.objectStore(IDB_STORE);
        const req = store.openCursor();
        const results = {};
        req.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            results[cursor.key] = cursor.value;
            cursor.continue();
          } else {
            resolve(results);
          }
        };
        req.onerror = () => resolve({});
      } catch {
        resolve({});
      }
    });
  });
}

/** 安全校验与清洗小名（过滤 HTML 标签、内联脚本、控制字符，截断安全长度） */
export function sanitizeProfileName(name) {
  if (typeof name !== "string") return "宝宝";
  let clean = name
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/[\x00-\x1F\x7F]/g, "")
    .trim();
  return clean.slice(0, 20) || "宝宝";
}

/** 安全校验 ID（仅允许字母数字下划线与连字符） */
export function sanitizeProfileId(id, fallback = "child_1") {
  if (typeof id !== "string") return fallback;
  const clean = id.replace(/[^a-zA-Z0-9_\-]/g, "").slice(0, 48);
  return clean || fallback;
}

/** 深度防范原型链污染 (Prototype Pollution Guard) */
export function deepSanitizeObject(obj, depth = 0) {
  if (depth > 20 || !obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => deepSanitizeObject(item, depth + 1));
  }
  const clean = Object.create(null);
  for (const [k, v] of Object.entries(obj)) {
    if (k === "__proto__" || k === "constructor" || k === "prototype") continue;
    clean[k] = deepSanitizeObject(v, depth + 1);
  }
  return clean;
}

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
      // 渐进式异步双写到 IndexedDB 进行灾备持久化
      idbSet(key, value);
      return true;
    } catch {
      // 即使 localStorage 满 (QuotaExceededError)，仍尝试写入 IndexedDB
      idbSet(key, value);
      return false;
    }
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
    idbDelete(key);
  }

  /**
   * 自动从 IndexedDB 灾备恢复（当 localStorage 意外清空或 WebKit 7天失效时）
   * @returns {Promise<boolean>} 是否恢复了数据
   */
  async restoreFromIndexedDB() {
    try {
      const idbData = await idbGetAll();
      const keys = Object.keys(idbData);
      if (keys.length === 0) return false;

      let restoredCount = 0;
      for (const k of keys) {
        if (this.getItem(k) === null && idbData[k] != null) {
          try {
            localStorage.setItem(k, idbData[k]);
            restoredCount++;
          } catch {}
        }
      }
      return restoredCount > 0;
    } catch {
      return false;
    }
  }

  /**
   * 将当前 localStorage 中所有凯茜识字数据全量同步备份到 IndexedDB
   */
  async backupToIndexedDB() {
    if (!this.isAvailable()) return false;
    const db = await openIDB();
    if (!db) return false;
    try {
      const tx = db.transaction(IDB_STORE, "readwrite");
      const store = tx.objectStore(IDB_STORE);
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith("CATHY_") || k.startsWith("cathy_"))) {
          const v = localStorage.getItem(k);
          if (v != null) store.put(v, k);
        }
      }
      return true;
    } catch {
      return false;
    }
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
      { id: "child_1", name: "大宝 (默认)" },
      { id: "child_2", name: "二宝" }
    ]);
  }

  saveProfilesList(list) {
    if (!Array.isArray(list)) return;
    const cleanList = list.map((p, idx) => ({
      id: sanitizeProfileId(p.id, `child_${idx + 1}`),
      name: sanitizeProfileName(p.name || `宝贝 ${idx + 1}`)
    }));
    this.putJSON("CATHY_PROFILES_LIST", cleanList);
  }

  renameProfile(profileId, newName) {
    if (!profileId || !newName || !newName.trim()) return false;
    const cleanName = sanitizeProfileName(newName);
    if (!cleanName) return false;
    const list = this.listProfiles();
    const item = list.find((p) => p.id === profileId);
    if (!item) return false;
    item.name = cleanName;
    this.saveProfilesList(list);
    return true;
  }

  deleteProfile(profileId) {
    if (!profileId) return false;
    const list = this.listProfiles();
    if (list.length <= 1) return false; // 至少保留 1 个档案
    const filtered = list.filter((p) => p.id !== profileId);
    this.saveProfilesList(filtered);
    this.removeItem(`CATHY_LITERACY_PROGRESS_${profileId}`);
    if (this.getActiveProfileId() === profileId) {
      this.setActiveProfileId(filtered[0].id);
    }
    return true;
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
      if (typeof jsonString !== "string" || jsonString.length > 5 * 1024 * 1024) return false;
      const raw = JSON.parse(jsonString);
      if (!raw || typeof raw !== "object") return false;
      const data = deepSanitizeObject(raw);

      if (data.activeProfileId) this.setActiveProfileId(sanitizeProfileId(data.activeProfileId));
      if (Array.isArray(data.profiles)) this.saveProfilesList(data.profiles);

      const activeId = this.getActiveProfileId();
      if (data.progress && typeof data.progress === "object" && Object.keys(data.progress).length > 0) {
        this.putJSON(`CATHY_LITERACY_PROGRESS_${activeId}`, data.progress);
        this.putJSON("CATHY_LITERACY_USER_PROGRESS_V1", data.progress);
      }
      if (data.bookRecordings && typeof data.bookRecordings === "object") {
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
      // 安全修复：btoa 仅支持 Latin-1，使用 unescape/encodeURIComponent 处理 Unicode 字符
      const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
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
    if (tokenStr.length > 5 * 1024 * 1024) return { ok: false, msg: "数据过大，无法导入" };
    const trimmed = tokenStr.trim();
    try {
      let progressObj = null;
      if (trimmed.startsWith("CATHY_SYNC_V1:")) {
        const rawBase64 = trimmed.slice("CATHY_SYNC_V1:".length);
        // 安全修复：使用 decodeURIComponent/unescape 正确处理 Unicode 字符
        const decodedJson = decodeURIComponent(escape(atob(rawBase64)));
        const rawPayload = JSON.parse(decodedJson);
        const payload = deepSanitizeObject(rawPayload);
        progressObj = payload.p || payload;
      } else if (trimmed.startsWith("{")) {
        const rawData = JSON.parse(trimmed);
        const data = deepSanitizeObject(rawData);
        progressObj = data.progress || data;
      }

      if (!progressObj || typeof progressObj !== "object") {
        return { ok: false, msg: "无效的换机数据格式" };
      }

      const activeId = this.getActiveProfileId();
      this.putJSON(`CATHY_LITERACY_PROGRESS_${activeId}`, progressObj);
      this.putJSON("CATHY_LITERACY_USER_PROGRESS_V1", progressObj);

      const charCount = Object.keys(progressObj.charRecords || {}).length;
      const coins = Number(progressObj.coins) || 0;
      return { ok: true, charCount, coins };
    } catch (e) {
      console.error("解析换机迁移码失败", e);
      return { ok: false, msg: "换机码解析失败，请检查是否完整复制" };
    }
  }
}


export const storageManager = new StorageManager();
export default storageManager;
