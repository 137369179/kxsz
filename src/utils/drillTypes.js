/**
 * src/utils/drillTypes.js
 * ================================================================
 * E4 扩展题型（3 种）
 * ─────────────────────────────────────────────────────────────
 * 1. cloze_fill      — 完形填空（句子中挖 1~2 个空，选字填入）
 * 2. pinyin_read     — 拼音拼读（显示生字+释义，输入/选择拼音）
 * 3. picture_write   — 看图写字（看图提示，选择正确汉字）
 *
 * 每个题型导出：
 *   - meta: { name, tip, iconSvg }
 *   - render(char, allChars): { promptHTML, optionsHTML, correctIndex, chars }
 *   - validate(choiceIndex, correctIndex): boolean
 *   - canApply(char): boolean  // 是否可用于该汉字
 * ─────────────────────────────────────────────────────────────
 */

/** Cloze 填空 — 难度分级 */
const CLOZE_DIFFICULTY = {
  easy: { blanks: 1, distractors: 2 },
  medium: { blanks: 1, distractors: 3 },
  hard: { blanks: 2, distractors: 3 },
};

/**
 * Cloze 填空：在句子中挖掉 1~2 个核心字
 * @param {object} char 汉字对象 {char, sentence, words}
 * @param {string[]} allChars 全部汉字库（用于干扰项）
 * @returns {object|null} 题目，若不可用返回 null
 */
export function clozeFill(char, allChars = []) {
  if (!char.sentence || !char.sentence.includes(char.char)) return null;
  const difficulty = "medium";
  const { blanks, distractors } = CLOZE_DIFFICULTY[difficulty];

  // 从句子中找与 char.char 相关的词
  const sentence = char.sentence;
  const blanked = sentence.split(char.char).join("（　）");

  // 干扰项：3 个形近字 + 3 个随机字 = 6 个候选，挖 1 个空时选 3 个
  const confusing = (char.confusingChars || []).slice(0, 2);
  const randoms = shuffle(
    (allChars || []).filter((x) => x.char !== char.char && !(confusing || []).includes(x.char))
  ).slice(0, Math.max(1, distractors - confusing.length));
  const distractorChars = shuffle([...confusing, ...randoms.map((r) => r.char)])
    .slice(0, distractors);

  const options = shuffle([char.char, ...distractorChars]);
  const correctIndex = options.indexOf(char.char);

  const promptHTML = `
    <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30
                border-2 border-purple-300 rounded-2xl px-6 py-4 flex flex-col items-center gap-3">
      <div class="text-xs font-bold text-purple-700 uppercase tracking-wider">📖 句子填空</div>
      <div class="text-2xl font-bold leading-relaxed text-gray-800 dark:text-gray-100">
        ${escapeHtml(blanked)}
      </div>
      <div class="text-sm text-purple-600">（把生字宝宝送回句子中）</div>
    </div>
  `;

  const optionsHTML = options
    .map(
      (c, i) =>
        `<button data-cloze-option="${i}"
          class="cloze-option min-w-[100px] h-20 rounded-2xl border-2 border-purple-300
                 bg-white text-4xl font-bold text-gray-800 shadow-md
                 hover:scale-105 active:scale-95 transition-transform">${escapeHtml(c)}</button>`
    )
    .join("");

  return { promptHTML, optionsHTML, correctIndex, options, type: "cloze_fill" };
}

/**
 * 拼音拼读：显示生字，给出拼音选项
 * @param {object} char {char, pinyin, words}
 * @param {string[]} allChars
 * @returns {object|null}
 */
export function pinyinRead(char, allChars = []) {
  if (!char.pinyin) return null;

  // 从 words 提取含 char.char 的词条作为释义
  const word = (char.words || []).find((w) => w.word.includes(char.char));
  const hint = word ? `${word.word}（${word.pinyin || ""}）` : char.meaning || "";

  // 干扰项：3 个相似拼音
  const correctPinyin = char.pinyin;
  const distractorPinyins = generateDistractorPinyins(correctPinyin, allChars);

  const options = shuffle([correctPinyin, ...distractorPinyins]);
  const correctIndex = options.indexOf(correctPinyin);

  const promptHTML = `
    <div class="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30
                border-2 border-cyan-300 rounded-2xl px-6 py-4 flex flex-col items-center gap-3">
      <div class="text-xs font-bold text-cyan-700 uppercase tracking-wider">🎵 拼音拼读</div>
      <div class="text-7xl font-bold text-gray-800 dark:text-gray-100">${escapeHtml(char.char)}</div>
      <div class="text-sm text-cyan-600">${escapeHtml(hint)}</div>
      <button data-pinyin-speak class="mt-2 px-4 py-2 rounded-full bg-cyan-500 text-white text-sm font-bold
              hover:bg-cyan-600 transition-colors">🔊 听发音</button>
    </div>
  `;

  const optionsHTML = options
    .map(
      (p, i) =>
        `<button data-pinyin-option="${i}"
          class="pinyin-option min-w-[140px] h-16 rounded-2xl border-2 border-cyan-300
                 bg-white text-2xl font-bold text-gray-800 shadow-md
                 hover:scale-105 active:scale-95 transition-transform px-4">${escapeHtml(p)}</button>`
    )
    .join("");

  return { promptHTML, optionsHTML, correctIndex, options, type: "pinyin_read" };
}

/**
 * 看图写字：给图片（emoji/象形字）提示，选出对应汉字
 * @param {object} char {char, oracleGlyph, meaning, words}
 * @param {string[]} allChars
 * @returns {object|null}
 */
export function pictureWrite(char, allChars = []) {
  // 优先用 oracleGlyph（甲骨文），否则用 meaning 或第一个 word
  const pictureHint = char.oracleGlyph || char.glyph || char.char;
  const meaning = char.meaning || (char.words && char.words[0] && char.words[0].word) || "";

  const confusing = (char.confusingChars || []).slice(0, 2);
  const randoms = shuffle(
    (allChars || []).filter((x) => x.char !== char.char && !(confusing || []).includes(x.char))
  )
    .slice(0, 3 - confusing.length)
    .map((r) => r.char);
  const distractorChars = [...confusing, ...randoms];
  const options = shuffle([char.char, ...distractorChars]);
  const correctIndex = options.indexOf(char.char);

  const promptHTML = `
    <div class="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30
                border-2 border-amber-300 rounded-2xl px-6 py-4 flex flex-col items-center gap-3">
      <div class="text-xs font-bold text-amber-700 uppercase tracking-wider">🖼️ 看图写字</div>
      <div class="text-8xl font-bold text-gray-800 dark:text-gray-100">${escapeHtml(pictureHint)}</div>
      <div class="text-sm text-amber-600">${escapeHtml(meaning)}</div>
    </div>
  `;

  const optionsHTML = options
    .map(
      (c, i) =>
        `<button data-picture-option="${i}"
          class="picture-option min-w-[100px] h-20 rounded-2xl border-2 border-amber-300
                 bg-white text-4xl font-bold text-gray-800 shadow-md
                 hover:scale-105 active:scale-95 transition-transform">${escapeHtml(c)}</button>`
    )
    .join("");

  return { promptHTML, optionsHTML, correctIndex, options, type: "picture_write" };
}

// ── 元数据（与 drillEngine 的 TYPE_META 结构对齐）────────────

export const NEW_TYPE_META = {
  cloze_fill: {
    name: "完形填空",
    tip: "把生字宝宝送回句子中",
    iconSvg: (cls) => `<svg class="${cls}" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
    renderer: clozeFill,
  },
  pinyin_read: {
    name: "拼音拼读",
    tip: "听准发音，选出对应拼音",
    iconSvg: (cls) => `<svg class="${cls}" viewBox="0 0 24 24"><path d="M12 2L2 12h3v8h14v-8h3z" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
    renderer: pinyinRead,
  },
  picture_write: {
    name: "看图写字",
    tip: "观察图景，选出正确的汉字",
    iconSvg: (cls) => `<svg class="${cls}" viewBox="0 0 24 24"><path d="M3 3h18v18H3z" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
    renderer: pictureWrite,
  },
};

/**
 * 检查汉字是否能用某个新题型
 */
export function canApplyNewType(type, char) {
  if (!char) return false;
  switch (type) {
    case "cloze_fill":
      return !!(char.sentence && char.sentence.includes(char.char));
    case "pinyin_read":
      return !!char.pinyin;
    case "picture_write":
      return true; // 任何字都可以用图提示（fallback 到 char 本身）
    default:
      return false;
  }
}

// ── 工具函数 ─────────────────────────────────────────────────

function shuffle(arr) {
  const a = (arr || []).slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * 生成 3 个相似拼音（替换声母/韵母/声调）
 */
function generateDistractorPinyins(correct, allChars) {
  if (!correct) return [];
  const distractorSet = new Set();
  // 从字符库找拼音相近的
  const sameInitChars = (allChars || []).filter((c) =>
    c.pinyin && c.pinyin !== correct && sharesInitial(c.pinyin, correct)
  );
  for (const c of shuffle(sameInitChars).slice(0, 2)) {
    distractorSet.add(c.pinyin);
  }
  // 随机字符库
  for (const c of shuffle(allChars || [])) {
    if (distractorSet.size >= 3) break;
    if (c.pinyin && c.pinyin !== correct && !distractorSet.has(c.pinyin)) {
      distractorSet.add(c.pinyin);
    }
  }
  // fallback
  while (distractorSet.size < 3) {
    const fake = correct.replace(/[aeiou]/g, (m) =>
      m === "a" ? "o" : m === "e" ? "i" : m === "i" ? "u" : "a"
    ) + Math.floor(Math.random() * 4 + 1);
    if (fake !== correct) distractorSet.add(fake);
  }
  return Array.from(distractorSet).slice(0, 3);
}

function sharesInitial(a, b) {
  if (!a || !b) return false;
  // 简易声母检查
  return a.charAt(0) === b.charAt(0);
}
