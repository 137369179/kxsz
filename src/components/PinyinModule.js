/**
 * 凯茜识字 - 部编版奇趣拼音王国专项岛
 */
import { BaseModule } from "../utils/BaseModule.js";
import { PINYIN_INITIALS } from "../data/pinyinList.js";
import { locatePinyin } from "../utils/pinyinHub/pinyinLocate.js";
import { render, _renderCurrentTabContent, _renderAtlasView, _renderCoasterView, startToneQuiz, _renderToneQuizView, _renderCollisionView, _bindEvents } from "../utils/pinyinHub/pinyinViews.js";

export class PinyinModule extends BaseModule {
  constructor(container) {
    super(container);
    this.currentTab = "atlas"; // "atlas" | "coaster" | "collision"
    this.selectedCategory = "initial"; // "initial" | "final" | "whole"
    this.selectedPinyin = PINYIN_INITIALS[0];
    this.collisionIndex = 0;
    this.currentTone = 1;

    // B5 声调意识训练状态
    this.toneQuizActive = false;
    this.toneQuizSession = null;
    this.toneQuizIndex = 0;
    this.toneQuizScore = 0;
    this.toneQuizLastResult = null;
  }

  locatePinyin(pinyinStr) { return locatePinyin.call(this, pinyinStr); }

  render() { return render.call(this); }
  _renderCurrentTabContent(...args) { return _renderCurrentTabContent.call(this, ...args); }
  _renderAtlasView(...args) { return _renderAtlasView.call(this, ...args); }
  _renderCoasterView(...args) { return _renderCoasterView.call(this, ...args); }
  startToneQuiz(...args) { return startToneQuiz.call(this, ...args); }
  _renderToneQuizView(...args) { return _renderToneQuizView.call(this, ...args); }
  _renderCollisionView(...args) { return _renderCollisionView.call(this, ...args); }
  _bindEvents(...args) { return _bindEvents.call(this, ...args); }
}
