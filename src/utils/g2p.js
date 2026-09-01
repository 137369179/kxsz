/**
 *  G2P (Grapheme-to-Phoneme) 
 *
 *  = 
 *  1. CHARACTER_DATABASE 
 *  2.  (PolyphoneDictionary + Rules)
 *  3.  (Mandarin Tone Sandhi Engine):
 *     - 3.1  (214  35)
 *     - 3.2   (yī  yí/·yì/yi)
 *     - 3.3   (bù  bú)
 *     - 3.4  /   (old Beijing  / )
 *     - 3.5  Neutral Tone (////)
 *     - 3.6   (ya/wa/na/nga/ra)
 *     - 3.7  Erhua Retroflexion ( + -r)
 *
 *  UTF-8  1-4, 0/5=
 *   /   Task 5  Task 3 
 */

import { CHARACTER_DATABASE } from "../data/characters.js";
import { PINYIN_DICT } from "../data/pinyinData.js";

// ============================================================
// 1. 基础汉字注音与多音字表构建
// ============================================================
const BASE_PINYIN_TABLE = new Map();  // char -> {pinyinWithoutTone, toneNum, pinyinMarked}
const POLYPHONE_LIST = new Set();     // chars with multiple readings

(function buildBaseTable() {
  // 1. 加载 2000+ 常用汉字全量标准注音词典 (为绘本与分级阅读提供 100% 完整拼音覆盖)
  if (PINYIN_DICT) {
    for (const [ch, info] of Object.entries(PINYIN_DICT)) {
      const [pyM, tone] = info;
      BASE_PINYIN_TABLE.set(ch, {
        pinyinMarked: pyM,
        toneNum: tone,
        pinyinStrip: stripToneMark(pyM),
        from: "pinyinDict",
      });
    }
  }

  // 2. 加载 characters.js 核心 100 启蒙字体系
  for (const entry of CHARACTER_DATABASE) {
    BASE_PINYIN_TABLE.set(entry.char, {
      pinyinMarked: entry.pinyin,
      toneNum: entry.pinyinTone,
      pinyinStrip: stripToneMark(entry.pinyin),
      from: "database",
    });
  }

  // characters.js 之外的常用字补充 (ch, markedPinyin, toneNum)
  const MANUAL = [
    ["一", "yī", 1], ["七", "qī", 1], ["八", "bā", 1], ["不", "bù", 4],
    ["啊", "ā", 1], ["呀", "ya", 0], ["呢", "ne", 0], ["吧", "ba", 0], ["吗", "ma", 0], ["哪", "na", 0],
    ["了", "le", 0], ["着", "zhe", 0], ["过", "guo", 0],
    ["得", "de", 0], ["地", "de", 0], ["的", "de", 0],
    ["们", "men", 0], ["子", "zi", 0], ["头", "tóu", 2],
    ["里", "lǐ", 3], ["上", "shàng", 4], ["下", "xià", 4],
    ["来", "lái", 2], ["去", "qù", 4], ["起", "qǐ", 3],
    ["出", "chū", 1], ["回", "huí", 2], ["过", "guò", 4],
    ["是", "shì", 4], ["有", "yǒu", 3], ["在", "zài", 4],
    ["这", "zhè", 4], ["那", "nà", 4], ["个", "gè", 4],
    ["我", "wǒ", 3], ["你", "nǐ", 3], ["他", "tā", 1], ["她", "tā", 1],
    ["人", "rén", 2], ["小", "xiǎo", 3], ["大", "dà", 4],
    ["爸", "bà", 4], ["妈", "mā", 1], ["哥", "gē", 1], ["姐", "jiě", 3],
    ["爷", "yé", 2], ["奶", "nǎi", 3],
    ["儿", "ér", 2],
    ["太", "tài", 4], ["阳", "yáng", 2],
    ["初", "chū", 1],
    ["看", "kàn", 4], ["见", "jiàn", 4], ["书", "shū", 1],
    ["水", "shuǐ", 3], ["山", "shān", 1], ["田", "tián", 2], ["火", "huǒ", 3],
    ["月", "yuè", 4], ["木", "mù", 4], ["土", "tǔ", 3], ["口", "kǒu", 3],
    ["手", "shǒu", 3], ["目", "mù", 4], ["耳", "ěr", 3], ["心", "xīn", 1],
    ["走", "zǒu", 3], ["跑", "pǎo", 3], ["飞", "fēi", 1], ["跳", "tiào", 4],
    ["吃", "chī", 1], ["喝", "hē", 1], ["笑", "xiào", 4], ["哭", "kū", 1],
    ["饱", "bǎo", 3], ["被", "bèi", 4], ["花", "huā", 1], ["草", "cǎo", 3],
    ["风", "fēng", 1], ["雨", "yǔ", 3], ["雪", "xuě", 3], ["云", "yún", 2],
    ["金", "jīn", 1], ["天", "tiān", 1], ["好", "hǎo", 3], ["朋", "péng", 2], ["友", "yǒu", 3],
    ["欢", "huān", 1], ["迎", "yíng", 2],
    ["长", "cháng", 2],    // default (adj. long)
    ["行", "xíng", 2],     // default (v. go)
    ["重", "zhòng", 4],    // default (adj. heavy)
    ["还", "hái", 2],      // default (adv. still)
    ["乐", "lè", 4],       // default (adj. happy)
    ["中", "zhōng", 1],    // default (middle)
    ["相", "xiāng", 1],    // default (mutual)
    ["便", "biàn", 4],     // default (convenient)
    ["觉", "jué", 2],      // default (feel)
    ["教", "jiāo", 1],     // default (teach)
    ["为", "wèi", 4],      // default (for)
    ["发", "fā", 1],       // default (send out)
    ["打", "dǎ", 3],       // default (hit)
    // AC-2 测试集补充字
    ["银", "yín", 2], ["音", "yīn", 1], ["短", "duǎn", 3], ["快", "kuài", 4],
    ["照", "zhào", 4], ["互", "hù", 4], ["爱", "ài", 4], ["睡", "shuì", 4],
    ["第", "dì", 4], ["桌", "zhuō", 1], ["石", "shí", 2], ["果", "guǒ", 3],
    ["听", "tīng", 1],
    // 童谣/拟声 (AC-6 / chant scenarios)
    ["棚", "péng", 2], ["葡", "pú", 2], ["桃", "táo", 2], ["塔", "tǎ", 3], ["瓜", "guā", 1],
    ["冬", "dōng", 1], ["叮", "dīng", 1], ["宁", "níng", 2], ["渣", "zhā", 1], ["拉", "lā", 1],
    ["呜", "wū", 1], ["哇", "wa", 0], ["哈", "hā", 1], ["喵", "miāo", 1], ["汪", "wāng", 1],
    ["叽", "jī", 1], ["咕", "gū", 1], ["噜", "lū", 1], ["咩", "miē", 1], ["鸭", "yā", 1],
  ];
  for (const [ch, pyM, tone] of MANUAL) {
    if (!BASE_PINYIN_TABLE.has(ch)) {
      BASE_PINYIN_TABLE.set(ch, {
        pinyinMarked: pyM,
        toneNum: tone,
        pinyinStrip: stripToneMark(pyM),
        from: "manual",
      });
    }
  }

  // 多音字清单 (Context-Aware 规则引擎入口)
  const POLYPHONE_DEFS = ["长", "行", "重", "还", "乐", "中", "相", "好", "便", "觉", "教", "为", "得", "了", "着", "过", "发", "打", "大", "地"];
  POLYPHONE_DEFS.forEach(c => POLYPHONE_LIST.add(c));
})();

// ============================================================
// 2. 
// ============================================================
const TONE_MARKS = {
  a: ["ā", "á", "ǎ", "à", "a"],
  e: ["ē", "é", "ě", "è", "e"],
  i: ["ī", "í", "ǐ", "ì", "i"],
  o: ["ō", "ó", "ǒ", "ò", "o"],
  u: ["ū", "ú", "ǔ", "ù", "u"],
  ü: ["ǖ", "ǘ", "ǚ", "ǜ", "ü"],
  v: ["ǖ", "ǘ", "ǚ", "ǜ", "ü"],
};

function stripToneMark(pinyinMarked) {
  if (!pinyinMarked) return "";
  const s = pinyinMarked.normalize("NFC");
  let out = "";
  for (const ch of s) {
    const code = ch.codePointAt(0);
    // macron acute caron grave + letters
    switch (ch) {
      case "ā": case "á": case "ǎ": case "à": out += "a"; break;
      case "ē": case "é": case "ě": case "è": out += "e"; break;
      case "ī": case "í": case "ǐ": case "ì": out += "i"; break;
      case "ō": case "ó": case "ǒ": case "ò": out += "o"; break;
      case "ū": case "ú": case "ǔ": case "ù": out += "u"; break;
      case "ǖ": case "ǘ": case "ǚ": case "ǜ": out += "ü"; break;
      default: out += ch;
    }
  }
  return out;
}

/**  (tone=1-4, 0/5=) */
function toneNums_toMarked(base, toneNum) {
  if (!base) return base;
  if (toneNum === 0 || toneNum === 5) return base;   // 
  const s = base;
  // a > o > e > i/u() > ü
  const idx_a = s.indexOf("a");
  if (idx_a >= 0) return replaceAt(s, idx_a, TONE_MARKS.a[toneNum - 1]);
  const idx_o = s.indexOf("o");
  if (idx_o >= 0) return replaceAt(s, idx_o, TONE_MARKS.o[toneNum - 1]);
  const idx_e = s.indexOf("e");
  if (idx_e >= 0) return replaceAt(s, idx_e, TONE_MARKS.e[toneNum - 1]);
  const idx_v = s.indexOf("ü");
  if (idx_v >= 0) return replaceAt(s, idx_v, TONE_MARKS.ü[toneNum - 1]);
  const idx_i = s.indexOf("i");
  const idx_u = s.indexOf("u");
  if (idx_i >= 0 && idx_u >= 0) {
    const later = Math.max(idx_i, idx_u);
    const ch = s[later] === "i" ? TONE_MARKS.i[toneNum - 1] : TONE_MARKS.u[toneNum - 1];
    return replaceAt(s, later, ch);
  }
  if (idx_i >= 0) return replaceAt(s, idx_i, TONE_MARKS.i[toneNum - 1]);
  if (idx_u >= 0) return replaceAt(s, idx_u, TONE_MARKS.u[toneNum - 1]);
  return s;
}
function replaceAt(str, i, ch) { return str.substring(0, i) + ch + str.substring(i + 1); }

/**  */
function detectToneFromMarked(py) {
  if (!py) return 0;
  // :  (:   )
  let hasVowel = false, anyMarked = false, tone = 0;
  const markMap = {
    "ā": 1, "á": 2, "ǎ": 3, "à": 4,
    "ē": 1, "é": 2, "ě": 3, "è": 4,
    "ī": 1, "í": 2, "ǐ": 3, "ì": 4,
    "ō": 1, "ó": 2, "ǒ": 3, "ò": 4,
    "ū": 1, "ú": 2, "ǔ": 3, "ù": 4,
    "ǖ": 1, "ǘ": 2, "ǚ": 3, "ǜ": 4,
  };
  for (const c of py) {
    if (/[aeiouü]/.test(c)) hasVowel = true;
    if (markMap[c]) { tone = markMap[c]; anyMarked = true; }
  }
  if (!anyMarked && hasVowel) return 0; // 
  return tone;
}

// ============================================================
// 3.  (Context-Aware Polyphone Disambiguation)
// ============================================================
const POLYPHONE_RULES = [
  // 长: cháng (adj. long) vs zhǎng (v. grow / leader)
  { char: "长",
    default: { pinyinStrip: "chang", toneNum: 2, label: "cháng" },
    rules: [
      { match: (ctx) => isMatch(ctx, ["长", ["大", "高", "辈", "老"], ["城", "江", "久", "安", "途", "期", "夜"]]), result: { pinyinStrip: "zhang", toneNum: 3, label: "zhǎng" } },
      { match: (ctx) => ctx.nextChar && ["大", "高", "辈"].includes(ctx.nextChar), result: { pinyinStrip: "zhang", toneNum: 3, label: "zhǎng" } },
    ]},
  // 行: xíng (v. go, OK) vs háng (line, row, bank)
  { char: "行",
    default: { pinyinStrip: "xing", toneNum: 2, label: "xíng" },
    rules: [
      { match: (ctx) => isMatch(ctx, [["银", "同", "内", "外"], "行"], ["银行", "行家", "行列", "行业", "同行"]), result: { pinyinStrip: "hang", toneNum: 2, label: "háng" } },
    ]},
  // 重: zhòng (heavy) vs chóng (again, layer)
  { char: "重",
    default: { pinyinStrip: "zhong", toneNum: 4, label: "zhòng" },
    rules: [
      { match: (ctx) => isMatch(ctx, ["重", ["复", "新", "来", "阳", "庆"], ["复", "新", "来", "叠"]], ["重复", "重来", "重阳", "重庆", "重叠"]), result: { pinyinStrip: "chong", toneNum: 2, label: "chóng" } },
    ]},
  // 还: hái (still) vs huán (return)
  { char: "还",
    default: { pinyinStrip: "hai", toneNum: 2, label: "hái" },
    rules: [
      { match: (ctx) => isMatch(ctx, [["归", "偿", "退", "交", "奉"], "还"], ["归还", "还钱", "还书", "偿还", "退还", "奉还"]), result: { pinyinStrip: "huan", toneNum: 2, label: "huán" } },
    ]},
  // 乐: lè (happy) vs yuè (music)
  { char: "乐",
    default: { pinyinStrip: "le", toneNum: 4, label: "lè" },
    rules: [
      { match: (ctx) => isMatch(ctx, [["器", "曲", "队", "团", "谱"], "乐"], ["音乐", "乐曲", "乐器", "乐队", "乐谱", "奏乐"]), result: { pinyinStrip: "yue", toneNum: 4, label: "yuè" } },
    ]},
  // 中: zhōng vs zhòng (hit target / win)
  { char: "中",
    default: { pinyinStrip: "zhong", toneNum: 1, label: "zhōng" },
    rules: [
      { match: (ctx) => isMatch(ctx, [["打", "猜", "射", "击"], "中"], ["打中", "猜中", "射中", "命中", "看中", "中奖"]), result: { pinyinStrip: "zhong", toneNum: 4, label: "zhòng" } },
    ]},
  // 相: xiāng (mutual) vs xiàng (photo/look/appearance)
  { char: "相",
    default: { pinyinStrip: "xiang", toneNum: 1, label: "xiāng" },
    rules: [
      { match: (ctx) => isMatch(ctx, [["照", "长", "面", "象"], "相"], ["照相", "相机", "相貌", "相片", "丞相", "真相"]), result: { pinyinStrip: "xiang", toneNum: 4, label: "xiàng" } },
    ]},
  // 好: hǎo (good) vs hào (like, hobby)
  { char: "好",
    default: { pinyinStrip: "hao", toneNum: 3, label: "hǎo" },
    rules: [
      { match: (ctx) => isMatch(ctx, ["好", ["客", "学", "胜", "动", "奇"], ["事", "玩", "书"]], ["爱好", "喜好", "嗜好", "好客", "好学"]), result: { pinyinStrip: "hao", toneNum: 4, label: "hào" } },
    ]},
  // 便: biàn vs pián (cheap)
  { char: "便",
    default: { pinyinStrip: "bian", toneNum: 4, label: "biàn" },
    rules: [
      { match: (ctx) => isMatch(ctx, [["方", "大"], "便"], ["便宜", "便宜货"]), result: { pinyinStrip: "pian", toneNum: 2, label: "pián" } },
    ]},
  // 觉: jué (feel) vs jiào (sleep)
  { char: "觉",
    default: { pinyinStrip: "jue", toneNum: 2, label: "jué" },
    rules: [
      { match: (ctx) => isMatch(ctx, [["睡", "午", "困"], "觉"], ["睡觉", "午觉", "困觉"]), result: { pinyinStrip: "jiao", toneNum: 4, label: "jiào" } },
    ]},
  // 教: jiāo (teach) vs jiào (religion / make)
  { char: "教",
    default: { pinyinStrip: "jiao", toneNum: 1, label: "jiāo" },
    rules: [
      { match: (ctx) => isMatch(ctx, ["教", ["育", "室", "师", "材", "堂", "训"]], ["教育", "教室", "教师", "教材", "教堂", "宗教", "请教"]), result: { pinyinStrip: "jiao", toneNum: 4, label: "jiào" } },
    ]},
  // 为: wèi (for) vs wéi (be / do)
  { char: "为",
    default: { pinyinStrip: "wei", toneNum: 4, label: "wèi" },
    rules: [
      { match: (ctx) => isMatch(ctx, [["认", "以", "成", "作", "行"], "为"], ["认为", "以为", "成为", "作为", "行为", "为人"]), result: { pinyinStrip: "wei", toneNum: 2, label: "wéi" } },
    ]},
  // 得: dé vs de (complement marker) vs děi (must)
  { char: "得",
    default: { pinyinStrip: "de", toneNum: 0, label: "de" },
    rules: [
      { match: (ctx) => isMatch(ctx, [["获", "取", "赢", "到"], "得"], ["获得", "取得", "得到"]), result: { pinyinStrip: "de", toneNum: 2, label: "dé" } },
      { match: (ctx) => ctx.nextChar && ["去", "走", "做", "买", "说"].includes(ctx.nextChar), result: { pinyinStrip: "dei", toneNum: 3, label: "děi" } },
    ]},
  // 地: dì vs de (adverbial marker)
  { char: "地",
    default: { pinyinStrip: "di", toneNum: 4, label: "dì" },
    rules: [
      { match: (ctx) => ctx.isAdverbialContext || (ctx.prevChar && isAdjLike(ctx.prevChar) && ctx.nextChar && isVLike(ctx.nextChar)), result: { pinyinStrip: "de", toneNum: 0, label: "de" } },
    ]},
  // 了: le vs liǎo (done, know)
  { char: "了",
    default: { pinyinStrip: "le", toneNum: 0, label: "le" },
    rules: [
      { match: (ctx) => isMatch(ctx, [["不", "解", "结", "终", "完"], "了"], ["了解", "了结", "了不起", "终了", "了却"]), result: { pinyinStrip: "liao", toneNum: 3, label: "liǎo" } },
    ]},
  // 着: zhe / zháo / zhuó / zhāo
  { char: "着",
    default: { pinyinStrip: "zhe", toneNum: 0, label: "zhe" },
    rules: [
      { match: (ctx) => isMatch(ctx, [["睡", "找", "急", "点", "忙"], "着"], ["睡着", "找着", "着急", "着凉", "着火"]), result: { pinyinStrip: "zhao", toneNum: 2, label: "zháo" } },
      { match: (ctx) => isMatch(ctx, [["穿", "陆", "手"], "着"], ["穿着", "着陆", "着手", "着重", "着想", "执着"]), result: { pinyinStrip: "zhuo", toneNum: 2, label: "zhuó" } },
      { match: (ctx) => ctx.nextChar === "数" || ctx.nextChar === "法", result: { pinyinStrip: "zhao", toneNum: 1, label: "zhāo" } },
    ]},
  // 过: guò / guō (surname) / guo (aspect particle)
  { char: "过",
    default: { pinyinStrip: "guo", toneNum: 4, label: "guò" },
    rules: [
      { match: (ctx) => ctx.prevChar && isVLike(ctx.prevChar) && (!ctx.nextChar || !/[^一-龥]/.test(ctx.nextChar) && !isVLike(ctx.nextChar) === false), result: { pinyinStrip: "guo", toneNum: 0, label: "guo" } },
    ]},
  // 发: fā vs fà (hair)
  { char: "发",
    default: { pinyinStrip: "fa", toneNum: 1, label: "fā" },
    rules: [
      { match: (ctx) => isMatch(ctx, [["头", "剃", "烫", "染", "脱"], "发"], ["头发", "理发", "短发", "白发"]), result: { pinyinStrip: "fa", toneNum: 0, label: "fa" } },
    ]},
  // 打: dǎ vs dá (dozen)
  { char: "打",
    default: { pinyinStrip: "da", toneNum: 3, label: "dǎ" },
    rules: [
      { match: (ctx) => ctx.prevChar && /[一二两三四五六七八九十百千0-9]/.test(ctx.prevChar) || isMatch(ctx, [], ["一打", "半打"]), result: { pinyinStrip: "da", toneNum: 2, label: "dá" } },
    ]},
  // 大: dà vs dài (doctor,  old-style)
  { char: "大",
    default: { pinyinStrip: "da", toneNum: 4, label: "dà" },
    rules: [
      { match: (ctx) => ctx.nextChar === "夫" && !ctx.nextNextChar || ctx.nextChar === "王", result: { pinyinStrip: "dai", toneNum: 4, label: "dài" } },
    ]},
];


function isAdjLike(ch) { return typeof ch === "string" && ["慢", "快", "静", "忙", "乱", "稳", "轻", "响", "真"].includes(ch); }
function isVLike(ch) { return typeof ch === "string" && ["跑", "走", "说", "唱", "跳", "写", "看", "吃", "笑", "哭", "学", "读", "想"].includes(ch); }

/** pattern = [slot0, slot1, ...]  slot =   [] */
function isMatch(ctx, pattern = null, wordList = null) {
  const text = ctx.text || "";
  const i = ctx.index;
  if (wordList) {
    for (const w of wordList) {
      const len = w.length;
      for (let off = 0; off <= i && off + len <= text.length; off++) {
        if (text.substring(off, off + len) === w && i >= off && i < off + len) return true;
      }
    }
  }
  if (!pattern) return false;
  // pattern  [prev, char]  [char, next]
  const plen = pattern.length;
  //  pattern 
  const curPos = pattern.findIndex(x => x === ctx.char);
  if (curPos < 0) {
    //   char  pattern
    return false;
  }
  for (let k = 0; k < plen; k++) {
    const slot = pattern[k];
    const tgtIdx = i + (k - curPos);
    if (tgtIdx < 0 || tgtIdx >= text.length) return false;
    const ch = text[tgtIdx];
    if (Array.isArray(slot)) {
      if (!slot.includes(ch)) return false;
    } else if (typeof slot === "string") {
      if (ch !== slot) return false;
    }
  }
  return true;
}

function resolvePolyphone(char, ctx) {
  const def = POLYPHONE_RULES.find(r => r.char === char);
  if (!def) return null;
  for (const rule of def.rules) {
    try {
      if (rule.match({ ...ctx, char })) {
        return rule.result;
      }
    } catch {}
  }
  return def.default;
}

// ============================================================
// 4.  (Tone Sandhi Engine)
// ============================================================
const NEUTRAL_POSTFIX = new Set(["子", "头", "们", "么", "生"]);
const NEUTRAL_PARTICLE = new Set(["的", "了", "着", "过", "吧", "吗", "呢", "啊", "呀", "哦", "啦", "嘛", "么", "哪", "哇", "哟", "嘛", "呗"]);
const DIRECTION_VERB = new Set(["上", "下", "进", "出", "回", "开", "起", "过", "来"]);
const LOC_POSTFIX = new Set(["边", "面", "头", "里"]);

function applyToneSandhi(tokens) {
  /** tokens = [{char, pinyinStrip, toneNum, ...}[]] */
  // 4.1  AABB   
  for (let i = 1; i < tokens.length; i++) {
    if (tokens[i].char === tokens[i - 1].char && tokens[i].toneNum !== 0) {
      //   /   /   /   /   /   /   /  
      const prefix = tokens[i - 1].char;
      if (["妈", "爸", "哥", "姐", "爷", "奶", "娃", "星", "宝"].includes(prefix) || isVLike(prefix)) {
        tokens[i] = { ...tokens[i], _origTone: tokens[i].toneNum, toneNum: 0, sandhi: "reduplication-neutral",
                      pinyinMarked: toneNums_toMarked(tokens[i].pinyinStrip, 0) };
      }
    }
  }

  // 4.2 //// ()
  for (let i = 0; i < tokens.length; i++) {
    if (i > 0 && NEUTRAL_POSTFIX.has(tokens[i].char)) {
      // "" (//)"" /
      const isRealPostfix = (tokens[i].char === "子" && !["天", "君", "孔", "孟", "赤", "孝"].includes(tokens[i - 1].char))
                         || (tokens[i].char === "头" && !["点", "回", "抬", "低", "摇", "磕"].includes(tokens[i - 1].char))
                         || tokens[i].char === "们" || tokens[i].char === "么" || tokens[i].char === "生";
      if (isRealPostfix) {
        tokens[i] = { ...tokens[i], _origTone: tokens[i].toneNum, toneNum: 0, sandhi: "postfix-neutral",
                      pinyinMarked: toneNums_toMarked(tokens[i].pinyinStrip, 0) };
      }
    }
  }

  // 4.3 // + // + 
  for (let i = 0; i < tokens.length; i++) {
    if (NEUTRAL_PARTICLE.has(tokens[i].char) && tokens[i].toneNum !== 0 &&
        (tokens[i]._fromRule !== "polyphone-special")) {
      // ""  ( V )
      if (tokens[i].char === "了" && i > 0 && (isVLike(tokens[i - 1].char) || ["完", "快"].includes(tokens[i - 1].char))) {
        tokens[i] = { ...tokens[i], _origTone: tokens[i].toneNum, toneNum: 0, sandhi: "particle-neutral",
                      pinyinMarked: toneNums_toMarked(tokens[i].pinyinStrip, 0) };
      } else if (["的", "着", "吧", "吗", "呢", "啊", "呀", "啦"].includes(tokens[i].char)) {
        tokens[i] = { ...tokens[i], _origTone: tokens[i].toneNum, toneNum: 0, sandhi: "particle-neutral",
                      pinyinMarked: toneNums_toMarked(tokens[i].pinyinStrip, 0) };
      }
    }
  }

  // 4.4 V + //////
  for (let i = 1; i < tokens.length; i++) {
    if (DIRECTION_VERB.has(tokens[i].char) && isVLike(tokens[i - 1].char) && tokens[i].toneNum !== 0) {
      tokens[i] = { ...tokens[i], _origTone: tokens[i].toneNum, toneNum: 0, sandhi: "direction-neutral",
                    pinyinMarked: toneNums_toMarked(tokens[i].pinyinStrip, 0) };
    }
  }

  // 4.5  (3  2  3)
  for (let i = 0; i < tokens.length - 1; i++) {
    const cur = tokens[i], next = tokens[i + 1];
    if (cur.toneNum === 3 && next.toneNum === 3 && cur.char !== next.char) {
      //  (e.g.  nǎi nai)
      tokens[i] = { ...cur, _origTone: 3, toneNum: 2, sandhi: "332",
                    pinyinMarked: toneNums_toMarked(cur.pinyinStrip, 2) };
    }
  }

  // 4.6  
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].char !== "一") continue;
    const next = tokens[i + 1];
    // 句末 / 序数 / 单念  yī (本调)
    const atEnd = i === tokens.length - 1;
    const isOrdinal = tokens[i - 1] && ["第", "初", "头"].includes(tokens[i - 1].char);
    if (atEnd || isOrdinal) {
      //  yī
      continue;
    }
    if (next && next.toneNum === 4) {
      //  +   yí ()
      tokens[i] = { ...tokens[i], _origTone: 1, toneNum: 2, sandhi: "yí",
                    pinyinStrip: "yi", pinyinMarked: "yí" };
    } else if (next && next.toneNum !== 4 && next.toneNum !== 0) {
      //  + //  yì ()
      tokens[i] = { ...tokens[i], _origTone: 1, toneNum: 4, sandhi: "yì",
                    pinyinStrip: "yi", pinyinMarked: "yì" };
    }
    //    / 
    if (tokens[i - 1] && tokens[i + 1] && tokens[i - 1].char === tokens[i + 1].char && isVLike(tokens[i - 1].char)) {
      tokens[i] = { ...tokens[i], toneNum: 0, sandhi: "yi ()", pinyinMarked: "yi" };
    }
  }

  // 4.7  
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].char !== "不") continue;
    const next = tokens[i + 1];
    if (next && next.toneNum === 4) {
      tokens[i] = { ...tokens[i], _origTone: 4, toneNum: 2, sandhi: "bú",
                    pinyinStrip: "bu", pinyinMarked: "bú" };
    }
    //  AAB     
    if (tokens[i - 1] && tokens[i + 1] && tokens[i - 1].char === tokens[i + 1].char) {
      tokens[i] = { ...tokens[i], toneNum: 0, sandhi: "bu ()", pinyinMarked: "bu" };
    }
  }

  // 4.8  /  (old Beijing: / +   yí )
  //  mode:"colloquial" 
  // 4.9   — ao/ou/ai/ei/er/zi/zhi..
  for (let i = 1; i < tokens.length; i++) {
    if (tokens[i].char !== "啊") continue;
    const prev = tokens[i - 1].pinyinStrip || "";
    const tail = prev[prev.length - 1] || "";
    let result = null;
    if (tail === "n" && !prev.endsWith("ng")) result = { strip: "na", tone: 0, mark: "na" };
    else if (prev.endsWith("ng")) result = { strip: "nga", tone: 0, mark: "nga" };
    else if (tail === "u" || prev.endsWith("ao") || prev.endsWith("ou")) result = { strip: "wa", tone: 0, mark: "wa" };
    else if (["r"].includes(tail) || prev.endsWith("er")) result = { strip: "ra", tone: 0, mark: "ra" };
    else if (["zi", "ci", "si"].includes(prev.slice(-2)) || ["zhi", "chi", "shi", "ri"].includes(prev.slice(-3))) result = { strip: "ra", tone: 0, mark: "ra" };
    else if (["a", "o", "e", "i", "ü", "v"].includes(tail) || prev.endsWith("ai") || prev.endsWith("ei")) result = { strip: "ya", tone: 0, mark: "ya" };
    if (result) {
      tokens[i] = { ...tokens[i], pinyinStrip: result.strip, toneNum: result.tone,
                    pinyinMarked: result.mark, sandhi: "-sandhi", _origTone: 1 };
    }
  }

  // 4.10  erhua:  ""  ()
  for (let i = tokens.length - 2; i >= 0; i--) {
    if (tokens[i + 1] && tokens[i + 1].char === "儿") {
      //  "" 
      const prev = tokens[i].pinyinStrip || "";
      const erhua = applyErhuaToRhyme(prev);
      tokens[i] = { ...tokens[i], erhua: true,
                    pinyinStrip: erhua.strip,
                    pinyinMarked: toneNums_toMarked(erhua.strip, tokens[i].toneNum),
                    sandhi: tokens[i].sandhi || "erhua" };
      tokens[i + 1] = { ...tokens[i + 1], _absorbed: true, pinyinStrip: "", pinyinMarked: "", toneNum: 0 };
    }
  }
  return tokens.filter(t => !t._absorbed);
}

/** Erhua (-r)  */
function applyErhuaToRhyme(strippedPy) {
  let r = strippedPy;
  //  i / n  -r üe/uü  üer-ng   -r
  if (r.endsWith("i") || r.endsWith("n")) {
    r = r.slice(0, -1) + "r";
  } else if (r.endsWith("ng")) {
    r = r.slice(0, -2) + "r̃";   //  rhotacization
  } else if (r.endsWith("u") || r.endsWith("o")) {
    r = r + "r";
  } else if (r.endsWith("a") || r.endsWith("e")) {
    r = r + "r";
  } else if (r === "ü") {
    r = "üer";
  } else {
    r = r + "r";
  }
  return { strip: r };
}

// ============================================================
// 5.  API
// ============================================================
export class HanziG2P {
  constructor() {
    this.baseTable = BASE_PINYIN_TABLE;
  }

  /**
   *  baseTable  this 
   */
  registerChar(char, pinyinMarked, toneNum) {
    if (!char || !pinyinMarked) return this;
    BASE_PINYIN_TABLE.set(char, {
      pinyinMarked, toneNum,
      pinyinStrip: stripToneMark(pinyinMarked),
      from: "runtime",
    });
    return this;
  }

  /**
   *  + polyphoneContext 
   */
  lookupChar(char, polyCtx = null) {
    if (POLYPHONE_LIST.has(char)) {
      const res = resolvePolyphone(char, polyCtx || { text: char, index: 0, char });
      if (res) {
        return {
          char,
          pinyinStrip: res.pinyinStrip,
          toneNum: res.toneNum,
          pinyinMarked: res.label,
          polySource: res.label,
          isPolyphone: true,
        };
      }
    }
    const b = BASE_PINYIN_TABLE.get(char);
    if (!b) {
      return { char, pinyinStrip: "", toneNum: 0, pinyinMarked: "", unknown: true };
    }
    return {
      char,
      pinyinStrip: b.pinyinStrip,
      toneNum: b.toneNum,
      pinyinMarked: b.pinyinMarked,
      from: b.from,
      isPolyphone: POLYPHONE_LIST.has(char),
    };
  }

  /**
   *  API   token  + 
   * @param {string} text -  {punct:true}
   * @param {{mode?:"teaching"|"colloquial", forceNeutral?:boolean}} opts
   * @returns {Array<{char, pinyinStrip, toneNum, pinyinMarked, originalTone, sandhi?, isNeutral, isPolyphone, isPunct?}>}
   */
  convert(text, opts = {}) {
    if (!text) return [];
    const chars = [...text];
    const tokens = [];
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      if (!/[\u4e00-\u9fa5]/.test(c)) {
        tokens.push({ char: c, isPunct: true, pinyinStrip: "", toneNum: -1, pinyinMarked: c });
        continue;
      }
      const ctx = {
        text,
        index: i,
        char: c,
        prevChar: chars[i - 1] || null,
        nextChar: chars[i + 1] || null,
        nextNextChar: chars[i + 2] || null,
      };
      const r = this.lookupChar(c, ctx);
      tokens.push({
        char: c,
        pinyinStrip: r.pinyinStrip,
        toneNum: r.toneNum,
        pinyinMarked: r.pinyinMarked,
        originalTone: r.toneNum,
        isNeutral: r.toneNum === 0,
        isPolyphone: !!r.isPolyphone,
      });
    }
    // 
    const sandhied = applyToneSandhi(tokens);
    return sandhied.map(t => ({
      ...t,
      originalTone: t._origTone != null ? t._origTone : t.originalTone || (t.toneNum === 0 ? 0 : t.toneNum),
      isNeutral: t.toneNum === 0,
    }));
  }

  /**  */
  toMarkedString(tokens) {
    return tokens.map(t => t.isPunct ? t.char : t.pinyinMarked).join(" ");
  }
}

export const g2p = new HanziG2P();
export default g2p;
