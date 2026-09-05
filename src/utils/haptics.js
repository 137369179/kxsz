/**
 * 触感反馈（P0-4）— 多通道即时反馈的触觉通道
 *
 * 设计要点：
 * - 仅在支持 navigator.vibrate 的设备生效（Android Chrome 等）；iOS Safari 无此 API，静默跳过
 * - 开关持久化于 localStorage `cathy_haptics`（默认开启）；家长中心可关闭
 * - 三档语义：success（答对，短双震）/ error（答错，单长震）/ tap（轻点，微震）
 * - 与音效同源调用：soundEngine 的反馈音方法内部同步触发，业务方零改动
 */

const STORAGE_KEY = "cathy_haptics";

function isSupported() {
  try {
    return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
  } catch {
    return false;
  }
}

export function isHapticsEnabled() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "0";
  } catch {
    return true;
  }
}

export function setHapticsEnabled(on) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
  } catch {}
}

const PATTERNS = {
  success: [30, 60, 30], // 短-停-短：轻快"叮咚"感
  error: [200],          // 单长震：明确但不惊吓
  tap: [15],             // 微震：轻点确认
  fanfare: [40, 50, 40, 50, 80], // 通关/勋章
};

function playAudioHapticThump(type) {
  try {
    if (typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = window.__cathyHapticCtx || (window.__cathyHapticCtx = new AudioCtx());
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = "sine";
    const freq = type === "success" ? 60 : type === "error" ? 40 : 50;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.025);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  } catch (_) {}
}

/**
 * 触发触感反馈
 * @param {"success"|"error"|"tap"|"fanfare"} type 语义类型
 */
export function haptic(type = "tap") {
  if (!isHapticsEnabled()) return;
  if (isSupported()) {
    const pattern = PATTERNS[type] || PATTERNS.tap;
    try {
      navigator.vibrate(pattern);
    } catch {}
  } else {
    // iOS Safari / 不支持 Vibration API 设备：听觉微阻尼触感补偿
    playAudioHapticThump(type);
  }
}

export function triggerHapticSuccess() {
  haptic("success");
}

export function triggerHapticWarning() {
  haptic("error");
}

