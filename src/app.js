/**
 * 凯茜识字 (Cathy Literacy) - 应用入口壳
 * 逻辑下沉至 utils/appHub/*
 */

import { MapModule } from "./components/MapModule.js";
import { BaseModule } from "./utils/BaseModule.js";
import { installBrowserShims } from "./utils/appHub/browserShims.js";
import {
  init,
  removeLoader,
  initAntiAddiction,
  showRestModal,
  initGlobalListeners,
  sparkleAt,
  initClickSparkles,
  initKeyboardShortcuts,
  warmupNeuralVoice,
  ensureModule,
  prefetchModule,
  transitionToMode,
  endStudySession,
  beginStudySession,
  ensureDailyLimitAllowsStudy,
  switchMode,
  startLearnFlow
} from "./utils/appHub/index.js";

installBrowserShims();

class CathyAppManager extends BaseModule {
  constructor() {
    const container = document.getElementById("game-app-viewport");
    super(container);
    this.currentMode = "map";
    this._restModalEl = null;
    this._restCountdownTimer = null;

    this.mapModule = new MapModule(this.container);
    this._moduleClasses = new Map();
    this._moduleInstances = new Map([["map", this.mapModule]]);
    this.learnModule = null;
    this._studySession = null;

    this.init();
  }

  get bookModule() { return this._moduleInstances.get("books") || null; }
  get playModule() { return this._moduleInstances.get("play") || null; }
  get cardModule() { return this._moduleInstances.get("cards") || null; }
  get parentModule() { return this._moduleInstances.get("parent") || null; }
  get rewardModule() { return this._moduleInstances.get("reward") || null; }
  get reviewModule() { return this._moduleInstances.get("review") || null; }
  get pkModule() { return this._moduleInstances.get("pk") || null; }
  get pinyinModule() { return this._moduleInstances.get("pinyin") || null; }
  get treehouseModule() { return this._moduleInstances.get("treehouse") || null; }

  get _moduleMap() {
    return {
      map: this.mapModule,
      books: this.bookModule,
      book: this.bookModule,
      play: this.playModule,
      arcade: this.playModule,
      cards: this.cardModule,
      card: this.cardModule,
      parent: this.parentModule,
      reward: this.rewardModule,
      rewards: this.rewardModule,
      review: this.reviewModule,
      pk: this.pkModule,
      pinyin: this.pinyinModule,
      treehouse: this.treehouseModule,
    };
  }

  init() { return init.call(this); }
  _removeLoader() { return removeLoader.call(this); }
  _initGlobalListeners() { return initGlobalListeners.call(this); }
  _sparkleAt(...args) { return sparkleAt.call(this, ...args); }
  _initAntiAddiction() { return initAntiAddiction.call(this); }
  showRestModal() { return showRestModal.call(this); }
  _initClickSparkles() { return initClickSparkles.call(this); }
  _initKeyboardShortcuts() { return initKeyboardShortcuts.call(this); }
  _warmupNeuralVoice() { return warmupNeuralVoice.call(this); }

  async _ensureModule(modeName) { return ensureModule.call(this, modeName); }
  prefetchModule(modeName) { return prefetchModule.call(this, modeName); }
  transitionToMode(modeName) { return transitionToMode.call(this, modeName); }
  _endStudySession() { return endStudySession.call(this); }
  _beginStudySession() { return beginStudySession.call(this); }
  async _ensureDailyLimitAllowsStudy() { return ensureDailyLimitAllowsStudy.call(this); }
  async switchMode(modeName) { return switchMode.call(this, modeName); }
  async startLearnFlow(charData) { return startLearnFlow.call(this, charData); }
}

const cathyAppInstance = new CathyAppManager();

if (typeof window !== "undefined") {
  window.cathyApp = cathyAppInstance;
}

export { cathyAppInstance, CathyAppManager };
