/**
 * 凯茜识字 (Cathy Literacy) - 分级绘本馆与沉浸式阅读器 (深度对标洪恩绘本标杆体验)
 * 核心特色体系：
 *  1. 分阶与主题书架筛选（全部 / 第1阶·启蒙森林 / 第2阶·缤纷生活 / 第3阶·星际进阶）
 *  2. 已读通关印章（金色皇冠 + 通关三星）与在读进度持久化
 *  3. 16:9 影院级大画幅绘本与画面隐藏互动寻宝热区
 *  4. 毫秒级字界事件驱动的卡拉OK伴读 + 单字精准点读
 *  5. 汉字顶部标准拼音注音（Ruby Pinyin）一键显隐切换
 *  6. 一键【自动连读】全本沉浸伴读模式（自动伴读、延时展示、平滑翻页）
 *  7. 【生字全息速查卡】(洪恩标杆)：田字格、字源演变、组词造句、发音朗读
 *  8. 【全书缩略图目录抽屉】(洪恩标杆)：对开页缩略图、快速跳页导航
 *  9. 【我来读一读】：儿童智能跟读打分、声波波形与亲子录音回放
 *  10. 【双重阅读测评 + 荣誉结业证书】(洪恩标杆)：生字眼力考验、故事理解问答、金牌结业证书
 */

import { BaseModule } from "../utils/BaseModule.js";
import { soundAndFX } from "../utils/soundEngine.js";
import { pronunciationEval } from "../utils/pronunciationEval.js";
import { openUserVoiceModal } from "../utils/bookHub/bookVoiceModal.js";
import { renderShelf } from "../utils/bookHub/bookShelf.js";
import { openCharPopover, openCatalogDrawer, openMiniCharTooltip } from "../utils/bookHub/bookOverlays.js";
import { renderQuiz, renderCertificate, playKaraoke } from "../utils/bookHub/bookQuizFlow.js";
import { renderReader, bindReaderEvents } from "../utils/bookHub/bookReader.js";
import { storageManager } from "../utils/storageManager.js";
export class BookModule extends BaseModule {
  constructor(container) {
    super(container);
    this.currentBook = null;
    this.currentPageIndex = 0;
    this.isQuizMode = false;
    this.isCertificateMode = false;
    this.quizAnswered = false;
    this.karaokeTimer = null;
    this.currentFilterStage = "all"; // "all" | 1 | 2 | 3
    this.isAutoPlay = false; // 自动连读开关
    this.showPinyin = true; // 拼音注音显隐开关
    this.autoPlayTimer = null;
    this.userRecordedBlob = null;
    this.userRecordedUrl = null;

    // 阅读进度持久化 key
    this._progressKey = "cathy_book_progress_v2";
    this.progressMap = {}; // { bookId: pageIndex }
    this.karaokeSessionId = 0;
    this.currentQuizStage = 1; // 1: 生字眼力考验, 2: 故事理解问答
    this.isVoiceModalOpen = false;
    this.isCatalogOpen = false;
    this.isCharPopoverOpen = false;
    this._loadProgress();
  }

  /** 从 storageManager 恢复阅读进度 */
  _loadProgress() {
    try {
      const raw = storageManager.getItem(this._progressKey);
      if (raw) {
        this.progressMap = JSON.parse(raw);
      }
    } catch (e) {
      console.warn("[BookModule] 加载阅读进度失败:", e);
      this.progressMap = {};
    }
  }

  /** 保存阅读进度到 storageManager */
  _saveProgress() {
    if (this.currentBook) {
      this.progressMap[this.currentBook.id] = this.currentPageIndex;
    }
    try {
      storageManager.setItem(this._progressKey, JSON.stringify(this.progressMap));
    } catch {}
  }

  destroy() {
    if (this.karaokeTimer) {
      clearInterval(this.karaokeTimer);
      this.karaokeTimer = null;
    }
    if (this.autoPlayTimer) {
      clearTimeout(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
    if (this.userRecordedUrl) {
      URL.revokeObjectURL(this.userRecordedUrl);
      this.userRecordedUrl = null;
    }
    const pe = pronunciationEval || (typeof window !== "undefined" ? window.pronunciationEval : null);
    if (pe && pe.state === "listening") {
      try { pe.stopAndEvaluate(); } catch {}
    }
    if (typeof document !== "undefined") {
      document.getElementById("char-popover-overlay")?.remove();
      document.getElementById("book-catalog-drawer-overlay")?.remove();
      document.getElementById("user-voice-modal-overlay")?.remove();
    }
    this.karaokeSessionId++;
    this.isVoiceModalOpen = false;
    this.isCatalogOpen = false;
    this.isCharPopoverOpen = false;
    try { soundAndFX.stopSpeaking?.(); } catch {}
    super.destroy();
  }

  render() {
    this.destroy();
    if (!this.currentBook) {
      this.renderShelf();
    } else if (this.isCertificateMode) {
      this.renderCertificate();
    } else if (this.isQuizMode) {
      this.renderQuiz();
    } else {
      this.renderReader();
    }
  }

  // ----------------------------------------------------
  // 1. 绘本馆书架界面 (分阶筛选 + 已读印章)
  // ----------------------------------------------------
  renderShelf() { return renderShelf.call(this); }

  // ----------------------------------------------------
  // 2. 16:9 影院级绘本阅读器
  // ----------------------------------------------------
  renderReader() { return renderReader.call(this); }
  bindReaderEvents(mainEl, page, book) { return bindReaderEvents.call(this, mainEl, page, book); }

  // 4-5. 生字全息卡 + 全书目录抽屉
  // ----------------------------------------------------
  openCharPopover(charStr) { return openCharPopover.call(this, charStr); }
  openMiniCharTooltip(charStr, triggerEl) { return openMiniCharTooltip.call(this, charStr, triggerEl); }
  openCatalogDrawer(book) { return openCatalogDrawer.call(this, book); }

  // ----------------------------------------------------
  // 6. 我来读一读（儿童智能跟读打分与录音）
  // ----------------------------------------------------
  openUserVoiceModal(page) { return openUserVoiceModal.call(this, page); }

  renderQuiz() { return renderQuiz.call(this); }
  renderCertificate() { return renderCertificate.call(this); }
  playKaraoke(page, mainEl) { return playKaraoke.call(this, page, mainEl); }

}
