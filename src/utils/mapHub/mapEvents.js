/** MapModule — node clicks, sign-in, drag scroll */
import { CHARACTER_DATABASE } from "../../data/characters.js";
import { ebbinghausManager } from "../ebbinghaus.js";
import { soundAndFX } from "../soundEngine.js";
import { showGameToast } from "../../components/SharedShell.js";
import { EVENTS } from "../eventBus.js";
import { openDailyQuestModal } from "./dailyQuestModal.js";

export function autoScrollToCurrent() {
  // 找到当前学习中的关卡节点
  const currentNode = this.container.querySelector(".level-node.is-current");
  const viewport = this.container.querySelector("#map-scroll-viewport");
  if (currentNode && viewport) {
    this._timeout(() => {
      if (typeof currentNode.getBoundingClientRect === "function" && typeof viewport.getBoundingClientRect === "function") {
        const nodeRect = currentNode.getBoundingClientRect();
        const viewportRect = viewport.getBoundingClientRect();
        const offset = nodeRect.left - viewportRect.left - (viewportRect.width / 2) + (nodeRect.width / 2);
        if (typeof viewport.scrollTo === "function") {
          viewport.scrollTo({ left: (viewport.scrollLeft || 0) + offset, behavior: "smooth" });
        } else {
          viewport.scrollLeft = (viewport.scrollLeft || 0) + offset;
        }
      }
    }, 300);
  }
}

export function bindEvents(mainEl) {
  // 关卡点击
  mainEl.querySelectorAll(".level-node").forEach((node) => {
    this._on(node, "click", () => {
      const charId = node.dataset.charId;
      const charData = CHARACTER_DATABASE.find((c) => c.id === charId);
      if (charData) {
        soundAndFX.playPop();
        soundAndFX.playSunRise();
        this._busEmit(EVENTS.START_LEARN, { charData });
      }
    });
  });

  // 岛屿切换
  mainEl.querySelectorAll(".island-tab-btn").forEach((btn) => {
    this._on(btn, "click", () => {
      const islandId = parseInt(btn.dataset.island, 10);
      soundAndFX.playPop();
      this.renderIsland(islandId);
    });
  });

  // 今日学练探险 Quest Modal
  const dailyQuestBtn = mainEl.querySelector("#btn-daily-quest");
  if (dailyQuestBtn) {
    this._on(dailyQuestBtn, "click", () => {
      soundAndFX.playPop();
      openDailyQuestModal(this.container, {
        onStartLearn: (charData) => {
          this._busEmit(EVENTS.START_LEARN, { charData });
        },
        onStartReview: () => {
          this._busEmit(EVENTS.SWITCH_MODE, { mode: "review" });
        },
      });
    });
  }

  // 世界全景图 Modal 打开 / 关闭 / 传送
  const openOverviewBtn = mainEl.querySelector("#btn-open-world-overview");
  const closeOverviewBtn = mainEl.querySelector("#btn-close-world-overview");
  const overviewModal = mainEl.querySelector("#world-overview-modal");

  if (openOverviewBtn && overviewModal) {
    this._on(openOverviewBtn, "click", () => {
      soundAndFX.playPop();
      this.showWorldOverview = true;
      overviewModal.classList.remove("hidden");
    });
  }

  if (closeOverviewBtn && overviewModal) {
    this._on(closeOverviewBtn, "click", () => {
      soundAndFX.playPop();
      this.showWorldOverview = false;
      overviewModal.classList.add("hidden");
    });
  }

  mainEl.querySelectorAll(".island-teleport-card").forEach((card) => {
    this._on(card, "click", () => {
      const islandId = parseInt(card.dataset.island, 10);
      soundAndFX.playStarChime();
      soundAndFX.triggerConfetti(this.container);
      this.showWorldOverview = false;
      this.renderIsland(islandId);
    });
  });

  // 地标建筑直达
  mainEl.querySelectorAll(".map-landmark-btn").forEach((btn) => {
    this._on(btn, "click", () => {
      const mode = btn.dataset.mode;
      soundAndFX.playPop();
      this._busEmit(EVENTS.SWITCH_MODE, { mode });
    });
  });

  // 每日签到
  const signinBtn = mainEl.querySelector("#btn-daily-signin");
  if (signinBtn) {
    this._on(signinBtn, "click", () => {
      if (ebbinghausManager.progress.todaySignedIn) return;
      soundAndFX.playSuccessSound();
      soundAndFX.triggerConfetti(this.container);
      soundAndFX.triggerCoinFly(this.container);
      ebbinghausManager.doSignIn();
      showGameToast(this.container, "签到成功！获得 5 星币！连续打卡中...", "success");
      this._timeout(() => this.render(), 1500);
    });
  }

  // 快捷直达
  const quickBtn = mainEl.querySelector("#btn-quick-target-char");
  if (quickBtn) {
    this._on(quickBtn, "click", () => {
      const currentIdx = Math.max(0, (ebbinghausManager.progress.currentLevelIndex || 1) - 1);
      const targetChar = CHARACTER_DATABASE[Math.min(currentIdx, CHARACTER_DATABASE.length - 1)] || CHARACTER_DATABASE[0];
      soundAndFX.playPop();
      this._busEmit(EVENTS.START_LEARN, { charData: targetChar });
    });
  }

  // 惯性横向拖拽 (支持鼠标 + 移动触控)
  const viewport = mainEl.querySelector("#map-scroll-viewport");
  if (viewport) {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    // 鼠标事件
    this._on(viewport, "mousedown", (e) => {
      isDown = true;
      startX = e.pageX - viewport.offsetLeft;
      scrollLeft = viewport.scrollLeft;
    });

    this._on(viewport, "mouseleave", () => {
      isDown = false;
    });

    this._on(viewport, "mouseup", () => {
      isDown = false;
    });

    this._on(viewport, "mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - viewport.offsetLeft;
      const walk = (x - startX) * 2;
      viewport.scrollLeft = scrollLeft - walk;
    });

    // 触摸事件 (移动端与平板) — 允许点击穿透，并在滑动时流畅平移大地图
    this._on(viewport, "touchstart", (e) => {
      if (!e.touches || e.touches.length === 0) return;
      isDown = true;
      startX = e.touches[0].pageX - viewport.offsetLeft;
      scrollLeft = viewport.scrollLeft;
    }, { passive: true });

    this._on(viewport, "touchend", () => {
      isDown = false;
    });

    this._on(viewport, "touchmove", (e) => {
      if (!isDown || !e.touches || e.touches.length === 0) return;
      const x = e.touches[0].pageX - viewport.offsetLeft;
      const walk = (x - startX) * 1.5;
      viewport.scrollLeft = scrollLeft - walk;
    }, { passive: true });
  }
}
