/**
 * LearnModule 可测试纯函数（与 UI 解耦）
 */

export function starsToMasteryRate(starsEarned) {
  const stars = Math.max(0, Math.min(3, starsEarned ?? 3));
  return 55 + stars * 10;
}

export function scoreToStars(score) {
  if (score >= 90) return 3;
  if (score >= 75) return 2;
  if (score >= 60) return 1;
  return 0;
}

export function isValidCharData(charData) {
  return !!(charData && charData.id && charData.char);
}

export function calculateStepProgress(currentStep, completedSteps = [], totalSteps = 8) {
  const total = Math.max(1, Number(totalSteps) || 8);
  const completed = Array.isArray(completedSteps) ? completedSteps.length : 0;
  return Math.round((completed / total) * 100);
}

export function getStepDuration(stepNum) {
  const durations = {
    1: 5000,
    2: 8000,
    3: 10000,
    4: 15000,
    5: 30000,
    6: 20000,
    7: 30000,
    8: 10000,
  };
  return durations[stepNum] || 10000;
}

export const RECORD_MAX_DURATION_MS = 3200;
export const RECORD_SILENCE_TIMEOUT_MS = 2500;
export const HAZARD_PEEK_DURATION_MS = 2500;
