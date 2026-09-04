/**
 * 凯茜识字 (Cathy Literacy) - 1490 字字卡中心与生词字典组件
 */

import { BaseModule } from "../utils/BaseModule.js";
import { CARD_PAGE_SIZE } from "../utils/cardHub/cardConstants.js";
import { getFilteredList } from "../utils/cardHub/cardFilter.js";
import { render as renderCards } from "../utils/cardHub/cardRender.js";
import {
  bindEvents,
  openStrokeDemoModal,
  renderCardDetailModal,
  openFlashcardSlideshowModal
} from "../utils/cardHub/cardEvents.js";

export class CardModule extends BaseModule {
  constructor(container) {
    super(container);
    this.currentFilter = "all";
    this.currentStage = "all";
    this.selectedRadical = "all";
    this.searchQuery = "";
    this.selectedCard = null;
    this.isCardFlipped = false;
    this.pageSize = CARD_PAGE_SIZE;
    this.displayCount = CARD_PAGE_SIZE;
    this._debounceTimer = null;
  }

  destroy() {
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = null;
    }
    if (typeof document !== "undefined") {
      document.getElementById("stroke-demo-overlay")?.remove();
      document.getElementById("flashcard-slideshow-overlay")?.remove();
    }
    super.destroy();
  }

  getFilteredList() { return getFilteredList.call(this); }
  render() { return renderCards.call(this); }
  bindEvents(mainEl) { return bindEvents.call(this, mainEl); }
  openStrokeDemoModal(c) { return openStrokeDemoModal.call(this, c); }
  renderCardDetailModal() { return renderCardDetailModal.call(this); }
  openFlashcardSlideshowModal(chars) { return openFlashcardSlideshowModal.call(this, chars); }
}
