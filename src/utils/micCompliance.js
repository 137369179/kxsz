/**
 * 麦克风合规中心（P0-5 扩展）— 统一治理全应用所有麦克风采集面
 *
 * 治理对象：
 *  - pronunciationEval（儿童跟读评测）
 *  - parentVoice（家长语音模板录制，IndexedDB 持久化）
 *
 * 治理手段：
 *  - 总开关（localStorage `cathy_voice_eval_enabled`，家长中心设置；关闭后所有采集入口不可达）
 *  - 首次使用家长授权（localStorage `cathy_mic_consent`，持久化）
 *  - 录音中全局 🎙️ 指示徽标（采集开始显示、停止/取消移除）
 *
 * 数据边界承诺：录音仅在本设备处理/存储，不上传。
 */

import { showParentGate } from "./parentGate.js";

const MIC_CONSENT_KEY = "cathy_mic_consent";
const MIC_TOGGLE_KEY = "cathy_voice_eval_enabled"; // 沿用既有 key，家长设置无需迁移

export function isMicEnabled() {
  try { return localStorage.getItem(MIC_TOGGLE_KEY) !== "0"; } catch { return true; }
}

export function setMicEnabled(on) {
  try { localStorage.setItem(MIC_TOGGLE_KEY, on ? "1" : "0"); } catch {}
}

/**
 * 首次使用麦克风时的家长授权门禁（通过后持久化同意）
 * @returns {Promise<boolean>}
 */
export async function ensureMicConsent() {
  try {
    if (localStorage.getItem(MIC_CONSENT_KEY) === "granted") return true;
  } catch {}
  let passed = false;
  try {
    passed = await showParentGate({
      title: "家长授权 · 麦克风（仅本机，不上传）",
      level: "medium",
      confirmText: "同意并开始",
      cancelText: "暂不使用",
    });
  } catch {}
  if (!passed) return false;
  try { localStorage.setItem(MIC_CONSENT_KEY, "granted"); } catch {}
  return true;
}

/** 录音中全局指示徽标（麦克风激活期可见） */
export function showMicBadge() {
  if (typeof document === "undefined" || document.getElementById("mic-recording-badge")) return;
  const badge = document.createElement("div");
  badge.id = "mic-recording-badge";
  badge.setAttribute("role", "status");
  badge.setAttribute("aria-live", "assertive");
  badge.style.cssText = "position:fixed;top:14px;right:14px;z-index:99999;display:flex;align-items:center;gap:8px;background:rgba(15,23,42,.88);color:#fff;font-weight:800;font-size:12px;padding:8px 14px;border-radius:9999px;border:2px solid rgba(255,255,255,.35);box-shadow:0 8px 20px rgba(0,0,0,.4);pointer-events:none";
  badge.innerHTML = '<span class="mic-rec-dot"></span><span>录音中 · 仅本设备</span>';
  (document.body || document.documentElement).appendChild(badge);
}

export function removeMicBadge() {
  try { document.getElementById("mic-recording-badge")?.remove(); } catch {}
}
