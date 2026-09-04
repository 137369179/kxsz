/**
 * Build an honest post-read stage-1 quiz: pick target among lookalikes / distractors.
 * Never uses self-report options like "我认识".
 */
import { CHARACTER_DATABASE } from "../../data/characters.js";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * @param {object} book
 * @returns {{ title: string, question: string, highlightChar: string, options: string[], correctIndex: number, speakPrompt: string }}
 */
export function buildBookStage1Quiz(book) {
  const targetChar = (book.targetChars || ["日"])[0];
  const target = CHARACTER_DATABASE.find((c) => c.char === targetChar)
    || { char: targetChar, pinyin: "", id: null };

  const distractors = CHARACTER_DATABASE
    .filter((c) => c.char !== targetChar)
    .filter((c) => {
      if (target.radical && c.radical === target.radical) return true;
      if (target.strokeCount && Math.abs((c.strokeCount || 0) - target.strokeCount) <= 1) return true;
      if (target.stage && c.stage === target.stage) return true;
      return false;
    })
    .slice(0, 24);

  const pool = distractors.length >= 3
    ? distractors
    : CHARACTER_DATABASE.filter((c) => c.char !== targetChar).slice(0, 40);

  const picks = shuffle(pool).slice(0, 3).map((c) => c.char);
  while (picks.length < 3) {
    const fallback = ["木", "目", "田", "口", "人"].find((ch) => ch !== targetChar && !picks.includes(ch));
    if (!fallback) break;
    picks.push(fallback);
  }

  const options = shuffle([targetChar, ...picks.slice(0, 3)]);
  const correctIndex = Math.max(0, options.indexOf(targetChar));
  const py = target.pinyin ? `（${target.pinyin}）` : "";

  return {
    title: "【第 1 关 · 生字眼力大考验】",
    question: `听一听、认一认：哪个是故事里的生字${py}？`,
    highlightChar: "",
    options,
    correctIndex,
    speakPrompt: targetChar,
    mode: "pick_char"
  };
}
