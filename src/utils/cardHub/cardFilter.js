/** CardModule — list filtering */
import { CHARACTER_DATABASE } from "../../data/characters.js";
import { ebbinghausManager } from "../ebbinghaus.js";

export function getFilteredList() {
  const progress = ebbinghausManager.progress;
  let filteredChars = CHARACTER_DATABASE;

  // 1. 状态筛选
  if (this.currentFilter === "learned") {
    filteredChars = filteredChars.filter((c) => !!progress.charRecords[c.id]);
  } else if (this.currentFilter === "review") {
    const dueIds = ebbinghausManager.getDueReviewCharIds();
    filteredChars = filteredChars.filter((c) => dueIds.includes(c.id));
  } else if (this.currentFilter === "difficult") {
    const diffIds = ebbinghausManager.getDifficultCharIds();
    filteredChars = filteredChars.filter((c) => diffIds.includes(c.id));
  }

  // 2. 三大阶段筛选
  if (this.currentStage !== "all") {
    filteredChars = filteredChars.filter((c) => (c.stage || 1) === parseInt(this.currentStage, 10));
  }

  // 3. 偏旁部首筛选
  if (this.selectedRadical !== "all") {
    filteredChars = filteredChars.filter((c) => c.radical === this.selectedRadical);
  }

  // 4. 搜索过滤
  if (this.searchQuery.trim()) {
    const q = this.searchQuery.trim().toLowerCase();
    filteredChars = filteredChars.filter((c) => c.char.includes(q) || (c.pinyin && c.pinyin.toLowerCase().includes(q)));
  }

  return filteredChars;
}

