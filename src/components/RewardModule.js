/**
 * 凯茜识字 - 奖励城堡与装扮商城
 */
import { BaseModule } from "../utils/BaseModule.js";
import { storageManager } from "../utils/storageManager.js";
import {
  render,
  _renderPanel,
  _renderStickerWall,
  _renderMedalWall,
  _renderCollection,
  _openGlyphTheater,
  _renderShop,
  _bindShopActions,
  _renderCalendar,
  _bindTabEvents,
  _bindCalendarNav,
  _celebrateNewMedals
} from "../utils/rewardHub/rewardViews.js";

export class RewardModule extends BaseModule {
  constructor(container) {
    super(container);
    this.activeTab = "stickers"; // stickers | medals | collection | calendar | shop
    const now = new Date();
    this.calYear = now.getFullYear();
    this.calMonth = now.getMonth();
    this.scrapbookStickers = storageManager.getJSON("cathy_scrapbook_stickers_v1", []);
    this.scrapbookBg = storageManager.getItem("cathy_scrapbook_bg_v1", "assets/images/cathy_island_forest.webp");
    this._scrapbookSaved = false;
  }

  render() { return render.call(this); }
  _renderPanel(...args) { return _renderPanel.call(this, ...args); }
  _renderStickerWall(...args) { return _renderStickerWall.call(this, ...args); }
  _renderMedalWall(...args) { return _renderMedalWall.call(this, ...args); }
  _renderCollection(...args) { return _renderCollection.call(this, ...args); }
  _openGlyphTheater(...args) { return _openGlyphTheater.call(this, ...args); }
  _renderShop(...args) { return _renderShop.call(this, ...args); }
  _bindShopActions(...args) { return _bindShopActions.call(this, ...args); }
  _renderCalendar(...args) { return _renderCalendar.call(this, ...args); }
  _bindTabEvents(...args) { return _bindTabEvents.call(this, ...args); }
  _bindCalendarNav(...args) { return _bindCalendarNav.call(this, ...args); }
  _celebrateNewMedals(...args) { return _celebrateNewMedals.call(this, ...args); }
}
