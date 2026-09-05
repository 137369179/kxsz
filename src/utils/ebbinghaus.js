/**
 * 凯茜识字 (Cathy Literacy) - 艾宾浩斯遗忘曲线复习调度与学习分析器
 */

import { eventBus, EVENTS } from "./eventBus.js";
import { storageManager } from "./storageManager.js";
import { findShopItem } from "../data/shop.js";
import { fsrsCompleteCharacter, fsrsCompleteReview, fsrsGetDueIds } from "./fsrsScheduler.js";
import { CHARACTER_DATABASE } from "../data/characters.js";

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
      let raw = null;
      if (activeId && activeId !== "child_1") {
        // 多儿童隔离：二宝等独立档案仅读取专属存档，未存档时初始化全新 defaultState
        raw = storageManager.getItem(`CATHY_LITERACY_PROGRESS_${activeId}`);
      } else {
        // child_1 或未设置档案：优先专属键，兼容回退通用 STORAGE_KEY
        raw = storageManager.getItem("CATHY_LITERACY_PROGRESS_child_1") || storageManager.getItem(STORAGE_KEY);
      }
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
        // P0-4 每日学习总时长上限：null 表示用年龄自适应默认值，家长可手动覆盖
        // 年龄自适应：3-6岁 40min (卫健委) / 6-12岁 60min / 12+岁 90min
        dailyTimeLimitMinutes: null,
        audioLanguage: "mandarin",
        soundEnabled: true,
        strokeTolerance: "standard",  // "strict" | "standard" | "kid"
        focusMode: false,            // E7: 专注模式（减弱动画 + 简化音效）
        // P0-7 家长手动覆盖 LearnModule 步骤序列（null=按年龄自动）
        stepSequenceOverride: null,
        // P0-4 家长可强制跳过每日时长硬限（算术题验证）
        parentCanOverridDailyLimit: true
      },
      shop: {
        owned: ["av_cathy", "av_fairy", "av_hero", "frame_none"],
        equippedFrame: "frame_none",
        equippedDecorations: []
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
      charRecords: {},
      todayLearnedCount: 0,
      // P0-4 今日已学分钟数（用于每日时长硬限）
      dailyStudyMinutes: 0,
      dailyStudyStartedAt: null,     // 今日开始学习的时间戳（用于会话中累计）
      lastActiveDate: today,
      todaySignedIn: false,
      signInStreak: 0,
      lastSignInDate: "",
      todayStudyMs: 0,       // 今日累计学习毫秒（防沉迷每日总量，跨日清零）
      todayStudyDate: "",    // 累计所属日期 YYYY-MM-DD
      dailyLimitTriggered: false, // 今日已完成/触发过上限收尾（跨日重置）
      dailyLimitDate: "",         // 上限触发标记所属日期 YYYY-MM-DD（跨日自动清）
      // P0-B1-3 会话级临时状态（不跨日持久化，跨日 reset 清零）
      _session: {
        lastPrewriteResult: null   // prewriteEngine 完成度 → 供 hanziEngine 调权用
      },
      studyHistory: [
        { date: "周一", count: 0 },
        { date: "周二", count: 0 },
        { date: "周三", count: 0 },
        { date: "周四", count: 0 },
        { date: "周五", count: 0 },
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
        // P0-4 跨日清零学习时长
        merged.dailyStudyMinutes = 0;
        merged.dailyStudyStartedAt = null;
        if (typeof merged.todayStudyMs === "number") merged.todayStudyMs = 0;
        // P0-B1-3 跨日清零会话状态
        merged._session = { lastPrewriteResult: null };
      }
      // 旧存档补齐：用真实日期列表重算连胜（比历史字段可靠）
      merged.attendance.streakDays = this._calcStreak(merged.attendance.dates);

      if (typeof merged.coins !== "number" || isNaN(merged.coins) || merged.coins < 0 || !isFinite(merged.coins)) {
        merged.coins = defaultState.coins;
      } else {
        merged.coins = Math.min(Math.max(0, Math.floor(merged.coins)), 9999999);
      }
      if (typeof merged.stars !== "number" || isNaN(merged.stars) || merged.stars < 0 || !isFinite(merged.stars)) {
        merged.stars = defaultState.stars;
      } else {
        merged.stars = Math.min(Math.max(0, Math.floor(merged.stars)), 999999);
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

  /**
   * 切换儿童档案：保存当前档案，设置活跃 ID，加载目标档案并通知总线
   * @param {string} newProfileId
   * @returns {object} 新档案的 progress
   */
  switchProfile(newProfileId) {
    if (!newProfileId) return this.progress;
    this.save();
    if (typeof storageManager.setActiveProfileId === "function") {
      storageManager.setActiveProfileId(newProfileId);
    }
    this.progress = this.loadProgress();
    try {
      eventBus.emit(EVENTS.PROGRESS_CHANGED, { progress: this.progress });
    } catch {}
    return this.progress;
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

  /**
   * P0-7 年龄自适应步骤序列（B1/B6 铁律）
   *
   * 教育学依据：
   *   3-4 岁（前运算早期）→ 4 步：玩→认→练→测。跳过 Read/控笔/描红/写（皮亚杰前运算早期不具备符号-声音抽象对应）
   *   5-6 岁（前运算晚期）→ 6 步：玩→认→练→控笔→描红→测。跳过 Read 拼音（拼音教学起始于大班末/一年级）和独立写
   *   7+ 岁（具体运算期）→ 8 步全流程
   *
   * 家长可在 settings.stepSequenceOverride 里覆盖此默认序列
   *
   * @param {object} [opts]
   * @param {number} [opts.age] — 可选覆盖年龄，默认取 this.getAge()
   * @param {number[]} [opts.override] — 可选家长手动指定的步骤数组
   * @returns {number[]} 步骤编号数组（1-8 的子集，升序，首=1，尾=8）
   */
  getStepSequence(opts = {}) {
    const age = opts.age ?? this.getAge();

    if (Array.isArray(opts.override) && opts.override.length >= 2) {
      // 家长显式 override：至少 2 步且首末必须是 1 和 8
      const seq = opts.override.filter(n => typeof n === "number" && n >= 1 && n <= 8).sort((a, b) => a - b);
      if (seq[0] !== 1) seq.unshift(1);
      if (seq[seq.length - 1] !== 8) seq.push(8);
      return seq;
    }

    if (age < 5) {
      // 3-4 岁：4 步闭环。教育部指南：3-4 岁"能指认常见汉字"，不需要读/写
      return [1, 2, 4, 8];
    }
    if (age < 7) {
      // 5-6 岁：6 步。5 岁可开始控笔和描红（指南：5-6 岁"会写自己的名字"），但跳过 Read 拼音
      return [1, 2, 4, 5, 6, 8];
    }
    // 7+ 岁：8 步全流程
    return [1, 2, 3, 4, 5, 6, 7, 8];
  }

  /** 返回当前步骤序列的总长度（给 LearnModule 进度条用） */
  getTotalSteps() {
    return this.getStepSequence().length;
  }

  // ================================================================
  // P0-4 每日学习时长硬限（国家卫健委 + WHO 2-18 岁屏幕时间指南）
  // ================================================================

  /**
   * P0-4 年龄自适应每日学习时长上限（分钟）
   *
   * 教育学依据：
   *   3-6 岁（学龄前）→ 40 min/天（卫健委 2021 指南：每次≤20min，累计≤40min）
   *   6-12 岁（小学） → 60 min/天（指南：每次≤30min，累计≤60min）
   *   12+ 岁（初中）  → 90 min/天（指南：每次≤45min，累计≤90min）
   *
   * 如果家长在 ParentModule 设置里手动覆盖（settings.dailyTimeLimitMinutes !== null），
   * 则优先用家长设置的值。
   *
   * @returns {number} 每日上限分钟数
   */
  getDailyLimitMinutes() {
    const override = this.progress?.settings?.dailyTimeLimitMinutes;
    if (typeof override === "number" && override > 0) return Math.min(override, 180); // 硬帽 180min

    const age = this.getAge();
    if (age < 6) return 40;
    if (age < 12) return 60;
    return 90;
  }

  /** P0-4 累加今日已学分钟数（模块进入/退出时调用） */
  addStudyMinutes(minutes) {
    if (!minutes || minutes <= 0) return;
    const limit = this.getDailyLimitMinutes();
    this.progress.dailyStudyMinutes = Math.min(
      limit + 30, // 允许家长 override 后的缓冲上限（最多多给 30min）
      Math.floor((this.progress.dailyStudyMinutes || 0) + minutes)
    );
    this.save();
    eventBus.emit(EVENTS.PROGRESS_CHANGED, { progress: this.progress });
  }

  /**
   * P0-4 检查是否达到今日学习上限
   * @returns {{ reached: boolean, minutesLeft: number, limit: number, current: number }}
   */
  checkDailyLimit() {
    const limit = this.getDailyLimitMinutes();
    const current = this.progress.dailyStudyMinutes || 0;
    const minutesLeft = Math.max(0, limit - current);
    return {
      reached: current >= limit,
      minutesLeft,
      limit,
      current
    };
  }

  /** P0-4 今日上限收尾是否已触发过（跨日自动重置；取消门禁后防反复弹窗） */
  isDailyLimitTriggered() {
    const todayKey = this._fmtKey(new Date());
    if (this.progress.dailyLimitDate !== todayKey) {
      this.progress.dailyLimitDate = todayKey;
      this.progress.dailyLimitTriggered = false;
    }
    return !!this.progress.dailyLimitTriggered;
  }

  /** P0-4 标记今日上限收尾触发状态（家长延长成功后可置 false） */
  markDailyLimitTriggered(flag = true) {
    const todayKey = this._fmtKey(new Date());
    this.progress.dailyLimitDate = todayKey;
    this.progress.dailyLimitTriggered = !!flag;
    this.save();
  }

  /** P0-4 家长通过算术验证后解锁额外学习时长（最多 +30min/次，最多 +2 次/天） */
  overrideDailyLimit(addMinutes = 30) {
    const todayKey = new Date().toDateString();
    const caps = this.progress.dailyOverrideCaps || { date: null, used: 0 };
    if (caps.date !== todayKey) { caps.date = todayKey; caps.used = 0; }
    if (caps.used >= 2) return false;
    caps.used++;
    this.progress.dailyOverrideCaps = caps;
    this.progress.settings.dailyTimeLimitMinutes = (this.progress.settings.dailyTimeLimitMinutes || this.getDailyLimitMinutes()) + addMinutes;
    this.save();
    return true;
  }

  // ================================================================
  // P0-B1-3 prewrite ↔ hanzi 会话状态桥
  // ================================================================

  /** PrewriteEngine 完成后写入完成度（控笔能力信号），供 HanziEngine 调容差 */
  setLastPrewriteResult(result) {
    if (!this.progress._session) this.progress._session = {};
    this.progress._session.lastPrewriteResult = {
      age: result?.age ?? this.getAge(),
      shapesPracticed: Array.isArray(result?.shapesPracticed) ? result.shapesPracticed : [],
      avgCoverage: typeof result?.avgCoverage === "number" ? result.avgCoverage : 0,
      completedAt: result?.completedAt || Date.now()
    };
    // 只写内存 + 轻量 save，不触发 PROGRESS_CHANGED（避免 UI 重渲染）
    try { this.save(); } catch {}
  }

  /** HanziEngine 读取上次 prewrite 完成度（可能为 null = 没练过控笔） */
  getLastPrewriteResult() {
    return this.progress?._session?.lastPrewriteResult || null;
  }

  /** 清空调笔信号（学完一个字后调用，下一字重新练） */
  clearPrewriteResult() {
    if (this.progress?._session) {
      this.progress._session.lastPrewriteResult = null;
      try { this.save(); } catch {}
    }
  }

  /**
   * P0-4 创建会话计时器。模块进入时 start，退出时 stop，跨 document.hidden 暂停。
   * 返回 { stop: () => void } — 调用 stop() 时自动 addStudyMinutes 累加
   */
  createStudySession() {
    let accumulatedVisibleMs = 0;
    let segmentStart = Date.now();
    let stopped = false;

    const onVisChange = () => {
      if (typeof document === "undefined") return;
      if (document.hidden) {
        if (segmentStart != null) {
          accumulatedVisibleMs += Date.now() - segmentStart;
          segmentStart = null;
        }
      } else if (segmentStart == null) {
        segmentStart = Date.now();
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisChange);
      if (this._studySessionCleanups) {
        this._studySessionCleanups.push(() => document.removeEventListener("visibilitychange", onVisChange));
      }
    }

    return {
      stop: () => {
        if (stopped) return 0;
        stopped = true;
        if (typeof document !== "undefined") {
          document.removeEventListener("visibilitychange", onVisChange);
        }
        if (segmentStart != null) {
          accumulatedVisibleMs += Date.now() - segmentStart;
          segmentStart = null;
        }
        // 诚实累计：不足 1 分钟不计；不再强制 +1 分钟虚增
        const minutes = Math.floor(accumulatedVisibleMs / 60000);
        if (minutes > 0) this.addStudyMinutes(minutes);
        return minutes;
      }
    };
  }

  // E7: 专注模式
  isFocusModeEnabled() {
    return !!this.progress.settings.focusMode;
  }

  setFocusMode(enabled) {
    this.progress.settings.focusMode = !!enabled;
    this.save();
    eventBus.emit(EVENTS.FOCUS_MODE_CHANGED, { enabled: this.progress.settings.focusMode });
    // 桥接 focusMode.js 应用 DOM class（reduce-motion 减弱动画 / 大字模式 / 装饰屏蔽）
    import("./focusMode.js").then((fm) => {
      if (enabled) fm.enableFocusMode({ autoReduceMotion: true, muteAchievements: true, enlargeText: true });
      else fm.disableFocusMode();
    }).catch(() => {});
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
    if (validAmount > 0) {
      this.progress.lifetimeCoinsEarned = (this.progress.lifetimeCoinsEarned || 0) + Math.floor(validAmount);
    }
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
    this.progress.lifetimeCoinsEarned = (this.progress.lifetimeCoinsEarned || 0) + 10;
    this.progress.stars = (this.progress.stars || 0) + starsEarned;
    this.progress.todayLearnedCount = (this.progress.todayLearnedCount || 0) + 1;
    this.progress.currentLevelIndex = Math.min(1490, Math.max(this.progress.currentLevelIndex, Object.keys(this.progress.charRecords).length + 1));
    this.save();
    eventBus.emit(EVENTS.PROGRESS_CHANGED, { progress: this.progress });
    return updated;
  }

  /** Increment honest game achievement counters for trophy gates */
  bumpGameStat(key, by = 1) {
    if (!this.progress.gameStats) this.progress.gameStats = {};
    this.progress.gameStats[key] = (this.progress.gameStats[key] || 0) + by;
    this.save();
  }

  // 完成一次复习（E2: 委托 FSRS 调度；可传 boolean 或显式 FSRGRating）
  completeReview(charId, isCorrectOrRating = true) {
    const record = this.progress.charRecords[charId] || {
      charId,
      learnedAt: Date.now(),
      reviewCount: 0,
      correctStreak: 0,
      masteryRate: 60,
      nextReviewDate: Date.now() + 86400000,
      isDifficult: false
    };
    const updated = fsrsCompleteReview(record, isCorrectOrRating);
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

  // ------------------------------------------------------------------
  // P1-3: 发音评测结果落库（滚动均值）— 家长雷达"跟读发音"维度的真实数据源
  // target 可以是单字或词组；逐字映射到 charRecords，无对应记录时创建最小记录
  // ------------------------------------------------------------------
  recordPronunciation(targetText, stars = 3) {
    const clamped = Math.max(1, Math.min(3, Number(stars) || 3));
    const chars = new Set(String(targetText || "").match(/[\u4e00-\u9fa5]/g) || []);
    let touched = 0;
    for (const ch of chars) {
      const entry = CHARACTER_DATABASE.find((c) => c.char === ch);
      if (!entry) continue;
      const rec = this.progress.charRecords[entry.id] || {
        charId: entry.id,
        learnedAt: Date.now(),
        reviewCount: 0,
        correctStreak: 0,
        masteryRate: 60,
        nextReviewDate: Date.now() + 86400000,
        isDifficult: false,
      };
      const prevSum = (rec.pronAvg || 0) * (rec.pronCount || 0);
      const count = (rec.pronCount || 0) + 1;
      rec.pronAvg = Math.round(((prevSum + clamped) / count) * 100) / 100;
      rec.pronCount = count;
      this.progress.charRecords[entry.id] = rec;
      touched += 1;
    }
    if (touched) this.save();
    return touched;
  }

  /**
   * P1-3: 家长端学习四维画像（全部真实数据，无采样显示 null）
   * 认读掌握 = 已学字 masteryRate 均值；记忆巩固 = 连对次数归一；
   * 跟读发音 = pronAvg(1~3) 折算百分制；识字广度 = 已学/1489
   */
  getRadarStats() {
    const records = Object.values(this.progress.charRecords || {});
    const avg = (arr) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null);
    const mastery = avg(records.map((r) => Math.round(r.masteryRate || 0)));
    const consolidation = records.length
      ? Math.round(records.reduce((a, r) => a + Math.min(100, Math.round(((r.correctStreak || 0) / 5) * 100)), 0) / records.length)
      : null;
    const pronRecs = records.filter((r) => (r.pronCount || 0) > 0);
    const pronunciation = pronRecs.length
      ? Math.round((pronRecs.reduce((a, r) => a + (r.pronAvg || 0), 0) / pronRecs.length) * 100 / 3)
      : null;
    const TOTAL_CHARS = 1489;
    const breadth = Math.round((records.length / TOTAL_CHARS) * 100);
    return { mastery, consolidation, pronunciation, breadth, learned: records.length, pronSample: pronRecs.length };
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
      this.progress.shop = { owned: ["av_cathy", "av_fairy", "av_hero", "frame_none"], equippedFrame: "frame_none", equippedDecorations: [] };
    }
    this.progress.shop.equippedFrame = id;
    if (!this.progress.profile) this.progress.profile = {};
    this.progress.profile.frame = id;
    this.save();
    eventBus.emit(EVENTS.PROGRESS_CHANGED, { progress: this.progress });
  }

  getEquippedDecorations() {
    if (!this.progress.shop) return [];
    return this.progress.shop.equippedDecorations || [];
  }

  equipDecoration(id) {
    if (!this.progress.shop) {
      this.progress.shop = { owned: ["av_cathy", "av_fairy", "av_hero", "frame_none"], equippedFrame: "frame_none", equippedDecorations: [] };
    }
    if (!this.progress.shop.equippedDecorations) {
      this.progress.shop.equippedDecorations = [];
    }
    if (!this.progress.shop.equippedDecorations.includes(id)) {
      this.progress.shop.equippedDecorations.push(id);
    }
    this.save();
    eventBus.emit(EVENTS.PROGRESS_CHANGED, { progress: this.progress });
  }

  unequipDecoration(id) {
    if (!this.progress.shop || !this.progress.shop.equippedDecorations) return;
    this.progress.shop.equippedDecorations = this.progress.shop.equippedDecorations.filter(d => d !== id);
    this.save();
    eventBus.emit(EVENTS.PROGRESS_CHANGED, { progress: this.progress });
  }

  purchase(id) {
    if (!this.progress.shop) {
      this.progress.shop = { owned: ["av_cathy", "av_fairy", "av_hero", "frame_none"], equippedFrame: "frame_none", equippedDecorations: [] };
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
