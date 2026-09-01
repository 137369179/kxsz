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
  SELECT_CHAR: "app:select-char",
  START_LEARN: "app:select-char",
  LEARN_FINISH: "app:learn-finish",
  REVIEW_FINISH: "app:review-finish",

  // 
  PROGRESS_CHANGED: "progress:changed",
  ENERGY_CHANGED: "energy:changed",
  STARS_CHANGED: "stars:changed",

  //  — 
  SOUND_TOGGLE_MUTE: "sound:toggle-mute",

  //  —  / 
  AUDIO_BUS_STATE_CHANGE: "audio:bus-state-change",  // //  payload: {cause, snapshot}
  AUDIO_BGM_CHANGED: "audio:bgm-changed",            // BGM  payload: {old, new, transitionMs}
  AUDIO_VOLUME_CHANGED: "audio:volume-changed",      //  payload: {channel, value, profile}
  AUDIO_HEADPHONE_DETECTED: "audio:headphone-detected", //  payload: {active, volumeAutoAdjusted}
  AUDIO_PARENT_UNLOCKED: "audio:parent-unlocked",    //  payload: {unlocked}

  //  —  / 
  AUDIO_SPEAK_START: "audio:speak-start",            //  payload: {kind, text, emotion}
  AUDIO_SPEAK_PROGRESS: "audio:speak-progress",      //  payload: {char_index, char, time_ms, total}
  AUDIO_SPEAK_END: "audio:speak-end",                //  payload: {kind, text, interrupted}
  AUDIO_QUEUE_INTERRUPT: "audio:queue-interrupt",    //  payload: {high_priority_kind, interrupted_kind}
  AUDIO_QUEUE_RESUME: "audio:queue-resume",          //  payload: {kind, resumeOffsetMs}

  //  — 
  AUDIO_STROKE_SYNC: "audio:stroke-sync",            //  payload: {strokeIdx, eventType:'start'|'end', deltaMs, strokeName, strokeType}

  //  — 
  AUDIO_EVAL_STATE_CHANGE: "audio:eval-state-change", //  payload: {state, prev}
  AUDIO_EVAL_RESULT: "audio:eval-result",             //  payload: {score, pa, sr, cm, perCharReport, mappingErrors}
  AUDIO_EVAL_ERROR_CUE: "audio:eval-error-cue",       //  payload: {charIdx, char, errorType, suggestion}

  //  — 
  AUDIO_PARENT_VOICE_SAVED: "audio:parent-voice-saved",   //  payload: {triggerType, durationMs, sizeBytes}
  AUDIO_PARENT_VOICE_PLAYED: "audio:parent-voice-played", //  payload: {triggerType}
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
