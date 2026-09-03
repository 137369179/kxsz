/**
 * 凯茜识字 (Cathy Literacy) - 1:1 横屏无缝大地图 (Landscape World Map)
 * 纯正游戏化沉浸式界面：横向惯性拖拽漫游、3D浮岛关卡节点、凯茜全动态伴学、三大主题岛屿与地标建筑
 */

import { CHARACTER_DATABASE } from "../data/characters.js";
import { ebbinghausManager } from "../utils/ebbinghaus.js";
import { BaseModule } from "../utils/BaseModule.js";
import { setDeps as _spSetDeps } from "../utils/sessionPlanner.js";
import { renderMap } from "../utils/mapHub/mapRender.js";
import { autoScrollToCurrent, bindEvents } from "../utils/mapHub/mapEvents.js";

export class MapModule extends BaseModule {
  constructor(container) {
    super(container);
    this.currentIsland = 1; // 1: 森林岛 | 2: 生活岛 | 3: 太空岛
    this.scrollX = 0;
    this.showWorldOverview = false;
    this._userSelectedIsland = false;
    // E6 B4 米勒 7±2 块化：注入 deps，供 sessionPlanner 使用
    _spSetDeps({ ebbinghaus: ebbinghausManager, characterDB: CHARACTER_DATABASE });
  }

  render() { return renderMap.call(this); }

  renderIsland(islandId) {
    this._userSelectedIsland = true;
    this.currentIsland = islandId;
    this.render();
  }

  autoScrollToCurrent() { return autoScrollToCurrent.call(this); }
  bindEvents(mainEl) { return bindEvents.call(this, mainEl); }
}
