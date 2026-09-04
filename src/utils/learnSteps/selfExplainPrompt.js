/**
 * Self-explain micro-prompt after morph / recognize (generation effect).
 * Never judges right/wrong; never writes mistakes.
 */
import { escapeHtml } from "../BaseModule.js";
import { soundAndFX } from "../soundEngine.js";
import { GAME_ICONS } from "../gameIcons.js";

export function shouldUseSelfExplain(age) {
  return (Number(age) || 6) >= 5;
}

function buildChips(charItem) {
  const chips = [];
  const push = (text, id) => {
    const t = String(text || "").trim();
    if (!t || chips.some((c) => c.text === t)) return;
    chips.push({ id, text: t.slice(0, 18) });
  };

  const oracle = charItem?.evolution?.oracleDesc || "";
  const mnemonic = charItem?.meanings?.mnemonic || "";
  if (oracle) push(oracle.replace(/[。！？,.!?].*$/, "").slice(0, 16), "oracle");
  if (mnemonic) push(mnemonic.slice(0, 16), "mnemonic");
  push("像生活里见过的东西", "life");
  push("像图画慢慢变成字", "picture");
  return chips.slice(0, 3);
}

/**
 * @param {object} charItem
 * @param {(result:{ skipped?: boolean, chipId?: string }) => void} onDone
 */
export function openSelfExplainPrompt(charItem, onDone) {
  if (typeof document === "undefined") {
    onDone?.({ skipped: true });
    return;
  }

  const char = charItem?.char || "";
  const chips = buildChips(charItem);
  const wrapper = document.createElement("div");
  wrapper.id = "cathy-self-explain-wrapper";
  wrapper.innerHTML = `
    <div id="self-explain-modal" class="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div class="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-4 border-amber-300 flex flex-col items-center gap-4">
        <div class="text-5xl font-black font-serif text-amber-950">${escapeHtml(char)}</div>
        <h3 class="text-lg font-black text-amber-950 text-center">你觉得这个字像什么？</h3>
        <p class="text-xs font-bold text-amber-800/80 text-center">没有标准答案，想到什么都可以说</p>
        <div class="flex flex-wrap justify-center gap-2 w-full">
          ${chips
            .map(
              (c) => `
            <button type="button" class="btn-self-chip bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-black px-3 py-2 rounded-full border border-amber-300 cursor-pointer active:scale-95" data-chip="${escapeHtml(c.id)}">
              ${escapeHtml(c.text)}
            </button>`
            )
            .join("")}
        </div>
        <div class="flex flex-wrap justify-center gap-2 w-full mt-1">
          <button type="button" id="btn-self-said" class="btn-game-orange text-white font-black text-sm px-6 py-2.5 rounded-full cursor-pointer active:scale-95">我说了！</button>
          <button type="button" id="btn-self-skip" class="bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-sm px-6 py-2.5 rounded-full cursor-pointer active:scale-95">跳过</button>
        </div>
        <div class="flex items-center gap-1 text-[10px] font-bold text-amber-700/70">
          ${GAME_ICONS.sparkle("w-3.5 h-3.5")}
          <span>大胆想就好</span>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  let done = false;
  const finish = (payload) => {
    if (done) return;
    done = true;
    try {
      soundAndFX.speakPriority?.("你的想法很棒！", { kind: "sentence", priority: 1 });
    } catch (_) {
      /* ignore */
    }
    soundAndFX.playPop?.();
    wrapper.remove();
    onDone?.(payload);
  };

  wrapper.querySelectorAll(".btn-self-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      finish({ chipId: btn.dataset.chip });
    });
  });
  wrapper.querySelector("#btn-self-said")?.addEventListener("click", () => {
    finish({ chipId: "said" });
  });
  wrapper.querySelector("#btn-self-skip")?.addEventListener("click", () => {
    finish({ skipped: true });
  });
}
