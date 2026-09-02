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

  getItem(key) {
    if (!this.isAvailable()) return null;
    try { return localStorage.getItem(key); } catch { return null; }
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

  /**  */
  clearAllCathyKeys() {
    const KEYS = [
      "CATHY_LITERACY_USER_PROGRESS_V1",
      "cathy_audio_v1",
      "cathy_audio_pin_v1",
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

}


export const storageManager = new StorageManager();
export default storageManager;
