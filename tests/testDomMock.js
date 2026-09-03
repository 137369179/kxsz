import { vi } from "vitest";

const elementsMap = new Map();

export function createMockElement(tag = "div", id = "", classes = []) {
  const listeners = {};
  const dataset = {};
  const attributes = {};
  const classSet = new Set(classes);
  let _innerHTML = "";

  const el = {
    tagName: tag.toUpperCase(),
    id,
    dataset,
    attributes,
    style: {},
    children: [],
    parentElement: null,
    get innerHTML() {
      let html = _innerHTML;
      for (const child of el.children) {
        if (child && child.innerHTML) {
          html += child.innerHTML;
        }
      }
      return html;
    },
    set innerHTML(val) {
      _innerHTML = String(val);
      // 1. 提取所有 id=xxx 元素
      const idMatches = _innerHTML.matchAll(/id=["']([^"']+)["']/g);
      for (const m of idMatches) {
        const childId = m[1];
        if (!elementsMap.has(childId)) {
          const childEl = createMockElement("div", childId);
          elementsMap.set(childId, childEl);
          childEl.parentElement = el;
          el.children.push(childEl);
        }
      }
      // 2. 提取关键 class=xxx 元素（SharedShell main slot 等）
      const classMatches = _innerHTML.matchAll(/class=["']([^"']*?shell-content[^"']*)["']/g);
      for (const m of classMatches) {
        const cls = m[1];
        const existing = el.children.find((c) => c.classList && c.classList.contains("shell-content"));
        if (!existing) {
          const childEl = createMockElement("main", "", ["shell-content"]);
          childEl.parentElement = el;
          el.children.push(childEl);
        }
      }
      // 3. 提取所有 data-nav / shell-nav-btn 按钮
      const navMatches = _innerHTML.matchAll(/class=["']([^"']*?shell-nav-btn[^"']*)["']/g);
      for (const m of navMatches) {
        const existing = el.children.find((c) => c.classList && c.classList.contains("shell-nav-btn"));
        if (!existing) {
          const childEl = createMockElement("button", "", ["shell-nav-btn"]);
          childEl.parentElement = el;
          el.children.push(childEl);
        }
      }
    },
    textContent: "",
    classList: {
      add: vi.fn((...cls) => cls.forEach((c) => classSet.add(c))),
      remove: vi.fn((...cls) => cls.forEach((c) => classSet.delete(c))),
      contains: vi.fn((c) => classSet.has(c)),
      toggle: vi.fn((c, force) => {
        if (force !== undefined) {
          force ? classSet.add(c) : classSet.delete(c);
          return force;
        }
        if (classSet.has(c)) {
          classSet.delete(c);
          return false;
        } else {
          classSet.add(c);
          return true;
        }
      }),
      replace: vi.fn((o, n) => {
        classSet.delete(o);
        classSet.add(n);
      })
    },
    setAttribute: vi.fn((k, v) => { attributes[k] = String(v); }),
    getAttribute: vi.fn((k) => attributes[k] || null),
    addEventListener: vi.fn((evt, fn) => {
      listeners[evt] = listeners[evt] || [];
      listeners[evt].push(fn);
    }),
    removeEventListener: vi.fn((evt, fn) => {
      if (!listeners[evt]) return;
      listeners[evt] = listeners[evt].filter((h) => h !== fn);
    }),
    dispatchEvent: vi.fn((event) => {
      const fns = listeners[event.type] || [];
      fns.forEach((fn) => fn(event));
    }),
    click: vi.fn(() => {
      const fns = listeners["click"] || [];
      fns.forEach((fn) => fn({ type: "click", target: el, currentTarget: el, stopPropagation: () => {} }));
    }),
    appendChild: vi.fn((child) => {
      el.children.push(child);
      if (child && typeof child === "object") {
        child.parentElement = el;
        if (child.id) elementsMap.set(child.id, child);
      }
      return child;
    }),
    removeChild: vi.fn((child) => {
      el.children = el.children.filter((c) => c !== child);
      if (child && typeof child === "object") {
        child.parentElement = null;
        if (child.id) elementsMap.delete(child.id);
      }
      return child;
    }),
    remove: vi.fn(() => {
      if (el.parentElement) {
        el.parentElement.removeChild(el);
      }
      if (el.id) elementsMap.delete(el.id);
    }),
    querySelector: vi.fn((sel) => {
      if (typeof sel !== "string") return null;
      if (sel.startsWith("#")) {
        const targetId = sel.slice(1);
        if (el.id === targetId) return el;
        let found = elementsMap.get(targetId);
        if (!found) {
          found = createMockElement("div", targetId);
          elementsMap.set(targetId, found);
          el.children.push(found);
          found.parentElement = el;
        }
        return found;
      }
      if (sel.startsWith(".")) {
        const cls = sel.slice(1);
        let found = el.children.find((c) => c.classList && c.classList.contains(cls));
        if (!found) {
          found = createMockElement("div", "", [cls]);
          el.children.push(found);
          found.parentElement = el;
        }
        return found;
      }
      return el.children.find((c) => c.tagName === sel.toUpperCase()) || null;
    }),
    querySelectorAll: vi.fn(() => []),
    getBoundingClientRect: vi.fn(() => ({
      width: 360,
      height: 360,
      top: 0,
      left: 0,
      bottom: 360,
      right: 360
    })),
    getContext: vi.fn(() => ({
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      roundRect: vi.fn(),
      rect: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      lineTo: vi.fn(),
      moveTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      setLineDash: vi.fn(),
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      createPattern: vi.fn(() => ({})),
      fillStyle: "",
      strokeStyle: "",
      globalAlpha: 1,
      lineWidth: 1,
      font: "",
      shadowColor: "",
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0
    }))
  };

  if (id) {
    elementsMap.set(id, el);
  }

  return el;
}

export function resetElementsMap() {
  elementsMap.clear();
}

export function setupTestDom() {
  resetElementsMap();

  global.window = global.window || {
    innerWidth: 1024,
    innerHeight: 768,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    speechSynthesis: {
      speak: vi.fn(),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: vi.fn(() => [])
    }
  };

  global.document = global.document || {
    body: createMockElement("body"),
    createElement: vi.fn((tag) => {
      const el = createMockElement(tag);
      return el;
    }),
    getElementById: vi.fn((id) => elementsMap.get(id) || null),
    querySelector: vi.fn((sel) => {
      if (typeof sel === "string") {
        if (sel.startsWith("#")) {
          return elementsMap.get(sel.slice(1)) || null;
        }
      }
      return null;
    }),
    querySelectorAll: vi.fn(() => []),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  };
}
