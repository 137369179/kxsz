/**
 * 触屏 UX 预测性动效 — 异步点击反馈（<150ms 触感 + >150ms 等待微光）
 * 已接线：startLearnFlow / ensureModule
 */
import { GAME_ICONS } from './gameIcons.js';

/**
 * 包装异步操作，提供 <150ms 即时触觉反馈 + >150ms 预测性加载呼吸动效
 * @param {HTMLElement} element 触发交互的 DOM 节点
 * @param {Function} asyncFn 返回 Promise 的异步业务函数
 * @param {object} [options]
 * @param {number} [options.anticipatoryThreshold=150] 出现预测动效的延迟阈值 (ms)
 * @param {string} [options.loadingText='准备中...'] 等待提示语
 * @returns {Promise<any>}
 */
export async function withAnticipatoryFeedback(element, asyncFn, options = {}) {
  if (!element || typeof asyncFn !== 'function') {
    return asyncFn ? asyncFn() : Promise.resolve();
  }

  const threshold = options.anticipatoryThreshold || 150;
  let timerId = null;
  let badgeEl = null;

  // 1. <150ms 即刻触感反馈：轻微缩放与微光边缘
  element.classList.add('transition-transform', 'duration-150', 'active:scale-95', 'opacity-90');

  // 2. 预测动效定时器：若 150ms 内未完成，浮现呼吸小星光
  timerId = setTimeout(() => {
    if (typeof document?.body?.contains === 'function' && !document.body.contains(element)) return;
    badgeEl = document.createElement('span');
    badgeEl.className = 'anticipatory-badge inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full animate-pulse pointer-events-none shadow-sm ml-1.5';
    badgeEl.setAttribute('role', 'status');
    const iconHtml = (typeof window !== 'undefined' && window.GAME_ICONS)
      ? window.GAME_ICONS.sparkle('w-3.5 h-3.5')
      : (GAME_ICONS ? GAME_ICONS.sparkle('w-3.5 h-3.5') : '<span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-400"></span>');
    badgeEl.innerHTML = `${iconHtml}<span>${options.loadingText || '准备中...'}</span>`;
    element.appendChild(badgeEl);
  }, threshold);

  try {
    const result = await asyncFn();
    return result;
  } finally {
    if (timerId) clearTimeout(timerId);
    if (badgeEl && badgeEl.parentNode) {
      badgeEl.remove();
    }
    element.classList.remove('active:scale-95', 'opacity-90');
  }
}

/**
 * 在指定容器呈现轻量级预测过渡骨架 / 呼吸态（替代突兀的空白）
 * @param {HTMLElement} container
 * @param {string} [label='正在探索中...']
 * @returns {Function} cleanup 函数
 */
export function showAnticipatoryPlaceholder(container, label = '正在探索中...') {
  if (!container) return () => {};

  const placeholder = document.createElement('div');
  placeholder.className = 'anticipatory-placeholder w-full py-8 flex flex-col items-center justify-center gap-2 text-amber-700 bg-amber-50/50 rounded-2xl border border-dashed border-amber-200 animate-pulse';
  const iconHtml = (typeof window !== 'undefined' && window.GAME_ICONS)
    ? window.GAME_ICONS.sparkle('w-8 h-8 text-amber-500 animate-spin')
    : (GAME_ICONS ? GAME_ICONS.sparkle('w-8 h-8 text-amber-500') : '<div class="w-8 h-8 rounded-full bg-amber-400"></div>');

  placeholder.innerHTML = `
    <div class="flex items-center justify-center">${iconHtml}</div>
    <span class="text-sm font-bold tracking-wide">${label}</span>
  `;

  container.appendChild(placeholder);
  return () => {
    try { placeholder.remove(); } catch {}
  };
}
