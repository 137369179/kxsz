import { CHARACTER_DETAILS } from "../data/characterDetails.js";
import { CHARACTER_DATABASE } from "../data/characters.js";

/**
 * 汉字炼金术 - 词语合成引擎
 * 接收两个单字，检查它们能否根据字库详细数据合成有效双字词。
 * @param {string} char1 第一个汉字
 * @param {string} char2 第二个汉字
 * @returns {object} { success: boolean, word?: string, pinyin?: string, desc?: string }
 */
export function checkSynthesis(char1, char2) {
  if (!char1 || !char2) return { success: false };

  const target1 = char1 + char2;
  const target2 = char2 + char1;
  
  const c1Obj = CHARACTER_DATABASE.find(c => c.char === char1);
  const c2Obj = CHARACTER_DATABASE.find(c => c.char === char2);
  
  if (!c1Obj || !c2Obj) {
    return { success: false };
  }
  
  const details1 = CHARACTER_DETAILS[c1Obj.id]?.words || [];
  const details2 = CHARACTER_DETAILS[c2Obj.id]?.words || [];
  
  const allWords = [...details1, ...details2];
  
  const found = allWords.find(w => w.word === target1 || w.word === target2);
  
  if (found) {
    return {
      success: true,
      word: found.word,
      pinyin: found.pinyin,
      desc: found.desc
    };
  }
  
  return { success: false };
}
