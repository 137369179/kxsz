/** ParentModule — cross-device sync modals */
import { ebbinghausManager } from "../ebbinghaus.js";
import { soundAndFX } from "../soundEngine.js";
import { showGameToast } from "../../components/SharedShell.js";
import { GAME_ICONS } from "../gameIcons.js";
import { drawQRCode } from "../qrCode.js";
import { storageManager } from "../storageManager.js";

export function showSyncQRModal() {
    const token = storageManager.exportSyncToken();
    if (!token) {
      showGameToast(this.container, "生成换机数据失败", "error");
      return;
    }

    const overlay = document.createElement("div");
    overlay.id = "parent-sync-export-overlay";
    overlay.className = "fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in select-none";
    overlay.innerHTML = `
      <div class="relative max-w-sm w-full bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        <button id="btn-close-sync-qr" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-black flex items-center justify-center cursor-pointer">
          ${GAME_ICONS.back("w-4 h-4")}
        </button>

        <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
          ${GAME_ICONS.sparkle("w-6 h-6")}
        </div>
        <h3 class="text-lg font-black text-amber-950 mb-1">跨设备换机迁移二维码</h3>
        <p class="text-xs text-gray-500 mb-4">在新设备打开凯茜识字，进入家长中心选择“导入换机进度”，即可恢复全部数据！</p>

        <div class="relative p-3 bg-white border-4 border-amber-300 rounded-2xl shadow-inner mb-4">
          <div class="absolute top-1.5 left-1.5 w-4 h-4 border-t-4 border-l-4 border-amber-600 rounded-tl pointer-events-none"></div>
          <div class="absolute top-1.5 right-1.5 w-4 h-4 border-t-4 border-r-4 border-amber-600 rounded-tr pointer-events-none"></div>
          <div class="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-4 border-l-4 border-amber-600 rounded-bl pointer-events-none"></div>
          <div class="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-4 border-r-4 border-amber-600 rounded-br pointer-events-none"></div>
          <canvas id="sync-qr-canvas" width="220" height="220" class="rounded-lg"></canvas>
        </div>

        <button id="btn-copy-sync-token" class="w-full btn-game-orange text-white font-black text-xs py-3 rounded-full shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer">
          <span class="flex items-center">${GAME_ICONS.cards("w-4 h-4")}</span>
          <span>点击复制迁移码 (文本)</span>
        </button>
      </div>
    `;
    document.body.appendChild(overlay);

    const canvas = overlay.querySelector("#sync-qr-canvas");
    // HiDPI 支持
    const dpr = typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1;
    if (dpr > 1) {
      canvas.width = 220 * dpr;
      canvas.height = 220 * dpr;
      canvas.style.width = "220px";
      canvas.style.height = "220px";
    }
    drawQRCode(canvas, token, { size: 220, margin: 2, darkColor: "#78350f" });

    this._on(overlay.querySelector("#btn-close-sync-qr"), "click", () => overlay.remove());
    this._on(overlay.querySelector("#btn-copy-sync-token"), "click", async () => {
      try {
        await navigator.clipboard.writeText(token);
        soundAndFX.playSuccessSound();
        showGameToast(this.container, "迁移码已复制！可直接发送给新设备粘贴导入！", "success");
      } catch {
        showGameToast(this.container, "复制失败，请截图保存二维码哦！", "info");
      }
    });
  }

  /**
   * 弹出跨设备换机迁移导入弹窗
   */
export function showImportSyncModal() {
    const overlay = document.createElement("div");
    overlay.id = "parent-sync-import-overlay";
    overlay.className = "fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in select-none";
    overlay.innerHTML = `
      <div class="relative max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        <button id="btn-close-import-sync" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-black flex items-center justify-center cursor-pointer">
          ${GAME_ICONS.back("w-4 h-4")}
        </button>

        <h3 class="text-lg font-black text-amber-950 mb-1">导入跨设备换机进度</h3>
        <p class="text-xs text-gray-500 mb-4 leading-relaxed">请将旧设备上生成的【迁移码】粘贴到下方文本框中：</p>

        <textarea id="sync-token-input" rows="4" placeholder="在此粘贴 CATHY_SYNC_V1:... 迁移码" class="w-full bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-3 text-xs text-gray-800 font-mono mb-3 focus:outline-none focus:ring-2 focus:ring-amber-400"></textarea>

        <div class="w-full flex items-center gap-3 mb-3">
          <button id="btn-paste-sync-token" class="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs py-2.5 rounded-full border border-amber-300 shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer">
            <span class="flex items-center">${GAME_ICONS.cards("w-3.5 h-3.5")}</span>
            <span>从剪贴板快捷粘贴</span>
          </button>
        </div>

        <button id="btn-confirm-import-sync" class="w-full btn-game-orange text-white font-black text-xs py-3 rounded-full shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer">
          <span class="flex items-center">${GAME_ICONS.sparkle("w-4 h-4")}</span>
          <span>立即导入恢复进度</span>
        </button>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = overlay.querySelector("#sync-token-input");

    this._on(overlay.querySelector("#btn-close-import-sync"), "click", () => overlay.remove());

    const pasteBtn = overlay.querySelector("#btn-paste-sync-token");
    if (pasteBtn && input) {
      this._on(pasteBtn, "click", async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (text && text.trim().startsWith("CATHY_SYNC_V1:")) {
            input.value = text.trim();
            soundAndFX.playPop();
            showGameToast(this.container, "已粘贴剪贴板中的迁移码！", "success");
          } else {
            showGameToast(this.container, "剪贴板中未找到以 CATHY_SYNC_V1 开头的有效迁移码", "info");
          }
        } catch {
          showGameToast(this.container, "请在输入框中长按进行粘贴", "info");
        }
      });
    }
    this._on(overlay.querySelector("#btn-confirm-import-sync"), "click", () => {
      const input = overlay.querySelector("#sync-token-input");
      const val = input ? input.value.trim() : "";
      const res = storageManager.importSyncToken(val);
      if (res.ok) {
        soundAndFX.playVictoryFanfare();
        ebbinghausManager.init();
        showGameToast(this.container, `换机同步成功！已恢复 ${res.charCount} 个汉字与 ${res.coins} 枚星币！`, "success");
        overlay.remove();
        this.render();
      } else {
        soundAndFX.playSoftError();
        showGameToast(this.container, res.msg || "迁移码无效，请检查后重试！", "error");
      }
    });
  }

