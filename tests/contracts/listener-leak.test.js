import { describe, it, expect, vi, beforeEach } from "vitest";
import { BaseModule } from "../../src/utils/BaseModule.js";
import { eventBus, EVENTS } from "../../src/utils/eventBus.js";

function createMockElement(tag, id = "", classes = []) {
  const listeners = {};
  const el = {
    tagName: tag.toUpperCase(),
    id,
    classList: {
      contains: (c) => classes.includes(c),
      add: (c) => { if (!classes.includes(c)) classes.push(c); },
      remove: (c) => { const i = classes.indexOf(c); if (i > -1) classes.splice(i, 1); }
    },
    addEventListener: vi.fn((evt, fn) => {
      listeners[evt] = listeners[evt] || [];
      listeners[evt].push(fn);
    }),
    removeEventListener: vi.fn((evt, fn) => {
      if (listeners[evt]) {
        const i = listeners[evt].indexOf(fn);
        if (i > -1) listeners[evt].splice(i, 1);
      }
    }),
    click: vi.fn(() => {
      if (listeners["click"]) listeners["click"].forEach(fn => fn());
    }),
    children: [],
  };
  return el;
}

const mockWindowListeners = {};
global.window = global.window || {
  addEventListener: vi.fn((evt, fn) => {
    mockWindowListeners[evt] = mockWindowListeners[evt] || [];
    mockWindowListeners[evt].push(fn);
  }),
  removeEventListener: vi.fn(),
};

const mockDocListeners = {};
global.document = global.document || {
  body: { appendChild: vi.fn() },
  addEventListener: vi.fn((evt, fn) => {
    mockDocListeners[evt] = mockDocListeners[evt] || [];
    mockDocListeners[evt].push(fn);
  }),
  removeEventListener: vi.fn(),
  createElement: vi.fn((tag) => createMockElement(tag)),
};

describe("BaseModule & Listener Lifecycle Contract (Zero Leakage)", () => {
  let container;

  beforeEach(() => {
    const btn1 = createMockElement("button", "btn-primary", ["test-btn"]);
    const btn2 = createMockElement("button", "btn-secondary", ["test-btn"]);
    const cardA = createMockElement("div", "", ["card-item"]);
    const cardB = createMockElement("div", "", ["card-item"]);

    container = createMockElement("div", "test-root");
    container.children = [btn1, btn2, cardA, cardB];

    container.querySelector = vi.fn((sel) => {
      if (sel === "#btn-primary") return btn1;
      if (sel === "#btn-secondary") return btn2;
      return null;
    });

    container.querySelectorAll = vi.fn((sel) => {
      if (sel === ".test-btn") return [btn1, btn2];
      if (sel === ".card-item") return [cardA, cardB];
      return [];
    });
  });

  it("should track and clean up _on element listener upon destroy()", () => {
    const mod = new BaseModule(container);
    const btn = container.querySelector("#btn-primary");
    const clickSpy = vi.fn();
    const removeSpy = vi.spyOn(btn, "removeEventListener");

    mod._on(btn, "click", clickSpy);
    btn.click();
    expect(clickSpy).toHaveBeenCalledTimes(1);

    mod.destroy();
    expect(removeSpy).toHaveBeenCalledWith("click", clickSpy, undefined);

    btn.click();
    expect(clickSpy).toHaveBeenCalledTimes(1); // Not called again
  });

  it("should support _onDom with string selector and clean up all matched elements", () => {
    const mod = new BaseModule(container);
    const buttons = container.querySelectorAll(".test-btn");
    const clickSpy = vi.fn();
    const removeSpies = Array.from(buttons).map(b => vi.spyOn(b, "removeEventListener"));

    mod._onDom(".test-btn", "click", clickSpy);

    buttons[0].click();
    buttons[1].click();
    expect(clickSpy).toHaveBeenCalledTimes(2);

    mod.destroy();
    removeSpies.forEach(spy => {
      expect(spy).toHaveBeenCalledWith("click", clickSpy, undefined);
    });

    buttons[0].click();
    expect(clickSpy).toHaveBeenCalledTimes(2);
  });

  it("should support _onDom with NodeList and clean up all elements", () => {
    const mod = new BaseModule(container);
    const cards = container.querySelectorAll(".card-item");
    const clickSpy = vi.fn();
    const removeSpies = Array.from(cards).map(c => vi.spyOn(c, "removeEventListener"));

    mod._onDom(cards, "click", clickSpy);
    cards[0].click();
    expect(clickSpy).toHaveBeenCalledTimes(1);

    mod.destroy();
    removeSpies.forEach(spy => {
      expect(spy).toHaveBeenCalledWith("click", clickSpy, undefined);
    });
  });

  it("should clean up _onWindow and _onDocument upon destroy()", () => {
    const mod = new BaseModule(container);
    const winRemoveSpy = vi.spyOn(window, "removeEventListener");
    const docRemoveSpy = vi.spyOn(document, "removeEventListener");
    const noop = () => {};

    mod._onWindow("resize", noop);
    mod._onDocument("visibilitychange", noop);

    expect(mod._cleanups.length).toBe(2);
    mod.destroy();

    expect(winRemoveSpy).toHaveBeenCalledWith("resize", noop, undefined);
    expect(docRemoveSpy).toHaveBeenCalledWith("visibilitychange", noop, undefined);
    expect(mod._cleanups.length).toBe(0);
  });

  it("should clean up timers (_timeout and _interval) upon destroy()", () => {
    vi.useFakeTimers();
    const mod = new BaseModule(container);
    const timerSpy = vi.fn();

    mod._timeout(timerSpy, 1000);
    mod._interval(timerSpy, 500);

    mod.destroy();
    vi.advanceTimersByTime(2000);

    expect(timerSpy).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("should cleanly unbind _busOn upon destroy()", () => {
    const mod = new BaseModule(container);
    const busSpy = vi.fn();

    mod._busOn(EVENTS.PROGRESS_CHANGED, busSpy);
    eventBus.emit(EVENTS.PROGRESS_CHANGED, { test: 1 });
    expect(busSpy).toHaveBeenCalledTimes(1);

    mod.destroy();
    eventBus.emit(EVENTS.PROGRESS_CHANGED, { test: 2 });
    expect(busSpy).toHaveBeenCalledTimes(1); // No leak
  });
});
