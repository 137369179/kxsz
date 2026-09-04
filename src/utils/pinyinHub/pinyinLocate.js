/** PinyinModule — atlas locate helper */
import { PINYIN_INITIALS, PINYIN_FINALS } from "../../data/pinyinList.js";

export function locatePinyin(pinyinStr) {
  if (!pinyinStr) return;
  const clean = String(pinyinStr).replace(/[^a-zA-Z]/g, "").toLowerCase();
  const foundInit = PINYIN_INITIALS.find(x => x.pinyin === clean || clean.startsWith(x.pinyin));
  if (foundInit) {
    this.currentTab = "atlas";
    this.selectedCategory = "initial";
    this.selectedPinyin = foundInit;
    return;
  }
  const foundFinal = PINYIN_FINALS.find(x => x.pinyin === clean || clean.endsWith(x.pinyin));
  if (foundFinal) {
    this.currentTab = "atlas";
    this.selectedCategory = "final";
    this.selectedPinyin = foundFinal;
  }
}
