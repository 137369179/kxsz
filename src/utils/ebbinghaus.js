/**
 * 凯茜识字 (Cathy Literacy) - 艾宾浩斯遗忘曲线复习调度与学习分析器
 */

import { eventBus, EVENTS } from "./eventBus.js";
import { storageManager } from "./storageManager.js";
import { findShopItem } from "../data/shop.js";
import { fsrsCompleteCharacter, fsrsCompleteReview, fsrsGetDueIds } from "./fsrsScheduler.js";

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
      const activeId = typeof storageManager.getActiveProfileId === "function" ? storageManager.getActiveProfileId() : null;
      const raw = (activeId ? storageManager.getItem(`CATHY_LITERACY_PROGRESS_${activeId}`) : null) || storageManager.getItem(STORAGE_KEY);
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
        avatar: "assets/images/cathy_mascot.webp",
        age: null,            // 实岁 3~10；null = 未设置，默认走 6 岁宽容模式
        grade: null           // 幼儿园大班/一年级/... 可选
      },
      settings: {
        dailyCharTarget: 5,
        enablePlayStep: true,
        enableWriteStep: true,
        enablePrewriteStep: true,    // 控笔训练总开关（家长可关）
        eyeProtectionMinutes: 20,
        audioLanguage: "mandarin",
        soundEnabled: true,
        strokeTolerance: "standard",  // "strict" | "standard" | "kid"
        focusMode: false            // E7: 专注模式（减弱动画 + 简化音效）
      },
      shop: {
        owned: ["av_cathy", "av_fairy", "av_hero", "frame_none"],
        equippedFrame: "frame_none"
      },
      // 真实学习/签到日期 YYYY-MM-DD 列表 —— 奖励城堡「连胜日历」热力图数据源
      attendance: { dates: [], streakDays: 0 },
      seenMedals: [], // 已在奖励城堡亮过相的勋章 id，避免重复弹解锁提示
      readBooks: [], // 已读绘本 id —— 绘本类勋章数据源
      errorProfiles: {
        confusedPairs: {},        // { targetChar: { wrongChar: count } }
        reverseStrokeErrors: {},  // { charId: count }
        pronunciationErrors: {},  // { charId: count }
        updatedAt: 0
      },
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
        readBooks: Array.isArray(loaded.readBooks) ? loaded.readBooks : [],
        errorProfiles: loaded.errorProfiles || { ...defaultState.errorProfiles }
      };
      // Daily reset: new day → reset today's counters
      if (merged.lastActiveDate !== today) {
        merged.lastActiveDate = today;
        merged.todayLearnedCount = 0;
        merged.todaySignedIn = false;
      }
      // 旧存档补齐：用真实日期列表重算连胜（比历史字段可靠）
      merged.attendance.streakDays = this._calcStreak(merged.attendance.dates);

      if (typeof merged.coins !== "number" || isNaN(merged.coins) || merged.coins < 0) {
        merged.coins = defaultState.coins;
      }
      if (typeof merged.stars !== "number" || isNaN(merged.stars) || merged.stars < 0) {
        merged.stars = defaultState.stars;
      }

      return merged;
    }

    return defaultState;
  }

  save() {
    try {
      storageManager.putJSON(STORAGE_KEY, this.progress);
      if (typeof storageManager.getActiveProfileId === "function") {
        const activeId = storageManager.getActiveProfileId();
        if (activeId) {
          storageManager.putJSON(`CATHY_LITERACY_PROGRESS_${activeId}`, this.progress);
        }
      }
    } catch (e) {
      console.error("保存进度失败", e);
    }
  }

  // ------------------------------------------------------------
  // B1 铁律：年龄适配 + 控笔开关便捷接口
  // ------------------------------------------------------------

  /** 返回实岁 (3~10)，未设置则回退到 6（宽容模式） */
  getAge() {
    const age = this.progress?.profile?.age;
    const n = Number(age);
    if (!Number.isFinite(n) || n <= 0) return 6;
    return Math.max(3, Math.min(10, Math.round(n)));
  }

  /**
   * B1/B6 铁律：根据年龄返回书写阶段
   *  - "prewrite_only"  → <5 岁：只做控笔训练，禁止进描红
   *  - "guided_trace"   → 5~6 岁：田字格 + 宽容容差，引导式描红
   *  - "full_trace"     → >=7 岁：米字格 + 正常容差，完整描红
   */
  getWritingStage() {
    const age = this.getAge();
    if (age < 5) return "prewrite_only";
    if (age < 7) return "guided_trace";
    return "full_trace";
  }

  /** 控笔训练是否开启（家长可关） */
  isPrewriteEnabled() {
    return !!this.progress?.settings?.enablePrewriteStep;
  }

  /** 仅 <5 岁时强制跳过描红（B1 铁律硬约束） */
  isWriteBlockedByAge() {
    return this.getWritingStage() === "prewrite_only";
  }

  // E7: 专注模式
  isFocusModeEnabled() {
    return !!this.progress.settings.focusMode;
  }

  setFocusMode(enabled) {
    this.progress.settings.focusMode = !!enabled;
    this.save();
    eventBus.emit(EVENTS.FOCUS_MODE_CHANGED, { enabled: this.progress.settings.focusMode });
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
    const validAmount = Number(amount) || 0;
    this.progress.coins = Math.max(0, Math.floor((this.progress.coins || 0) + validAmount));
    this.save();
    eventBus.emit(EVENTS.PROGRESS_CHANGED, { progress: this.progress });
    return this.progress.coins;
  }

  /** 扣除金币数量 */
  deductCoins(amount = 0) {
    const validAmount = Math.max(0, Number(amount) || 0);
    this.progress.coins = Math.max(0, Math.floor((this.progress.coins || 0) - validAmount));
    this.save();
    eventBus.emit(EVENTS.PROGRESS_CHANGED, { progress: this.progress });
    return this.progress.coins;
  }


  /** 增加星星数量 */
  addStars(amount = 1) {
    const validAmount = Number(amount) || 0;
    this.progress.stars = Math.max(0, Math.floor((this.progress.stars || 0) + validAmount));
    this.save();
    eventBus.emit(EVENTS.PROGRESS_CHANGED, { progress: this.progress });
    return this.progress.stars;
  }

  // 每日签到 — 计算连续天数、奖励星币
  doSignIn() {
    if (this.progress.todaySignedIn) return;
    // 使用 ISO 格式 (YYYY-MM-DD) 统一日期键，与 attendance.dates 保持一致，避免 toDateString 跨午夜或 locale 差异
    const today = this._todayKey();
    const lastDate = this.progress.lastSignInDate;

    // 计算昨天的 ISO key
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = this._fmtKey(yesterdayDate);

    // Streak: only continues if signed in yesterday (使用 ISO 键判定跨日一致)
    if (lastDate === yesterday) {
      this.progress.signInStreak = (this.progress.signInStreak || 0) + 1;
    } else if (lastDate !== today) {
      this.progress.signInStreak = 1;
    } else if (typeof this.progress.signInStreak !== "number") {
      // 兼容老存档 (lastDate === today 但 signInStreak 未初始化)
      this.progress.signInStreak = 1;
    }
    this.progress.lastSignInDate = today;
    this.progress.todaySignedIn = true;
    this.markTodayActive(); // 签到同样点亮热力日历
    // Bonus: 5 base + streak bonus
    const bonus = 5 + Math.min((this.progress.signInStreak || 1) - 1, 10);
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
    if (dayEntry) {
      dayEntry.count = this.progress.todayLearnedCount;
    } else {
      hist.push({ date: todayLabel, count: this.progress.todayLearnedCount });
      this.progress.studyHistory = hist;
    }
    this.save();
    eventBus.emit(EVENTS.PROGRESS_CHANGED, { progress: this.progress });
  }

  // 完成一个汉字的学习（E2: 委托 FSRS 调度，旧兼容字段同步写入）
  completeCharacter(charId, starsEarned = 3) {
    this.markTodayActive();
    const existing = this.progress.charRecords[charId] || {
      charId,
      learnedAt: Date.now(),
      reviewCount: 0,
      correctStreak: 0,
      masteryRate: 75,
      nextReviewDate: Date.now() + 86400000,
      isDifficult: false
    };
    // FSRS 调度（替换固定间隔表 [1,2,4,7,15,30]）
    const updated = fsrsCompleteCharacter(existing, starsEarned);
    this.progress.charRecords[charId] = updated;
    this.progress.coins = (this.progress.coins || 0) + 10;
    this.progress.stars = (this.progress.stars || 0) + starsEarned;
    this.progress.todayLearnedCount = (this.progress.todayLearnedCount || 0) + 1;
    this.progress.currentLevelIndex = Math.min(1490, Math.max(this.progress.currentLevelIndex, Object.keys(this.progress.charRecords).length + 1));
    this.save();
    eventBus.emit(EVENTS.PROGRESS_CHANGED, { progress: this.progress });
    return updated;
  }

  // 完成一次复习（E2: 委托 FSRS 调度）
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
    const updated = fsrsCompleteReview(record, isCorrect);
    this.progress.charRecords[charId] = updated;
    this.save();
    return updated;
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

  /**
   * 记录儿童在特定场景下的做错行为，用于形成错因画像与精准靶向训练
   * @param {string} charId - 汉字ID
   * @param {"similar_confuse"|"reverse_stroke"|"pronunciation"} mistakeType
   * @param {{targetChar?: string, selectedChar?: string, strokeIndex?: number}} details
   */
  recordMistake(charId, mistakeType, details = {}) {
    if (!this.progress.errorProfiles) {
      this.progress.errorProfiles = {
        confusedPairs: {},
        reverseStrokeErrors: {},
        pronunciationErrors: {},
        updatedAt: Date.now()
      };
    }
    const ep = this.progress.errorProfiles;
    if (mistakeType === "similar_confuse" && details.selectedChar) {
      const targetChar = details.targetChar || charId;
      if (!ep.confusedPairs[targetChar]) ep.confusedPairs[targetChar] = {};
      ep.confusedPairs[targetChar][details.selectedChar] = (ep.confusedPairs[targetChar][details.selectedChar] || 0) + 1;
    } else if (mistakeType === "reverse_stroke") {
      ep.reverseStrokeErrors[charId] = (ep.reverseStrokeErrors[charId] || 0) + 1;
    } else if (mistakeType === "pronunciation") {
      ep.pronunciationErrors[charId] = (ep.pronunciationErrors[charId] || 0) + 1;
    }
    ep.updatedAt = Date.now();

    // 主记录：重置连续正确、标记困难、扣分
    const r = this.progress.charRecords[charId];
    if (r) {
      r.correctStreak = 0;
      r.isDifficult = true;
      r.masteryRate = Math.max(0, (r.masteryRate || 50) - 15);
    }

    this.save();
  }

  /**
   * 提取当前孩子混淆频率最高的形近字对，供“火眼金睛辨异同”微关卡靶向出题
   */
  getTopConfusedPair() {
    const ep = this.progress.errorProfiles?.confusedPairs;
    if (!ep || Object.keys(ep).length === 0) return null;
    let best = null;
    let maxCount = 0;
    for (const [target, map] of Object.entries(ep)) {
      for (const [confused, count] of Object.entries(map)) {
        if (count > maxCount) {
          maxCount = count;
          best = { target, confused, count };
        }
      }
    }
    return best;
  }

  // 获取待复习汉字队列（E2: 优先读 FSRS due 字段）
  getDueReviewCharIds() {
    return fsrsGetDueIds(this.progress.charRecords);
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
