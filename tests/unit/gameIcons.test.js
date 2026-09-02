import { describe, it, expect } from 'vitest';
import { GAME_ICONS } from '../../src/utils/gameIcons.js';

describe('GAME_ICONS 3D Image Icon Library', () => {
  it('should export all required icon generator functions', () => {
    expect(typeof GAME_ICONS.star).toBe('function');
    expect(typeof GAME_ICONS.coin).toBe('function');
    expect(typeof GAME_ICONS.trophy).toBe('function');
    expect(typeof GAME_ICONS.chest).toBe('function');
    expect(typeof GAME_ICONS.speaker).toBe('function');
    expect(typeof GAME_ICONS.swords).toBe('function');
    expect(typeof GAME_ICONS.bell).toBe('function');
    expect(typeof GAME_ICONS.brush).toBe('function');
    expect(typeof GAME_ICONS.compass).toBe('function');
    expect(typeof GAME_ICONS.crown).toBe('function');
    expect(typeof GAME_ICONS.gem).toBe('function');
    expect(typeof GAME_ICONS.mic).toBe('function');
    expect(typeof GAME_ICONS.scroll).toBe('function');
  });

  it('should render <img> tags with webp sources and never render <svg>', () => {
    const keys = ['star', 'coin', 'trophy', 'chest', 'swords', 'bell', 'brush', 'compass', 'crown', 'gem', 'mic', 'scroll'];
    for (const key of keys) {
      const html = GAME_ICONS[key]();
      expect(html).toContain('<img');
      expect(html).toContain('.webp');
      expect(html).not.toContain('<svg');
      expect(html).not.toContain('</svg>');
    }
  });

  it('should apply custom class names properly', () => {
    const customHtml = GAME_ICONS.star('w-12 h-12 custom-glow');
    expect(customHtml).toContain('w-12 h-12 custom-glow');
  });

  it('should support isGrey state for star icon', () => {
    const activeStar = GAME_ICONS.star(false);
    const greyStar = GAME_ICONS.star(true);
    expect(activeStar).not.toContain('grayscale');
    expect(greyStar).toContain('grayscale');
  });

  it('should support isMuted state for speaker icon', () => {
    const activeSpeaker = GAME_ICONS.speaker(false);
    const mutedSpeaker = GAME_ICONS.speaker(true);
    expect(activeSpeaker).toContain('icon_speaker.webp');
    expect(mutedSpeaker).toContain('icon_speaker_muted.webp');
  });

  it('should not output any Unicode emoji in any rendered icon string', () => {
    const EMOJI_RE = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    for (const [key, fn] of Object.entries(GAME_ICONS)) {
      if (typeof fn === 'function' && key !== '_parseIconParams') {
        const html = fn();
        expect(EMOJI_RE.test(html)).toBe(false);
      }
    }
  });
});
