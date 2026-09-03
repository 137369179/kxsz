/**
 *  — 
 *
 * 
 * -  eventBus
 * -  "domain:action"  EVENTS 
 * -  BaseModule._addCleanup 
 *
 * 
 *   app:switch-mode                  payload: { mode }
 *   app:select-char            payload: { charData }
 *   app:learn-finish           payload: { charId, stars }
 *   app:review-finish            payload: { correct, total }
 *   progress:changed                 payload: { progress }
 *   energy:changed                       payload: { current, max }
 *   stars:changed                    payload: { count }
 *   sound:toggle-mute                payload: { muted }
 */

export const EVENTS = Object.freeze({
  // 核心路由与流程事件
  SWITCH_MODE: "app:switch-mode",
  SELECT_CHAR: "app:select-char",       // 从地图/字卡等入口选中汉字
  START_LEARN: "app:start-learn",       // 开始五步学习流（与 SELECT_CHAR 区分，避免同名冲突）
  LEARN_FINISH: "app:learn-finish",
  REVIEW_FINISH: "app:review-finish",
  MODE_ERROR: "app:error",              // 模式渲染异常，payload: { mode, error }

  // 状态变更
  PROGRESS_CHANGED: "progress:changed",
  ENERGY_CHANGED: "energy:changed",
  STARS_CHANGED: "stars:changed",

  // 音频控制
  SOUND_TOGGLE_MUTE: "sound:toggle-mute",

  // E7: 专注模式
  FOCUS_MODE_CHANGED: "focus:mode-changed",

  // 音频总线状态
  AUDIO_BUS_STATE_CHANGE: "audio:bus-state-change",  // 音频总线状态变化
  AUDIO_BGM_CHANGED: "audio:bgm-changed",            // BGM 切换
  AUDIO_VOLUME_CHANGED: "audio:volume-changed",      // 音量调节
  AUDIO_HEADPHONE_DETECTED: "audio:headphone-detected", // 耳机插入
  AUDIO_PARENT_UNLOCKED: "audio:parent-unlocked",    // 家长锁状态
  AUDIO_HEALTH: "audio:health",                      // 健康提示（30min/60min）

  // 语音合成
  AUDIO_SPEAK_START: "audio:speak-start",            // 开始朗读
  AUDIO_SPEAK_PROGRESS: "audio:speak-progress",      // 朗读进度
  AUDIO_SPEAK_END: "audio:speak-end",                // 朗读结束
  AUDIO_QUEUE_INTERRUPT: "audio:queue-interrupt",    // 队列被中断
  AUDIO_QUEUE_RESUME: "audio:queue-resume",          // 队列恢复

  // 笔顺同步
  AUDIO_STROKE_SYNC: "audio:stroke-sync",            // 笔顺动画同步事件

  // 发音评测
  AUDIO_EVAL_STATE_CHANGE: "audio:eval-state-change", // 评测状态变化
  AUDIO_EVAL_RESULT: "audio:eval-result",             // 评测结果（大写兼容旧代码）
  AUDIO_EVAL_ERROR: "audio:eval-error",               // 评测错误（大写兼容旧代码）
  AUDIO_EVAL_ERROR_CUE: "audio:eval-error-cue",       // 评测错误提示

  // 家长录音
  AUDIO_PARENT_VOICE_SAVED: "audio:parent-voice-saved",   // 家长录音已保存
  AUDIO_PARENT_VOICE_PLAYED: "audio:parent-voice-played", // 家长录音已播放
});

class EventBus {
  constructor() {
    this._listeners = Object.create(null);
  }

  /**
   * 
   * @param {string} event 
   * @param {Function} handler 
   * @returns {Function} 
   */
  on(event, handler) {
    (this._listeners[event] ||= []).push(handler);
    return () => this.off(event, handler);
  }

  /**
   * 
   */
  once(event, handler) {
    const wrapper = (data) => {
      this.off(event, wrapper);
      handler(data);
    };
    return this.on(event, wrapper);
  }

  /**
   * 
   */
  off(event, handler) {
    const list = this._listeners[event];
    if (!list) return;
    const idx = list.indexOf(handler);
    if (idx > -1) list.splice(idx, 1);
  }

  /**
   * 
   * @param {string} event 
   * @param {*} [data] 
   */
  emit(event, data) {
    const list = this._listeners[event];
    if (!list || list.length === 0) return;
    //  on/off 
    const snapshot = list.slice();
    for (const handler of snapshot) {
      try {
        handler(data);
      } catch (err) {
        console.error(`[EventBus] handler error for "${event}":`, err);
      }
    }
  }

  /**  */
  clear() {
    this._listeners = Object.create(null);
  }
}

// 
export const eventBus = new EventBus();

if (typeof window !== "undefined") {
  window.eventBus = eventBus;
}
