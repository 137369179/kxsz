/**
 * src/utils/mascotProgress.js
 * ================================================================
 * 《凯茜识字》内在动机驱动系统 (T13 / B7)
 * ─────────────────────────────────────────────────────────────
 * 将单纯的金币/星星外在激励，升华为主教角色「凯茜」的好感度、专属微表情解锁与互动故事篇章。
 * 遵循儿童自我决定理论 (Self-Determination Theory, Deci & Ryan 2000)。
 */

import { storageManager } from "./storageManager.js";
import { eventBus, EVENTS } from "./eventBus.js";

export const MASCOT_STORIES = [
  { id: "story_forest_1", title: "凯茜的魔法森林初遇", reqCorrect: 3, snippet: "小鹿凯茜在奇幻森林里找到了一枚会发光的汉字树叶……" },
  { id: "story_forest_2", title: "彩虹泉水的秘密", reqCorrect: 6, snippet: "念出正确的字音，彩虹泉水就会喷出漂亮的七彩泡泡！" },
  { id: "story_forest_3", title: "星光探险家启程", reqCorrect: 10, snippet: "穿上小探险服，凯茜和小朋友一起飞向知识的银河！" }
];

export class MascotProgress {
  constructor() {
    this.progress = this.load();
  }

  load() {
    const saved = storageManager.getJSON("mascot_progress");
    return saved && typeof saved === "object" ? saved : {
      expressions: ["neutral"],
      storiesUnlocked: [],
      consecutiveCorrect: 0,
      totalPraises: 0
    };
  }

  save() {
    storageManager.putJSON("mascot_progress", this.progress);
  }

  /**
   * 儿童朗读/作答正确时触发激励递进
   */
  onCorrectPronunciation() {
    this.progress.consecutiveCorrect = (this.progress.consecutiveCorrect || 0) + 1;
    this.progress.totalPraises = (this.progress.totalPraises || 0) + 1;

    let unlockedAny = false;

    // 连续正确 3 次 → 解锁开心表情
    if (this.progress.consecutiveCorrect >= 3) {
      if (this.unlockExpression("happy")) unlockedAny = true;
    }

    // 连续正确 5 次 → 解锁惊喜欢呼表情
    if (this.progress.consecutiveCorrect >= 5) {
      if (this.unlockExpression("excited")) unlockedAny = true;
    }

    // 解锁故事篇章
    for (const story of MASCOT_STORIES) {
      if (this.progress.totalPraises >= story.reqCorrect && !this.progress.storiesUnlocked.includes(story.id)) {
        this.progress.storiesUnlocked.push(story.id);
        unlockedAny = true;
      }
    }

    this.save();
    if (unlockedAny && eventBus) {
      eventBus.emit("mascot:unlocked", { progress: this.progress });
    }
    return this.progress;
  }

  /**
   * 作答错误时重置连击，保护自尊心不扣除已解锁内容
   */
  onWrongAttempt() {
    this.progress.consecutiveCorrect = 0;
    this.save();
  }

  unlockExpression(expr) {
    if (!Array.isArray(this.progress.expressions)) {
      this.progress.expressions = ["neutral"];
    }
    if (!this.progress.expressions.includes(expr)) {
      this.progress.expressions.push(expr);
      this.save();
      return true;
    }
    return false;
  }

  getUnlockedExpressions() {
    return this.progress.expressions || ["neutral"];
  }

  getUnlockedStories() {
    const ids = this.progress.storiesUnlocked || [];
    return MASCOT_STORIES.filter(s => ids.includes(s.id));
  }
}

export const mascotProgress = new MascotProgress();
