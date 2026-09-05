/**
 * Build a confuse-pair interleave practice pack.
 * Dual sources: errorProfiles.confusedPairs (first), then confusingChars.
 * Gate: learned target + ≥1 learned distractor from confuse set.
 * Does NOT require mutual confuse lists.
 */

function resolveInChars(ref, chars) {
  if (!ref) return null;
  return chars.find((c) => c.id === ref || c.char === ref) || null;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Collect confuse glyph refs for a target from dual sources. */
function collectConfuseRefs(target, errorProfiles) {
  const refs = [];
  const seen = new Set();
  const push = (ref) => {
    if (!ref || seen.has(ref)) return;
    seen.add(ref);
    refs.push(ref);
  };

  const pairs = errorProfiles?.confusedPairs || {};
  // Keys may be glyph or id — match target.id or target.char
  for (const [key, map] of Object.entries(pairs)) {
    if (key !== target.id && key !== target.char) continue;
    if (map && typeof map === "object") {
      for (const wrong of Object.keys(map)) push(wrong);
    }
  }

  for (const ch of target.confusingChars || []) push(ch);
  return refs;
}

/**
 * @param {object} opts
 * @param {Array<{id:string,char:string,confusingChars?:string[],confusingHint?:string}>} opts.chars
 * @param {Set<string>|string[]} opts.learnedIds
 * @param {object} [opts.errorProfiles]
 * @param {number} [opts.limit]
 * @param {Set<string>|string[]} [opts.preferIds] — 本轮复习队列优先作为目标
 * @returns {Array<{targetId:string,targetChar:string,options:string[],hint:string}>}
 */
export function buildInterleavePack({
  chars = [],
  learnedIds,
  errorProfiles = {},
  limit = 6,
  preferIds,
} = {}) {
  const learned = learnedIds instanceof Set ? learnedIds : new Set(learnedIds || []);
  const prefer = preferIds instanceof Set ? preferIds : new Set(preferIds || []);
  if (!chars.length || learned.size === 0 || limit <= 0) return [];

  /** @type {Array<{target:object, distractors:object[], fillers:object[]}>} */
  const candidates = [];

  for (const target of chars) {
    if (!learned.has(target.id)) continue;

    const refs = collectConfuseRefs(target, errorProfiles);
    const distractors = [];
    const fillers = [];
    const seenIds = new Set([target.id]);

    for (const ref of refs) {
      const rec = resolveInChars(ref, chars);
      if (!rec || seenIds.has(rec.id)) continue;
      seenIds.add(rec.id);
      if (learned.has(rec.id)) distractors.push(rec);
      else fillers.push(rec);
    }

    if (distractors.length === 0) continue;
    candidates.push({ target, distractors, fillers });
  }

  if (candidates.length === 0) return [];

  // 本轮队列目标排前，其余在后（仍参与交错）
  candidates.sort((a, b) => {
    const ap = prefer.has(a.target.id) ? 0 : 1;
    const bp = prefer.has(b.target.id) ? 0 : 1;
    return ap - bp;
  });

  const pack = [];
  const n = candidates.length;
  let lastTargetId = null;

  for (let i = 0; i < limit; i++) {
    let idx = i % n;
    // Prefer consecutive targets differ when ≥2 candidates
    if (n >= 2 && candidates[idx].target.id === lastTargetId) {
      idx = (idx + 1) % n;
    }
    const { target, distractors, fillers } = candidates[idx];
    lastTargetId = target.id;

    // Cap to ≤4 while always keeping target.char (avoid drop after shuffle)
    const others = [];
    const seenOther = new Set();
    for (const d of distractors) {
      if (d.char === target.char || seenOther.has(d.char)) continue;
      seenOther.add(d.char);
      others.push(d.char);
    }
    for (const f of fillers) {
      if (f.char === target.char || seenOther.has(f.char)) continue;
      seenOther.add(f.char);
      others.push(f.char);
    }
    const cappedOthers = shuffle(others).slice(0, 3);
    const options = shuffle([target.char, ...cappedOthers]);
    if (options.length < 2) continue;

    const canCloze = !!(target.sentence && target.sentence.includes(target.char));
    const canPic = !!(target.oracleGlyph || target.meaning || (target.words && target.words[0]));

    let questionType = "similar_pick";
    let promptTitle = "";
    let promptSubtitle = "";

    if (i % 3 === 1 && canCloze) {
      questionType = "cloze_fill";
      promptTitle = target.sentence.split(target.char).join("（　）");
      promptSubtitle = "句子填空 · 把生字宝宝送回句子中";
    } else if (i % 3 === 2 && canPic) {
      questionType = "picture_write";
      promptTitle = target.oracleGlyph || (target.words && target.words[0]?.word) || target.char;
      promptSubtitle = target.meaning ? `字义认知 · ${target.meaning}` : "观察图象，找出对应的汉字";
    }

    pack.push({
      targetId: target.id,
      targetChar: target.char,
      options,
      hint: target.confusingHint || "",
      type: questionType,
      promptTitle,
      promptSubtitle,
    });
  }

  return pack.length > 0 ? pack : [];
}
