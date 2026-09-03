/**
 * 微课断点续学存取 — LearnModule 步骤状态机持久化层
 * 统一走 JSON，避免 localStorage 把对象写成 "[object Object]"
 */

import { storageManager } from "./storageManager.js";

export function learnProgressKey(charId) {
  return `learn_progress_${charId}`;
}

/**
 * @param {unknown} raw
 * @returns {{ charId?: string, currentStep: number, completedSteps: number[] } | null}
 */
export function normalizeLearnProgress(raw) {
  if (!raw || typeof raw !== "object") return null;
  const currentStep = raw.currentStep;
  if (typeof currentStep !== "number" || currentStep < 1 || currentStep > 8) return null;
  const completedSteps = Array.isArray(raw.completedSteps)
    ? raw.completedSteps.filter((n) => typeof n === "number" && n >= 1 && n <= 8)
    : [];
  return {
    charId: typeof raw.charId === "string" ? raw.charId : undefined,
    currentStep,
    completedSteps,
  };
}

export function saveLearnProgress(charId, state) {
  if (!charId) return false;
  const payload = {
    charId,
    completedSteps: Array.isArray(state?.completedSteps) ? state.completedSteps : [],
    currentStep: state?.currentStep ?? 1,
    lastUpdated: Date.now(),
  };
  const normalized = normalizeLearnProgress(payload);
  if (!normalized) return false;
  return storageManager.putJSON(learnProgressKey(charId), {
    ...payload,
    ...normalized,
  });
}

export function loadLearnProgress(charId) {
  if (!charId) return null;
  const raw = storageManager.getJSON(learnProgressKey(charId), null);
  return normalizeLearnProgress(raw);
}

export function clearLearnProgress(charId) {
  if (!charId) return;
  storageManager.removeItem(learnProgressKey(charId));
}
