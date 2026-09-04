/** CathyAppManager — sparkles, keyboard, neural warmup */
import { soundAndFX } from "../soundEngine.js";
import { neuralVoice } from "../neuralVoice.js";
import { CHARACTER_DATABASE } from "../../data/characters.js";

export function initGlobalListeners() {
  const cleanupPointer = () => window.removeEventListener("pointerdown", this._pointerHandler);
  this._pointerHandler = (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (!e.clientX || !e.clientY) return;
    this._sparkleAt(e.clientX, e.clientY);
  };
  window.addEventListener("pointerdown", this._pointerHandler, { passive: true });
  this._addCleanup(cleanupPointer);

  const handleRejection = (event) => {
    const msg = event.reason?.message || String(event.reason || "");
    if (
      msg.includes("A listener indicated an asynchronous response") ||
      msg.includes("message channel closed") ||
      msg.includes("Receiving end does not exist")
    ) {
      event.preventDefault();
    }
  };
  window.addEventListener("unhandledrejection", handleRejection);
  this._addCleanup(() => window.removeEventListener("unhandledrejection", handleRejection));
}

export function sparkleAt(x, y) {
  const now = Date.now();
  if (now - (this._lastSparkleTime || 0) < 240) return;
  this._lastSparkleTime = now;

  const existing = document.querySelectorAll(".magic-particle");
  if (existing.length > 8) {
    for (let i = 0; i < existing.length - 8; i++) {
      existing[i].remove();
    }
  }

  const ripple = document.createElement("div");
  ripple.className = "magic-ripple";
  ripple.style.left = x + "px";
  ripple.style.top = y + "px";
  document.body.appendChild(ripple);
  setTimeout(() => ripple.remove(), 450);

  const colors = ["#FBBF24", "#F59E0B", "#F472B6", "#38BDF8", "#4ADE80"];
  const particleCount = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.4;
    const dist = 18 + Math.random() * 24;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;
    const rot = Math.random() * 120 - 60;

    particle.className = "magic-particle";
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 4 + Math.random() * 3;

    particle.style.cssText = `
      position: fixed;
      left: ${x}px; top: ${y}px;
      width: ${size}px; height: ${size}px;
      background: ${color};
      border-radius: 50%;
      box-shadow: 0 0 6px ${color};
      pointer-events: none;
      z-index: 99999;
      --tx: ${tx}px; --ty: ${ty}px; --rot: ${rot};
    `;
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 500);
  }
}

export function initClickSparkles() {
  // sparkles live in initGlobalListeners
}

export function initKeyboardShortcuts() {
  const handler = (e) => {
    if (e.key === "Escape") {
      const knownModalIds = [
        "card-modal-backdrop", "book-finish-modal",
        "boss-win-modal", "pk-win-modal", "rest-modal"
      ];
      let activeModal = null;
      for (const id of knownModalIds) {
        const el = document.getElementById(id);
        if (el && !el.classList.contains("hidden")) {
          activeModal = el;
          break;
        }
      }
      if (!activeModal) {
        activeModal = document.querySelector("[data-modal='true']:not(.hidden)");
      }
      if (activeModal) {
        const closeBtn = activeModal.querySelector("#btn-close-modal, #btn-finish-return-shelf, #btn-boss-claim, #btn-pk-claim");
        if (closeBtn) closeBtn.click();
      } else if (this.currentMode !== "map") {
        soundAndFX.playPop();
        this.transitionToMode("map");
      }
    }

    if (this.currentMode === "books" && this.bookModule && this.bookModule.currentBook) {
      const root = this.bookModule.container || document;
      if (e.key === "ArrowRight") {
        const nextBtn = root.querySelector("#btn-next-page");
        if (nextBtn) nextBtn.click();
      } else if (e.key === "ArrowLeft") {
        const prevBtn = root.querySelector("#btn-prev-page");
        if (prevBtn) prevBtn.click();
      } else if (e.key === " " || e.key === "Spacebar") {
        const karaokeBtn = root.querySelector("#btn-play-karaoke");
        if (karaokeBtn) karaokeBtn.click();
      }
    }
  };
  window.addEventListener("keydown", handler);
  this._addCleanup(() => window.removeEventListener("keydown", handler));
}

export function warmupNeuralVoice() {
  const runner = () => {
    if (neuralVoice.available === false || soundAndFX.neuralVoiceEnabled === false) return;

    try {
      const items = ["真棒！", "再试一次", "太厉害了！", "准备好了吗？", "点击开始！"];
      const sampleChars = (CHARACTER_DATABASE || []).slice(0, 5);
      for (const c of sampleChars) {
        if (c.char) items.push(c.char);
        if (c.pinyin) items.push(`${c.char}${c.pinyin}`);
        for (const w of (c.words || []).slice(0, 2)) {
          const wordText = typeof w === "string" ? w : w.word;
          if (wordText) items.push(wordText);
        }
      }
      neuralVoice.warmup([...new Set(items)]);
    } catch (e) { /* 预热失败不影响主流程 */ }
  };

  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(runner, { timeout: 3000 });
  } else {
    setTimeout(runner, 2500);
  }
}
