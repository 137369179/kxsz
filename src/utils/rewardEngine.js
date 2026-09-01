/**
 *  (Cathy Literacy) - 
 * ------------------------------------------------------------
 * charRecords / readBooks / attendance / stars
 *   1.  ——  + emoji + 
 *   2.  ——  /  /  /  / 
 *   3.  ——  + /
 * "" progress.seenMedals 
 */

import { CHARACTER_DATABASE } from "../data/characters.js";
import { STORYBOOKS_DATABASE } from "../data/books.js";
import { ebbinghausManager } from "./ebbinghaus.js";
import { SHOP_AVATARS, SHOP_FRAMES, FRAME_CLASSES } from "../data/shop.js";

// ---------------------------------------------------------------------------
//  YYYY-MM-DD
// ---------------------------------------------------------------------------
export function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** / */
export function computeStreaks(dates) {
  const set = new Set(dates || []);
  const cursor = new Date();
  if (!set.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  let current = 0;
  while (set.has(dateKey(cursor))) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const sorted = Array.from(set).sort();
  let best = 0;
  let run = 0;
  let prev = null;
  for (const key of sorted) {
    const gap = prev ? Date.parse(`${key}T00:00:00`) - Date.parse(`${prev}T00:00:00`) : -1;
    run = gap === 86400000 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = key;
  }
  return { current, best };
}

/** cell = { key|null, day, active, isToday } */
export function buildMonthMatrix(year, monthIdx, activeSet, todayKey) {
  const first = new Date(year, monthIdx, 1);
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  // getDay(): 0= → 
  const lead = (first.getDay() + 6) % 7;

  const cells = [];
  for (let i = 0; i < lead; i += 1) cells.push({ key: null, day: 0, active: false, isToday: false });
  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = dateKey(new Date(year, monthIdx, day));
    cells.push({ key, day, active: activeSet.has(key), isToday: key === todayKey });
  }
  while (cells.length % 7 !== 0) cells.push({ key: null, day: 0, active: false, isToday: false });

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

// ---------------------------------------------------------------------------
// 
// ---------------------------------------------------------------------------
export function getStickers() {
  const records = ebbinghausManager.progress.charRecords || {};
  const earned = [];
  for (const charItem of CHARACTER_DATABASE) {
    const rec = records[charItem.id];
    if (rec) {
      earned.push({
        charId: charItem.id,
        char: charItem.char,
        pinyin: charItem.pinyin,
        emoji: charItem.char,
        stage: charItem.stage,
        earnedAt: rec.learnedAt || 0,
        masteryRate: rec.masteryRate || 0
      });
    }
  }
  earned.sort((a, b) => a.earnedAt - b.earnedAt);

  const learnedIds = new Set(Object.keys(records));
  const upcoming = CHARACTER_DATABASE.filter((c) => !learnedIds.has(c.id)).slice(0, 12);

  return {
    earned,
    upcoming,
    total: CHARACTER_DATABASE.length,
    earnedCount: earned.length
  };
}

// ---------------------------------------------------------------------------
// 
// ---------------------------------------------------------------------------
export function getMedals() {
  const p = ebbinghausManager.progress;
  const records = Object.values(p.charRecords || {});
  const learned = records.length;
  const totalReviews = records.reduce((s, r) => s + (r.reviewCount || 0), 0);
  const perfectWrites = records.filter((r) => (r.masteryRate || 0) >= 95).length;
  const streak = (p.attendance && p.attendance.streakDays) || 0;
  const booksRead = (p.readBooks || []).length;
  const booksTotal = STORYBOOKS_DATABASE.length;
  const charsTotal = CHARACTER_DATABASE.length;

  const defs = [
    { id: "first_char",   name: "识字萌新",   emoji: "", tier: "bronze",  desc: "学习第一个汉字",     current: Math.min(learned, 1),        target: 1 },
    { id: "chars_10",     name: "小试牛刀",   emoji: "", tier: "bronze",  desc: "累计学习 10 字",   current: learned,                     target: 10 },
    { id: "chars_50",     name: "渐入佳境", emoji: "", tier: "silver",  desc: "累计学习 50 字",   current: learned,                     target: 50 },
    { id: "chars_100",    name: "百字达人",   emoji: "", tier: "gold",    desc: "累计学习 100 字",  current: learned,                     target: 100 },
    { id: "chars_300",    name: "三百壮士",   emoji: "", tier: "gold",    desc: "累计学习 300 字",  current: learned,                     target: 300 },
    { id: "chars_600",    name: "学富五车",   emoji: "", tier: "gold",   desc: "累计学习 600 字",  current: learned,                     target: 600 },
    { id: "chars_1000",   name: "千字宗师",   emoji: "", tier: "rainbow", desc: "累计学习 1000 字", current: learned,                     target: 1000 },
    { id: "chars_all",    name: "识字大王", emoji: "", tier: "rainbow", desc: `学完全部 ${charsTotal} 字`, current: learned,              target: charsTotal },
    { id: "review_10",    name: "温故知新",   emoji: "", tier: "bronze",  desc: "复习汉字 10 次",     current: totalReviews,                target: 10 },
    { id: "review_50",    name: "过目不忘",   emoji: "", tier: "gold",    desc: "复习汉字 50 次",     current: totalReviews,                target: 50 },
    { id: "write_10",     name: "妙笔生花",   emoji: "", tier: "silver",  desc: "10次书写得分超95%", current: perfectWrites,       target: 10 },
    { id: "star_100",     name: "满天星辰",   emoji: "", tier: "silver",  desc: "累计获得 100 颗星星",  current: p.stars || 0,                target: 100 },
    { id: "streak_7",     name: "坚持不懈",   emoji: "", tier: "bronze",  desc: "连续打卡 7 天",      current: streak,                      target: 7 },
    { id: "streak_30",    name: "自律王者",   emoji: "", tier: "gold",   desc: "连续打卡 30 天",     current: streak,                      target: 30 },
    { id: "books_1",      name: "书香门第",   emoji: "", tier: "bronze",  desc: "阅读第一本绘本",     current: Math.min(booksRead, 1),      target: 1 },
    { id: "books_all",    name: "博览群书",   emoji: "", tier: "rainbow", desc: `阅读全部 ${booksTotal} 本`, current: booksRead,        target: booksTotal }
  ];

  const seen = new Set(ebbinghausManager.progress.seenMedals || []);
  return defs.map((d) => {
    const ratio = d.target > 0 ? Math.min(1, d.current / d.target) : 0;
    return {
      ...d,
      earned: d.current >= d.target,
      ratio,
      isNew: d.current >= d.target && !seen.has(d.id)
    };
  });
}

// ---------------------------------------------------------------------------
// 
// ---------------------------------------------------------------------------
export function getCalendar(year, monthIdx) {
  const dates = (ebbinghausManager.progress.attendance && ebbinghausManager.progress.attendance.dates) || [];
  const activeSet = new Set(dates);
  const { current, best } = computeStreaks(dates);
  const monthActive = Array.from(activeSet).filter((k) => {
    const [y, m] = k.split("-").map(Number);
    return y === year && m - 1 === monthIdx;
  }).length;

  return {
    weeks: buildMonthMatrix(year, monthIdx, activeSet, dateKey(new Date())),
    current,
    best,
    monthActive,
    totalActiveDays: activeSet.size,
    year,
    monthIdx
  };
}

/**  id */
export function getNewMedalIds() {
  return getMedals().filter((m) => m.isNew).map((m) => m.id);
}

// ---------------------------------------------------------------------------
//  / 
// ---------------------------------------------------------------------------
export function getShopData() {
  const p = ebbinghausManager.progress;
  const decorate = (item) => ({
    ...item,
    owned: ebbinghausManager.isOwned(item.id),
    equipped:
      item.type === "avatar"
        ? p.profile.avatar === item.value
        : p.shop.equippedFrame === item.id,
    affordable: p.coins >= item.price,
    frameClass: FRAME_CLASSES[item.id] || ""
  });
  return {
    coins: p.coins,
    avatars: SHOP_AVATARS.map(decorate),
    frames: SHOP_FRAMES.map(decorate),
    equippedFrame: p.shop.equippedFrame
  };
}
