/**
 * 凯茜识字 (Cathy Literacy) - 艾宾浩斯遗忘曲线复习调度与学习分析器
 */

import { eventBus, EVENTS } from "./eventBus.js";
import { storageManager } from "./storageManager.js";
import { findShopItem } from "../data/shop.js";

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
    let loaded = null;
    try {
      const raw = storageManager.getItem(STORAGE_KEY);
      if (raw) loaded = JSON.parse(raw);
    } catch (e) {
      console.warn("读取本地进度失败，使用默认配置", e);
    }

    const today = new Date().toDateString();

    const defaultState = {
      coins: 60,
      stars: 12,
      currentIsland: 1,
      currentLevelIndex: 1,
      profile: {
        name: "凯茜小勇士",
        avatar: "assets/images/cathy_mascot.webp"
      },
      settings: {
        dailyCharTarget: 5,
        enablePlayStep: true,
        enableWriteStep: true,
        eyeProtectionMinutes: 20,
        audioLanguage: "mandarin",
        soundEnabled: true
      },
      shop: {
        owned: ["av_cathy", "av_fairy", "av_hero", "frame_none"],
        equippedFrame: "frame_none"
      },
      // 真实学习/签到日期 YYYY-MM-DD 列表 —— 奖励城堡「连胜日历」热力图数据源
      attendance: { dates: [], streakDays: 0 },
      seenMedals: [], // 已在奖励城堡亮过相的勋章 id，避免重复弹解锁提示
      readBooks: [], // 已读绘本 id —— 绘本类勋章数据源
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
      todayLearnedCount: 0,
      lastActiveDate: today,
      todaySignedIn: false,
      signInStreak: 0,
      lastSignInDate: "",
      studyHistory: [
        { date: "周一", count: 3 },
        { date: "周二", count: 2 },
        { date: "周三", count: 4 },
        { date: "周四", count: 1 },
        { date: "周五", count: 5 },
        { date: "周六", count: 0 },
        { date: "周日", count: 0 }
      ]
    };

    if (loaded) {
      const merged = {
        ...defaultState,
        ...loaded,
        settings: { ...defaultState.settings, ...(loaded.settings || {}) },
        profile: { ...defaultState.profile, ...(loaded.profile || {}) },
        shop: { ...defaultState.shop, ...(loaded.shop || {}) },
        attendance: {
          dates: Array.isArray(loaded.attendance && loaded.attendance.dates)
            ? loaded.attendance.dates
            : [],
          streakDays: (loaded.attendance && loaded.attendance.streakDays) || 0
        },
        seenMedals: Array.isArray(loaded.seenMedals) ? loaded.seenMedals : [],
        readBooks: Array.isArray(loaded.readBooks) ? loaded.readBooks : []
      };
      // Daily reset: new day → reset today's counters
      if (merged.lastActiveDate !== today) {
        merged.lastActiveDate = today;
        merged.todayLearnedCount = 0;
        merged.todaySignedIn = false;
      }
      // 旧存档补齐：用真实日期列表重算连胜（比历史字段可靠）
      merged.attendance.streakDays = this._calcStreak(merged.attendance.dates);
      return merged;
    }

    return defaultState;
  }

  save() {
    try {
      storageManager.putJSON(STORAGE_KEY, this.progress);
    } catch (e) {
      console.error("保存进度失败", e);
    }
  }

  // ------------------------------------------------------------
  // 打卡日历 / 连胜（奖励城堡数据源）
  // 与签到连胜 signInStreak 互补：这里记录"真实学习日"，用于热力月历与坚持勋章
  // ------------------------------------------------------------
  _fmtKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  _todayKey() {
    return this._fmtKey(new Date());
  }

  /** 由真实日期集合重算连续天数：今天还没学就从昨天起算，避免白天误判断签 */
  _calcStreak(dates) {
    const set = new Set(dates || []);
    const cursor = new Date();
    if (!set.has(this._todayKey())) cursor.setDate(cursor.getDate() - 1);
    let streak = 0;
    while (set.has(this._fmtKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  /** 记录一次真实学习行为（学字/签到都会调用），写入当日日期并重算连胜 */
  markTodayActive() {
    if (!this.progress.attendance) this.progress.attendance = { dates: [], streakDays: 0 };
    const att = this.progress.attendance;
    if (!Array.isArray(att.dates)) att.dates = [];
    const key = this._todayKey();
    if (!att.dates.includes(key)) att.dates.push(key);
    att.streakDays = this._calcStreak(att.dates);
    this.save();
    return att;
  }

  /** 勋章解锁提示只弹一次 */
  markMedalsSeen(ids) {
    const merged = new Set([...(this.progress.seenMedals || []), ...ids]);
    this.progress.seenMedals = Array.from(merged);
    this.save();
  }

  /** 记录绘本已读（绘本类勋章数据源） */
  markBookRead(bookId) {
    if (!Array.isArray(this.progress.readBooks)) this.progress.readBooks = [];
    if (!this.progress.readBooks.includes(bookId)) {
      this.progress.readBooks.push(bookId);
      this.save();
      eventBus.emit(EVENTS.PROGRESS_CHANGED, { progress: this.progress });
    }
  }

  addCoins(amount = 10) {
    this.progress.coins = (this.progress.coins || 0) + amount;
    this.save();
    eventBus.emit(EVENTS.PROGRESS_CHANGED, { progress: this.progress });
    return this.progress.coins;
  }

  /** 增加星星数量 */
  addStars(amount = 1) {
    this.progress.stars = (this.progress.stars || 0) + amount;
    this.save();
    eventBus.emit(EVENTS.PROGRESS_CHANGED, { progress: this.progress });
    return this.progress.stars;
  }

  // 每日签到 — 计算连续天数、奖励星币
  doSignIn() {
    if (this.progress.todaySignedIn) return;
    const today = new Date().toDateString();
    const lastDate = this.progress.lastSignInDate;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    // Streak: only continues if signed in yesterday
    if (lastDate === yesterday) {
      this.progress.signInStreak = (this.progress.signInStreak || 0) + 1;
    } else if (lastDate !== today) {
      this.progress.signInStreak = 1;
    }
    this.progress.lastSignInDate = today;
    this.progress.todaySignedIn = true;
    this.markTodayActive(); // 签到同样点亮热力日历
    // Bonus: 5 base + streak bonus
    const bonus = 5 + Math.min(this.progress.signInStreak - 1, 10);
    this.addCoins(bonus);
    this.save();
    eventBus.emit(EVENTS.PROGRESS_CHANGED, { progress: this.progress });
    return this.progress.signInStreak;
  }

  // 记录今日学习了一个新字
  incrementTodayLearned() {
    this.progress.todayLearnedCount = (this.progress.todayLearnedCount || 0) + 1;
    // Update study history (rolling weekly)
    const days = ["周日","周一","周二","周三","周四","周五","周六"];
    const todayLabel = days[new Date().getDay()];
    const hist = this.progress.studyHistory || [];
    const dayEntry = hist.find(h => h.date === todayLabel);
    if (dayEntry) dayEntry.count = this.progress.todayLearnedCount;
    this.save();
    eventBus.emit(EVENTS.PROGRESS_CHANGED, { progress: this.progress });
  }

  // 完成一个汉字的学习
  completeCharacter(charId, starsEarned = 3) {
    this.markTodayActive(); // 学字即打卡，点亮连胜日历
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
    eventBus.emit(EVENTS.PROGRESS_CHANGED, { progress: this.progress });
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

  // ===== 装扮商城与道具背包系统 =====
  isOwned(id) {
    if (!this.progress.shop) {
      this.progress.shop = { owned: ["av_cathy", "av_fairy", "av_hero", "frame_none"], equippedFrame: "frame_none" };
    }
    const owned = this.progress.shop.owned || [];
    if (owned.includes(id)) return true;
    const item = findShopItem ? findShopItem(id) : null;
    return item ? item.price === 0 : (id === "av_cathy" || id === "frame_none");
  }

  // 注：markMedalsSeen 的真实实现在上方「打卡日历 / 连胜」小节（此处原为空壳重名方法，已移除以免覆盖）

  equipAvatar(value) {
    if (!this.progress.profile) this.progress.profile = {};
    this.progress.profile.avatar = value;
    this.save();
    eventBus.emit(EVENTS.PROGRESS_CHANGED, { progress: this.progress });
  }

  equipFrame(id) {
    if (!this.progress.shop) {
      this.progress.shop = { owned: ["av_cathy", "av_fairy", "av_hero", "frame_none"], equippedFrame: "frame_none" };
    }
    this.progress.shop.equippedFrame = id;
    if (!this.progress.profile) this.progress.profile = {};
    this.progress.profile.frame = id;
    this.save();
    eventBus.emit(EVENTS.PROGRESS_CHANGED, { progress: this.progress });
  }

  purchase(id) {
    if (!this.progress.shop) {
      this.progress.shop = { owned: ["av_cathy", "av_fairy", "av_hero", "frame_none"], equippedFrame: "frame_none" };
    }
    if (this.isOwned(id)) return { ok: true, success: true };
    const item = findShopItem ? findShopItem(id) : null;
    const price = item ? item.price : 0;
    if (this.progress.coins < price) {
      return { ok: false, success: false, reason: "insufficient_coins" };
    }
    this.progress.coins -= price;
    if (!this.progress.shop.owned) this.progress.shop.owned = ["av_cathy", "av_fairy", "av_hero", "frame_none"];
    if (!this.progress.shop.owned.includes(id)) {
      this.progress.shop.owned.push(id);
    }
    this.save();
    eventBus.emit(EVENTS.PROGRESS_CHANGED, { progress: this.progress });
    return { ok: true, success: true };
  }
}

export const ebbinghausManager = new EbbinghausManager();
