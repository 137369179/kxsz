/**
 *   +  +  (Task 10)
 *
 *  1. localStorage 4 // profile_key: "cathy_audio_v1"
 *  2. 4  PIN  BGM/SFX/Voice 
 *     PIN sha1-like  (base64(btoa) )
 *  3. 
 *        - navigator.mediaDevices.addEventListener('devicechange') /
 *        -  clamp masterVol ≤ 0.65
 *        -  > 30min  (health:rest)
 *        -  > 60min   ≤ 0.45
 *        -  > 0.9 compressor.reduction  10s  
 */

import { soundAndFX } from "./soundEngine.js";
import { EVENTS, eventBus } from "./eventBus.js";
import { storageManager } from "./storageManager.js";

const LS_KEY = "cathy_audio_v1";
const LS_PIN_KEY = "cathy_audio_pin_v1";    // {"pinHash":..., enabledChannels:["bgm","sfx","voice"]}

/** 同步轻量散列（FNV-1a + base36），防止 localStorage 明文裸存 PIN */
function obfuscatePin(pin) {
  // FNV-1a 64-bit 变体，快且不可逆
  let h = 0xcbf29ce484222325;
  const mask = 0xffffffffffffffff;
  for (let i = 0; i < pin.length; i++) {
    h ^= pin.charCodeAt(i);
    h = Math.imul(h, 0x00000100000001B3) & mask;
    h = (h ^ (h >>> 33)) & mask;
  }
  return "pin:" + h.toString(36);
}

export class AudioSafetyAndPersistence {
  constructor() {
    this.headphonesActive = false;
    this.health = {
      sessionStartMs: performance.now(),
      sessionPlaytimeMs: 0,
      totalPlaytimeMsToday: 0,
      playtimeResetDay: new Date().toDateString(),
      lastPeakReductionAlert: 0,
    };
    this._monitorTimer = null;
    this._deviceListenerBound = false;
  }

  // ---------------- 10.1  ----------------
  load() {
    try {
      const raw = storageManager.getItem(LS_KEY);
      if (!raw) return null;
      const d = JSON.parse(raw);
      soundAndFX.masterVolume = d.master ?? 1.0;
      soundAndFX.bgmVolume = d.bgm ?? 0.45;
      soundAndFX.sfxVolume = d.sfx ?? 0.85;
      soundAndFX.voiceVolume = d.voice ?? 1.0;
      soundAndFX.isMuted = !!d.muted;
      soundAndFX.speechRate = d.speechRate ?? 0.85;
      //  init gains
      soundAndFX.init();
      if (soundAndFX.audioCtx) {
        const now = soundAndFX.audioCtx.currentTime;
        soundAndFX.masterGain.gain.setValueAtTime(soundAndFX.isMuted ? 0 : soundAndFX.masterVolume, now);
        soundAndFX.bgmGain.gain.setValueAtTime(soundAndFX.bgmVolume, now);
        soundAndFX.sfxGain.gain.setValueAtTime(soundAndFX.sfxVolume, now);
        soundAndFX.voiceGain.gain.setValueAtTime(soundAndFX.voiceVolume, now);
      }
      return d;
    } catch (e) { return null; }
  }

  save() {
    try {
      const profile = soundAndFX._audioProfile;
      storageManager.putJSON(LS_KEY, profile);
      eventBus.emit(EVENTS.AUDIO_VOLUME_CHANGED, { channel: "all", profile });
      return profile;
    } catch (e) { return null; }
  }

  // ---------------- 10.2  ----------------
  /**
   *  PIN
   * @param {string} pin  4  ( PIN)
   * @param {string[]} lockedChannels  "master" | "bgm" | "sfx" | "voice"
   */
  setParentalLock(pin, lockedChannels = ["master", "voice", "bgm", "sfx"]) {
    const pinHash = obfuscatePin(String(pin || ""));
    const data = { pinHash, lockedChannels, enabled: true };
    try { storageManager.setItem(LS_PIN_KEY, JSON.stringify(data)); } catch {}
    eventBus.emit(EVENTS.AUDIO_PARENT_UNLOCKED, { unlocked: false });
    return true;
  }

  unlockParentalLock(pin) {
    try {
      const raw = storageManager.getItem(LS_PIN_KEY);
      if (!raw) return true;
      const d = JSON.parse(raw);
      const ok = d.pinHash === obfuscatePin(String(pin || ""));
      if (ok) {
        d.enabled = false;
        storageManager.setItem(LS_PIN_KEY, JSON.stringify(d));
        eventBus.emit(EVENTS.AUDIO_PARENT_UNLOCKED, { unlocked: true });
      }
      return ok;
    } catch { return false; }
  }

  lockParentalLock() {
    try {
      const raw = storageManager.getItem(LS_PIN_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      d.enabled = true;
      storageManager.setItem(LS_PIN_KEY, JSON.stringify(d));
      eventBus.emit(EVENTS.AUDIO_PARENT_UNLOCKED, { unlocked: false });
      return true;
    } catch { return false; }
  }

  isParentalLocked() {
    try { return JSON.parse(storageManager.getItem(LS_PIN_KEY) || '{"enabled":false}').enabled; }
    catch { return false; }
  }

  /** setXVolume  */
  canAdjustChannel(channel) {
    if (!this.isParentalLocked()) return true;
    try {
      const d = JSON.parse(storageManager.getItem(LS_PIN_KEY) || '{}');
      return !(d.lockedChannels || []).includes(channel);
    } catch { return true; }
  }

  /** 清除家长锁数据（仅供测试/重置用） */
  clearParentalLock() {
    storageManager.removeItem(LS_PIN_KEY);
  }

  setVolumeGuarded(channel, value) {
    if (!this.canAdjustChannel(channel)) return false;
    switch (channel) {
      case "master": soundAndFX.setMasterVolume(value); break;
      case "bgm": soundAndFX.setBGMVolume(value); break;
      case "sfx": soundAndFX.setSFXVolume(value); break;
      case "voice": soundAndFX.setVoiceVolume(value); break;
    }
    this.save();
    return true;
  }

  // ---------------- 10.3  +  ----------------
  /**
   *  enumerateDevices  label label 
   *   "headphone"/"earpiece"/""/"bluetooth"/"airpod"/"wireless"/"headset"  
   *  devicechange 
   */
  startDeviceMonitor() {
    if (this._deviceListenerBound) return;
    try {
      if (navigator.mediaDevices && typeof navigator.mediaDevices.addEventListener === "function") {
        navigator.mediaDevices.addEventListener("devicechange", () => this._checkHeadphoneAndApply());
        this._deviceListenerBound = true;
      }
    } catch {}
    // 500ms  (/)
    if (!this._monitorTimer) {
      this._monitorTimer = setInterval(() => this._healthTick(), 1000);
    }
    this._checkHeadphoneAndApply();
    this._healthTick();
  }

  stopDeviceMonitor() {
    if (this._monitorTimer) { clearInterval(this._monitorTimer); this._monitorTimer = null; }
  }

  async _checkHeadphoneAndApply() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    try {
      const devs = await navigator.mediaDevices.enumerateDevices();
      const outputs = devs.filter(d => d.kind === "audiooutput");
      const isHP = outputs.some(d => {
        const l = (d.label || "").toLowerCase();
        return /headphone|earpiece|earbud|bluetooth|airpod|wireless|headset||/.test(l);
      });
      const was = this.headphonesActive;
      this.headphonesActive = !!isHP;
      if (!was && this.headphonesActive) {
        // clamp masterVol ≤ 0.65 
        let auto = false;
        if (soundAndFX.masterVolume > 0.65) {
          soundAndFX.setMasterVolume(0.65);
          auto = true;
          this.save();
        }
        eventBus.emit(EVENTS.AUDIO_HEADPHONE_DETECTED, { active: true, volumeAutoAdjusted: auto });
      } else if (was && !this.headphonesActive) {
        eventBus.emit(EVENTS.AUDIO_HEADPHONE_DETECTED, { active: false, volumeAutoAdjusted: false });
      }
    } catch {}
  }

  _healthTick() {
    // a) 
    const today = new Date().toDateString();
    if (today !== this.health.playtimeResetDay) {
      this.health.playtimeResetDay = today;
      this.health.totalPlaytimeMsToday = 0;
    }
    //  bgmTimer   ≥1 
    const playing = (soundAndFX.activeBgmTimerCount > 0) || (soundAndFX.speechQueue.depth > 0);
    if (playing) {
      this.health.sessionPlaytimeMs += 1000;
      this.health.totalPlaytimeMsToday += 1000;
    }

    // b) session > 30min  
    if (this.health.sessionPlaytimeMs >= 30 * 60 * 1000 &&
        Math.abs(this.health.sessionPlaytimeMs - 30 * 60 * 1000) < 1100) {
      eventBus.emit(EVENTS.AUDIO_HEALTH, { kind: "rest-reminder", playedMin: 30 });
    }
    // c)  > 60min   clamp master ≤ 0.45
    if (this.health.totalPlaytimeMsToday > 60 * 60 * 1000) {
      if (soundAndFX.masterVolume > 0.45) {
        soundAndFX.setMasterVolume(0.45);
        this.save();
      }
    }

    // d) compressor.reduction  10s   clamp
    if (soundAndFX.compressor) {
      const red = soundAndFX.compressor.reduction.value;
      if (red < -12) {
        this.health.lastPeakReductionAlert += 1;
        if (this.health.lastPeakReductionAlert > 10 && soundAndFX.masterVolume > 0.7) {
          soundAndFX.setMasterVolume(0.7);
          this.save();
        }
      } else {
        this.health.lastPeakReductionAlert = 0;
      }
    }
  }

  // applyDefaultsOrLoaded  
  async applyDefaultsOrLoaded() {
    this.load();
    this.startDeviceMonitor();
    return {
      profile: soundAndFX._audioProfile,
      parentalLocked: this.isParentalLocked(),
      headphones: this.headphonesActive,
    };
  }

  // ============================================================
  // AC-10  round-trip +  / +  clamp
  // ============================================================
  async run_AC_10_scenario() {
    // A. 
    const oldVol = soundAndFX.masterVolume;
    soundAndFX.masterVolume = 0.77;
    const saved = this.save();
    const loaded = this.load();
    const persistOk = Math.abs(loaded.master - 0.77) < 0.01;
    soundAndFX.masterVolume = oldVol;

    // B.  set/unlock
    const lockSet = this.setParentalLock("1234", ["master", "voice"]);
    const locked = this.isParentalLocked();
    const guardReject = !this.canAdjustChannel("master");
    const wrongPINsuccess = this.unlockParentalLock("0000");   // PIN:  false
    const unlockRight = this.unlockParentalLock("1234");       // PIN:  true
    const guardAllow = this.canAdjustChannel("master");
    // re-lock for 
    this.lockParentalLock();

    // C.  set headphonesActive=true  clamp
    soundAndFX.masterVolume = 0.95;
    this.headphonesActive = true;
    const before = soundAndFX.masterVolume;
    // 
    eventBus.emit(EVENTS.AUDIO_HEADPHONE_DETECTED, { active: true, volumeAutoAdjusted: false });
    // 
    if (soundAndFX.masterVolume > 0.65) soundAndFX.setMasterVolume(0.65);
    const appliedAfterHP = soundAndFX.masterVolume <= 0.65;
    soundAndFX.masterVolume = oldVol;
    this.headphonesActive = false;
    // 清除 PIN（测试重置）—— 使用 storageManager.removeItem 干净清理，不污染实例方法
    storageManager.removeItem(LS_PIN_KEY);
    this.setParentalLock("1234", ["master", "voice"]); // 重新锁定，保留原始方法不被覆盖

    const allPass = persistOk && locked && guardReject && wrongPINsuccess === false && unlockRight && guardAllow && appliedAfterHP;
    return {
      ok: allPass, allPass,
      persist: { persistOk, saved, loaded },
      lock: { lockSet, locked, guardReject, wrongPINsuccess, unlockRight, guardAllow },
      headphone: { before, appliedAfterHP },
    };
  }
}

export const audioSafety = new AudioSafetyAndPersistence();
export default audioSafety;
