/**
 * 凯茜识字 (Cathy Literacy) - 艾宾浩斯遗忘曲线复习调度与学习分析器
 */

const STORAGE_KEY = "CATHY_LITERACY_USER_PROGRESS_V1";

export class EbbinghausManager {
  constructor() {
    this.progress = this.loadProgress();
  }

  init() {
    this.progress = this.loadProgress();
    return this.progress;
  }

  loadProgress() {
    try {
      if (typeof localStorage !== "undefined") {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      }
    } catch (e) {
      console.warn("读取本地进度失败，使用默认配置", e);
    }

    return {
      coins: 60,
      stars: 12,
      currentIsland: 1,
      currentLevelIndex: 1,
      profile: {
        name: "凯茜小勇士",
        avatar: "assets/images/cathy_mascot.jpg"
      },
      // 学习设置
      settings: {
        dailyCharTarget: 3, // 每日学字数
        enablePlayStep: true, // 是否开启玩环节
        enableWriteStep: true, // 是否开启写环节
        eyeProtectionMinutes: 20, // 护眼提醒间隔 (分钟)
        audioLanguage: "mandarin", // mandarin | cantonese
        soundEnabled: true
      },
      // 汉字掌握进度表 { [charId]: { charId, learnedAt, reviewCount, correctStreak, masteryRate, nextReviewDate, isDifficult } }
      charRecords: {
        char_001: {
          charId: "char_001",
          learnedAt: Date.now() - 86400000 * 2,
          reviewCount: 3,
          correctStreak: 3,
          masteryRate: 98,
          nextReviewDate: Date.now() + 86400000 * 4,
          isDifficult: false
        }
      },
      todayLearnedCount: 1,
      lastActiveDate: new Date().toDateString(),
      studyHistory: [
        { date: "周一", count: 3 },
        { date: "周二", count: 4 },
        { date: "周三", count: 3 },
        { date: "周四", count: 5 },
        { date: "周五", count: 4 },
        { date: "周六", count: 6 },
        { date: "今天", count: 2 }
      ]
    };
  }

  save() {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
      }
    } catch (e) {
      console.error("保存进度失败", e);
    }
  }

  addCoins(amount = 10) {
    this.progress.coins = (this.progress.coins || 0) + amount;
    this.save();
    return this.progress.coins;
  }

  // 完成一个汉字的学习
  completeCharacter(charId, starsEarned = 3) {
    const now = Date.now();
    const existing = this.progress.charRecords[charId] || {
      charId,
      learnedAt: now,
      reviewCount: 0,
      correctStreak: 0,
      masteryRate: 75,
      nextReviewDate: now + 86400000, // 次日复习
      isDifficult: false
    };

    existing.reviewCount += 1;
    existing.correctStreak += 1;
    existing.masteryRate = Math.min(100, existing.masteryRate + 15);
    // 艾宾浩斯间隔：1天 -> 2天 -> 4天 -> 7天 -> 15天
    const intervals = [1, 2, 4, 7, 15, 30];
    const days = intervals[Math.min(existing.reviewCount, intervals.length - 1)];
    existing.nextReviewDate = now + days * 86400000;

    this.progress.charRecords[charId] = existing;
    this.progress.coins = (this.progress.coins || 0) + 10;
    this.progress.stars = (this.progress.stars || 0) + starsEarned;
    this.progress.todayLearnedCount = (this.progress.todayLearnedCount || 0) + 1;

    // 解锁下一关
    this.progress.currentLevelIndex = Math.max(this.progress.currentLevelIndex, Object.keys(this.progress.charRecords).length + 1);

    this.save();
    return existing;
  }

  completeReview(charId, isCorrect = true) {
    const record = this.progress.charRecords[charId] || {
      charId,
      learnedAt: Date.now(),
      reviewCount: 0,
      correctStreak: 0,
      masteryRate: 60,
      nextReviewDate: Date.now() + 86400000,
      isDifficult: false
    };

    if (isCorrect) {
      record.reviewCount += 1;
      record.correctStreak += 1;
      record.masteryRate = Math.min(100, record.masteryRate + 10);
      record.isDifficult = false;
      const intervals = [1, 2, 4, 7, 15, 30];
      const days = intervals[Math.min(record.reviewCount, intervals.length - 1)];
      record.nextReviewDate = Date.now() + days * 86400000;
    } else {
      record.correctStreak = 0;
      record.masteryRate = Math.max(20, record.masteryRate - 20);
      record.isDifficult = true;
      record.nextReviewDate = Date.now() + 86400000; // 次日重新复习
    }

    this.progress.charRecords[charId] = record;
    this.save();
  }

  isDifficultChar(charId) {
    const r = this.progress.charRecords[charId];
    return r ? !!r.isDifficult : false;
  }

  addDifficultChar(charId) {
    const r = this.progress.charRecords[charId] || {
      charId,
      learnedAt: Date.now(),
      reviewCount: 0,
      correctStreak: 0,
      masteryRate: 50,
      nextReviewDate: Date.now() + 86400000,
      isDifficult: true
    };
    r.isDifficult = true;
    this.progress.charRecords[charId] = r;
    this.save();
  }

  removeDifficultChar(charId) {
    if (this.progress.charRecords[charId]) {
      this.progress.charRecords[charId].isDifficult = false;
      this.save();
    }
  }

  // 记录错题/难字
  markDifficult(charId) {
    this.addDifficultChar(charId);
  }

  // 获取待复习汉字队列
  getDueReviewCharIds() {
    const now = Date.now();
    return Object.values(this.progress.charRecords || {})
      .filter((r) => r.nextReviewDate <= now || r.isDifficult)
      .map((r) => r.charId);
  }

  // 获取难字列表
  getDifficultCharIds() {
    return Object.values(this.progress.charRecords || {})
      .filter((r) => r.isDifficult || (r.masteryRate && r.masteryRate < 70))
      .map((r) => r.charId);
  }

  // ===== Reward stubs（原代码引用但未实现）=====
  markMedalsSeen(_ids) {
    // 标记勋章为已阅（stub）
  }

  equipAvatar(value) {
    if (!this.progress.profile) this.progress.profile = {};
    this.progress.profile.avatar = value;
    this.save();
  }

  equipFrame(id) {
    if (!this.progress.profile) this.progress.profile = {};
    this.progress.profile.frame = id;
    this.save();
  }

  purchase(id) {
    // 简化：直接返回成功
    return { success: true };
  }
}

export const ebbinghausManager = new EbbinghausManager();
