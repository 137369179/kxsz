/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderMeteorDefense } from "../../src/utils/playHub/meteorDefense.js";
import { CHARACTER_DATABASE } from "../../src/data/characters.js";
import { ebbinghausManager } from "../../src/utils/ebbinghaus.js";
import { soundAndFX } from "../../src/utils/soundEngine.js";

describe("PlayHub - Meteor Defense", () => {
  let mockContainer;

  beforeEach(() => {
    mockContainer = document.createElement("div");
    document.body.appendChild(mockContainer);
    vi.spyOn(ebbinghausManager, "addCoins").mockImplementation(() => {});
    vi.spyOn(ebbinghausManager, "completeReview").mockImplementation(() => {});
    vi.spyOn(soundAndFX, "playSuccessSound").mockImplementation(() => {});
    vi.spyOn(soundAndFX, "playSoftError").mockImplementation(() => {});
    vi.spyOn(soundAndFX, "speakPriority").mockImplementation(() => {});
  });

  it("should initialize the meteor defense shell", () => {
    const context = {
      container: mockContainer,
      _addCleanup: vi.fn(),
      _on: vi.fn(),
      _timeout: vi.fn(),
      renderMeteorDefense
    };

    context.renderMeteorDefense();
    // Verify mountGameShell sets innerHTML
    expect(mockContainer.innerHTML).toContain("拦截目标");
  });
});
