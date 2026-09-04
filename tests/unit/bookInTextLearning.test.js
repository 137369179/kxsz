// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { openMiniCharTooltip } from "../../src/utils/bookHub/bookOverlays.js";
import { CHARACTER_DATABASE } from "../../src/data/characters.js";
import { EVENTS } from "../../src/utils/eventBus.js";

describe("Incidental Reading Acquisition (openMiniCharTooltip)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    const old = document.getElementById("book-mini-char-tooltip");
    if (old) old.remove();
  });

  it("renders a mini char tooltip for known character in database", () => {
    const targetChar = CHARACTER_DATABASE[0];
    const trigger = document.createElement("span");
    trigger.className = "karaoke-char";
    trigger.dataset.char = targetChar.char;
    document.body.appendChild(trigger);

    const ctx = {
      _busEmit: vi.fn(),
    };

    const tooltip = openMiniCharTooltip.call(ctx, targetChar.char, trigger);
    expect(tooltip).not.toBeNull();
    expect(document.getElementById("book-mini-char-tooltip")).toBe(tooltip);

    // Verify character and pinyin display
    expect(tooltip.textContent).toContain(targetChar.char);
    expect(tooltip.textContent).toContain(targetChar.pinyin);

    // Verify speak button
    const speakBtn = tooltip.querySelector(".btn-mini-speak");
    expect(speakBtn).not.toBeNull();

    // Verify learn button
    const learnBtn = tooltip.querySelector(".btn-mini-learn");
    expect(learnBtn).not.toBeNull();
    expect(learnBtn.textContent).toContain("学这个字");

    // Click learn button should trigger START_LEARN event
    learnBtn.click();
    expect(ctx._busEmit).toHaveBeenCalledWith(EVENTS.START_LEARN, { charData: targetChar });
    expect(document.getElementById("book-mini-char-tooltip")).toBeNull();
  });

  it("returns null and does not mount tooltip for non-database characters (punctuation / rare)", () => {
    const trigger = document.createElement("span");
    document.body.appendChild(trigger);

    const tooltip = openMiniCharTooltip.call({}, "，", trigger);
    expect(tooltip).toBeNull();
    expect(document.getElementById("book-mini-char-tooltip")).toBeNull();
  });

  it("closes tooltip when close button is clicked", () => {
    const targetChar = CHARACTER_DATABASE[1];
    const trigger = document.createElement("span");
    document.body.appendChild(trigger);

    const tooltip = openMiniCharTooltip.call({}, targetChar.char, trigger);
    expect(document.getElementById("book-mini-char-tooltip")).not.toBeNull();

    const closeBtn = tooltip.querySelector(".btn-close-mini");
    expect(closeBtn).not.toBeNull();
    closeBtn.click();

    expect(document.getElementById("book-mini-char-tooltip")).toBeNull();
  });
});
