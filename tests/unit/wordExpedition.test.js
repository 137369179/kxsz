/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderWordExpedition, renderExpeditionTreasure, renderExpeditionVictory } from '../../src/utils/playHub/wordExpedition.js';

describe('Word Expedition', () => {
  let mockContext;
  let mockContainer;

  beforeEach(() => {
    mockContainer = document.createElement('div');
    mockContext = {
      container: mockContainer,
      expeditionState: null,
      currentMode: null,
      isExpeditionActive: false,
      render: vi.fn(),
      renderWordExpedition: renderWordExpedition,
      renderExpeditionTreasure: renderExpeditionTreasure,
      renderExpeditionVictory: renderExpeditionVictory,
      _addCleanup: vi.fn(),
      _on: (el, evt, cb) => el.addEventListener(evt, cb),
      _timeout: (cb, t) => setTimeout(cb, t)
    };
    
    // Bind the methods to the mockContext
    mockContext.renderWordExpedition = mockContext.renderWordExpedition.bind(mockContext);
    mockContext.renderExpeditionTreasure = mockContext.renderExpeditionTreasure.bind(mockContext);
    mockContext.renderExpeditionVictory = mockContext.renderExpeditionVictory.bind(mockContext);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.skip('should initialize and display map', () => {
    mockContext.renderWordExpedition();
    
    // By default, no state -> displays intro and start button
    const startBtn = mockContainer.querySelector('#expedition-start-btn');
    expect(startBtn).to.not.be.null;
  });

  it.skip('should start a new expedition and set active state', () => {
    mockContext.renderWordExpedition();
    const startBtn = mockContainer.querySelector('#expedition-start-btn');
    
    startBtn.click();
    
    expect(mockContext.expeditionState).to.not.be.null;
    expect(mockContext.expeditionState.stage).to.equal(1);
    expect(mockContext.expeditionState.hp).to.equal(3);
    expect(mockContext.render).toHaveBeenCalled();
  });

  it.skip('should end expedition and clear state on victory', () => {
    mockContext.expeditionState = { stage: 5, hp: 3, buffs: [] };
    mockContext.isExpeditionActive = true;
    
    mockContext.renderExpeditionVictory();

    const doneBtn = mockContainer.querySelector('#expedition-done-btn');
    expect(doneBtn).to.not.be.null;
    
    doneBtn.click();
    
    expect(mockContext.expeditionState).to.be.null;
    expect(mockContext.isExpeditionActive).to.be.false;
    expect(mockContext.currentMode).to.be.null;
    expect(mockContext.render).toHaveBeenCalled();
  });

  it.skip('should grant buffs at the buff stage', () => {
    mockContext.expeditionState = { stage: 3, hp: 3, buffs: [] };
    mockContext.isExpeditionActive = true;
    
    mockContext.renderExpeditionTreasure();

    const buffCards = mockContainer.querySelectorAll('.buff-card');
    expect(buffCards.length).to.be.greaterThan(0);
    
    buffCards[0].click();
    
    expect(mockContext.expeditionState.buffs.length).to.equal(1);
    expect(mockContext.expeditionState.stage).to.equal(4); // Advanced to next stage
    expect(mockContext.currentMode).to.equal('expedition');
    expect(mockContext.render).toHaveBeenCalled();
  });
});
