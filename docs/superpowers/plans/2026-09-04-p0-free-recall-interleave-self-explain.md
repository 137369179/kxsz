# P0 学习提取练习 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把复习主路径改为年龄门控的自由提取闪卡（并修复五卡同写诚实性），追加形近字交错包，并在 ≥5 岁用自我解释替换强制字理 quiz。

**Architecture:** 纯数据逻辑放在 `flashcardEngine` / 新建 `reviewHub/*`；UI 用与 `cardHub` 相同的 `.call(this)` 薄壳模式挂到 `ReviewModule`。Learn 侧给 `morphEngine` 加 `onClose`，`stepRecognize` 按年龄走 `selfExplainPrompt` 或保留 quiz。

**Tech Stack:** Vanilla ES modules、Vitest、现有 `ebbinghausManager` / `flashcardEngine` / `FSRGRating`

**Spec:** `docs/P0学习提取练习设计规格.md`（深研修订 + 2026-09-04 已确认替换 quiz）

---

## File map

| File | Role |
|------|------|
| `src/utils/reviewHub/freeRecallLogic.js` | 年龄选卡、rating 映射（纯函数） |
| `src/utils/reviewHub/freeRecallView.js` | 自由提取 DOM + 绑定 |
| `src/utils/reviewHub/interleavePack.js` | 双源建包 / 门控 / 交错 |
| `src/utils/reviewHub/interleaveView.js` | 交错练习 DOM |
| `src/utils/reviewHub/index.js` | 导出 |
| `src/utils/learnSteps/selfExplainPrompt.js` | 自我解释层 |
| `src/components/ReviewModule.js` | 接线主路径、修队列与五卡同写 |
| `src/utils/morphEngine.js` | `onClose` |
| `src/utils/learnSteps/stepRecognize.js` | ≥5 selfExplain 替换 quiz |
| `tests/unit/freeRecallLogic.test.js` | |
| `tests/unit/interleavePack.test.js` | |
| `tests/unit/selfExplainGate.test.js` | |
| `tests/unit/reviewAtomicHonesty.test.js` | 文档化：Review 不得五卡同写（静态扫源或行为测） |

---

### Task 1: freeRecallLogic 纯函数 + 测试

**Files:**
- Create: `src/utils/reviewHub/freeRecallLogic.js`
- Create: `tests/unit/freeRecallLogic.test.js`

- [x] **Step 1: Write the failing test**

```js
import { describe, it, expect } from "vitest";
import {
  pickRecallMode,
  mapSelfReportToRating,
  FSRGRating,
} from "../../src/utils/reviewHub/freeRecallLogic.js";
import { ATOMIC_CARD_TYPES } from "../../src/utils/flashcardEngine.js";

describe("pickRecallMode", () => {
  it("age ≤4 → recognition sound_to_char", () => {
    expect(pickRecallMode(4)).toEqual({
      mode: "point",
      cardType: ATOMIC_CARD_TYPES.SOUND_TO_CHAR,
    });
  });
  it("age ≥5 → free recall char_to_pinyin", () => {
    expect(pickRecallMode(5).mode).toBe("free");
    expect(pickRecallMode(7).cardType).toBe(ATOMIC_CARD_TYPES.CHAR_TO_PINYIN);
  });
});

describe("mapSelfReportToRating", () => {
  it("knew → GOOD; notYet → AGAIN", () => {
    expect(mapSelfReportToRating(true)).toBe(FSRGRating.GOOD);
    expect(mapSelfReportToRating(false)).toBe(FSRGRating.AGAIN);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/freeRecallLogic.test.js`  
Expected: FAIL (module not found)

- [x] **Step 3: Write minimal implementation**

```js
// src/utils/reviewHub/freeRecallLogic.js
import { ATOMIC_CARD_TYPES } from "../flashcardEngine.js";
import { FSRGRating } from "../fsrsScheduler.js";

export { FSRGRating };

export function pickRecallMode(age) {
  const a = Number(age) || 6;
  if (a <= 4) {
    return { mode: "point", cardType: ATOMIC_CARD_TYPES.SOUND_TO_CHAR };
  }
  return { mode: "free", cardType: ATOMIC_CARD_TYPES.CHAR_TO_PINYIN };
}

/** @param {boolean} knew 用户自评「对了」 */
export function mapSelfReportToRating(knew) {
  return knew ? FSRGRating.GOOD : FSRGRating.AGAIN;
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/freeRecallLogic.test.js`  
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add src/utils/reviewHub/freeRecallLogic.js tests/unit/freeRecallLogic.test.js
git commit -m "$(cat <<'EOF'
feat(review): add free-recall age/mode helpers

EOF
)"
```

---

### Task 2: interleavePack 纯函数 + 测试

**Files:**
- Create: `src/utils/reviewHub/interleavePack.js`
- Create: `tests/unit/interleavePack.test.js`

- [x] **Step 1: Write the failing test**

```js
import { describe, it, expect } from "vitest";
import { buildInterleavePack } from "../../src/utils/reviewHub/interleavePack.js";

const DB = [
  { id: "a", char: "日", confusingChars: ["目", "白"], confusingHint: "日中间有横" },
  { id: "b", char: "目", confusingChars: ["日"], confusingHint: "目多一横" },
  { id: "c", char: "白", confusingChars: ["日"], confusingHint: "" },
  { id: "d", char: "未学", confusingChars: ["日"], confusingHint: "" },
];

describe("buildInterleavePack", () => {
  it("requires learned target and at least one learned distractor", () => {
    const pack = buildInterleavePack({
      chars: DB,
      learnedIds: new Set(["a", "b"]),
      errorProfiles: {},
      limit: 4,
    });
    expect(pack.length).toBeGreaterThan(0);
    for (const q of pack) {
      expect(["a", "b"]).toContain(q.targetId);
      expect(q.options).toContain(q.targetChar);
      expect(q.options.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("returns empty when fewer than 2 learned among confuse graph", () => {
    const pack = buildInterleavePack({
      chars: DB,
      learnedIds: new Set(["a"]),
      errorProfiles: {},
      limit: 4,
    });
    expect(pack).toEqual([]);
  });

  it("switches target at least twice across pack when possible", () => {
    const pack = buildInterleavePack({
      chars: DB,
      learnedIds: new Set(["a", "b", "c"]),
      errorProfiles: {},
      limit: 6,
    });
    const targets = pack.map((q) => q.targetId);
    expect(new Set(targets).size).toBeGreaterThanOrEqual(2);
  });
});
```

- [x] **Step 2: Run test — expect FAIL**

Run: `npm test -- tests/unit/interleavePack.test.js`

- [x] **Step 3: Implement `buildInterleavePack`**

Requirements in code comments:
- Merge sources: `errorProfiles.confusedPairs` first, then each learned char’s `confusingChars`
- Gate: target learned; ≥1 learned distractor from confuse set
- Options: 3–4 unique chars including target; shuffle
- Interleave: round-robin targets so consecutive targets differ when ≥2 candidates
- Attach `hint` from target’s `confusingHint`

```js
// Outline — implement fully in file
export function buildInterleavePack({ chars, learnedIds, errorProfiles, limit = 6 }) {
  // ... build candidate targets, generate up to `limit` questions
}
```

- [x] **Step 4: Run test — expect PASS**

- [x] **Step 5: Commit**

```bash
git add src/utils/reviewHub/interleavePack.js tests/unit/interleavePack.test.js
git commit -m "$(cat <<'EOF'
feat(review): build confuse interleave packs from dual sources

EOF
)"
```

---

### Task 3: freeRecallView + ReviewModule 主路径 + 诚实性

**Files:**
- Create: `src/utils/reviewHub/freeRecallView.js`
- Create: `src/utils/reviewHub/index.js`
- Modify: `src/components/ReviewModule.js`
- Create: `tests/unit/reviewAtomicHonesty.test.js`

- [x] **Step 1: Honesty test (static)**

```js
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("ReviewModule atomic honesty", () => {
  it("must not loop all ATOMIC_CARD_TYPES into recordAtomicAnswer", () => {
    const src = fs.readFileSync(
      path.resolve("src/components/ReviewModule.js"),
      "utf8"
    );
    // 禁止旧模式：for (const cardType of Object.values(ATOMIC_CARD_TYPES)) { recordAtomicAnswer
    expect(src).not.toMatch(
      /for\s*\(\s*const\s+cardType\s+of\s+Object\.values\(\s*ATOMIC_CARD_TYPES\s*\)\s*\)[\s\S]{0,80}recordAtomicAnswer/
    );
  });
});
```

Run before fix: may PASS already if pattern exact — if current code matches, expect FAIL after we assert; current ReviewModule HAS this loop → test should FAIL until removed.

- [x] **Step 2: Implement `mountFreeRecallRound(ctx)`**

`freeRecallView.js` exports `mountFreeRecallRound` where `ctx` has:
`{ containerEl, charData, age, onComplete({ knew, cardType }) }`

Behavior:
- `pickRecallMode(age)`
- mode `free`: prompt HTML with only `charData.char` + btn `#btn-recall-ready` → reveal pinyin + `#btn-recall-knew` / `#btn-recall-notyet`
- mode `point`: speak pinyin, show 3–4 char buttons (target + distractors from `confusingChars` or random learned-looking chars from a passed `distractorChars` array); on click call `checkCardAnswer` then `onComplete`
- Do **not** render multimodal spoilers in the view itself

- [x] **Step 3: Wire `ReviewModule`**

Changes:
1. `initQueue`: remove `CHARACTER_DATABASE.slice(0, wantRev)` fallback; if no learned ids → empty queue → `renderEmpty`
2. Prefer learned-only: `learnedIds = Object.keys(charRecords)`; due/confused filtered to learned
3. `renderRound`: **do not** show confuse/chant preview strip during free recall (omit the preview div or gate it)
4. Replace `new DrillEngine(...)` with `mountFreeRecallRound({...})`; onComplete:
   - ensure charRec exists
   - `recordAtomicAnswer(charRec, cardType, knew)` **once**
   - `ebbinghausManager.completeReview(charId, mapSelfReportToRating(knew))`
   - coins: knew ? 5 : 1
   - SM-18 append-to-end on consecutive notYet ≥2 with **neutral** speak text: `这个字我们再练一次吧`
5. Export hub from `reviewHub/index.js`

- [x] **Step 4: Run tests**

Run: `npm test -- tests/unit/freeRecallLogic.test.js tests/unit/reviewAtomicHonesty.test.js`  
Plus full suite smoke: `npm test`  
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add src/utils/reviewHub/ src/components/ReviewModule.js tests/unit/reviewAtomicHonesty.test.js
git commit -m "$(cat <<'EOF'
feat(review): free-recall main path and single-card atomic stats

EOF
)"
```

---

### Task 4: interleaveView + 挂到复习末尾

**Files:**
- Create: `src/utils/reviewHub/interleaveView.js`
- Modify: `src/components/ReviewModule.js`
- Modify: `src/utils/reviewHub/index.js`

- [x] **Step 1: Implement `mountInterleaveRound` / `runInterleaveSession`**

API:
```js
export function runInterleaveSession({
  containerEl,
  pack, // from buildInterleavePack
  onFinished({ correct, total }),
})
```
Each question: show target prompt + option buttons; on answer show hint if wrong; advance; at end `onFinished`.

- [x] **Step 2: In ReviewModule after last free-recall card**

Instead of always `renderSummary()`:
```js
const pack = buildInterleavePack({
  chars: /* merge details confusing fields: use CHARACTER_DATABASE entries; confusingChars live on details — merge via CHARACTER_DETAILS[id] or char if present */,
  learnedIds: new Set(Object.keys(ebbinghausManager.progress.charRecords || {})),
  errorProfiles: ebbinghausManager.progress.errorProfiles || {},
  limit: 6,
});
if (pack.length >= 2) {
  runInterleaveSession({
    containerEl: this.container,
    pack,
    onFinished: () => this.renderSummary(),
  });
} else {
  this.renderSummary();
}
```

**Important:** When building pack chars, merge:
```js
const chars = CHARACTER_DATABASE.map((c) => ({
  ...c,
  ...(CHARACTER_DETAILS[c.id] || {}),
}));
```
Import `CHARACTER_DETAILS` from `../data/characterDetails.js` (or use existing detail loader if lighter — for pack build, direct import is OK in ReviewModule).

On each interleave answer: `completeReview` + optional `recordMistake` on wrong (use existing ebbinghaus API if available — `recordMistake` / errorProfiles helper used elsewhere).

- [x] **Step 3: Run `npm test -- tests/unit/interleavePack.test.js` and full `npm test`**

- [x] **Step 4: Commit**

```bash
git add src/utils/reviewHub/ src/components/ReviewModule.js
git commit -m "$(cat <<'EOF'
feat(review): append confuse interleave pack after free recall

EOF
)"
```

---

### Task 5: morph onClose + selfExplain + 替换 ≥5 quiz

**Files:**
- Modify: `src/utils/morphEngine.js`
- Create: `src/utils/learnSteps/selfExplainPrompt.js`
- Create: `tests/unit/selfExplainGate.test.js`
- Modify: `src/utils/learnSteps/stepRecognize.js`

- [x] **Step 1: Test gate helper**

```js
import { describe, it, expect } from "vitest";
import { shouldUseSelfExplain } from "../../src/utils/learnSteps/selfExplainPrompt.js";

describe("shouldUseSelfExplain", () => {
  it("true for age ≥5", () => {
    expect(shouldUseSelfExplain(5)).toBe(true);
    expect(shouldUseSelfExplain(4)).toBe(false);
  });
});
```

- [x] **Step 2: Implement selfExplainPrompt**

```js
export function shouldUseSelfExplain(age) {
  return (Number(age) || 6) >= 5;
}

/** chips from oracleDesc/mnemonic + fallback; onDone({ skipped, chipId? }) */
export function openSelfExplainPrompt(charItem, onDone) {
  // modal: question, 3 chips, 「我说了」, 「跳过」
  // all paths → positive speak → onDone; never recordMistake
}
```

- [x] **Step 3: morphEngine `onClose`**

Change signature:
```js
export function openMorphTheater(charItem, container = document.body, opts = {}) {
  const { onClose } = opts;
  const close = () => {
    clearTimers();
    try { soundAndFX.stopSpeaking(); } catch {}
    soundAndFX.playPop();
    wrapper.remove();
    if (typeof onClose === "function") onClose();
  };
  // ...
}
```

- [x] **Step 4: stepRecognize finish button**

```js
if (finishBtn) {
  this._on(finishBtn, "click", () => {
    soundAndFX.playPop();
    const age = ebbinghausManager.getAge();
    const goNext = () => {
      this.currentStep = 3;
      this.render();
    };
    if (shouldUseSelfExplain(age)) {
      if (this._selfExplainDone) return goNext();
      this._selfExplainDone = true;
      openSelfExplainPrompt(char, goNext);
      return;
    }
    // ≤4: keep existing etymology quiz once
    if (!this._etymologyQuizAnswered) {
      this._etymologyQuizAnswered = true;
      openEtymologyQuiz(char, goNext);
      return;
    }
    goNext();
  });
}
```

Also when opening morph:
```js
openMorphTheater(char, document.body, {
  onClose: () => {
    if (shouldUseSelfExplain(ebbinghausManager.getAge()) && !this._selfExplainDone) {
      this._selfExplainDone = true;
      openSelfExplainPrompt(char, () => {});
    }
  },
});
```
（若 morph 已弹解释，结束按钮因 `_selfExplainDone` 直接下一步，避免双弹。）

Ensure `ebbinghausManager` imported in `stepRecognize.js` if not already.

- [x] **Step 5: Run tests**

`npm test -- tests/unit/selfExplainGate.test.js` then `npm test`

- [x] **Step 6: Commit**

```bash
git add src/utils/morphEngine.js src/utils/learnSteps/selfExplainPrompt.js src/utils/learnSteps/stepRecognize.js tests/unit/selfExplainGate.test.js
git commit -m "$(cat <<'EOF'
feat(learn): self-explain replaces etymology quiz for age 5+

EOF
)"
```

---

### Task 6: 文档收尾

**Files:**
- Modify: `docs/现状对照表.md`
- Modify: `docs/P0学习提取练习设计规格.md` status line → 实现中/已落地

- [x] Update 对照表 row for P0 提取练习 → **已实现**（列要点）
- [x] `npm test` full green
- [x] Commit docs

```bash
git add docs/
git commit -m "$(cat <<'EOF'
docs: mark P0 free-recall / interleave / self-explain as landed

EOF
)"
```

---

## Spec coverage checklist

| Spec item | Task |
|-----------|------|
| 自由提取主路径 + 年龄门 | 1, 3 |
| 五卡同写修复 | 3 |
| 队列仅已学 / 禁 slice 凑数 | 3 |
| prompt 无剧透条 | 3 |
| 交错包双源 + 门控 | 2, 4 |
| 自我解释替换 ≥5 quiz | 5 |
| morph onClose | 5 |
| 不碰 Step8 / CardModule 浏览闪卡 | （无任务改它们） |

---

## Self-review notes

- No Drill dual-path in MVP (spec default).
- CHAR_TO_WORD deferred (no details merge in free-recall MVP).
- Interleave merges CHARACTER_DETAILS in Task 4 explicitly.
