import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EbbinghausManager } from '../../src/utils/ebbinghaus.js'

describe('EbbinghausManager', () => {
  let mgr

  beforeEach(() => {
    mgr = new EbbinghausManager()
  })

  it('should initialize with default progress', () => {
    expect(mgr.progress.coins).toBe(60)
    expect(mgr.progress.stars).toBe(12)
    expect(mgr.progress.currentIsland).toBe(1)
  })

  it('should start with empty charRecords (no demo pollution)', () => {
    expect(mgr.progress.charRecords).toEqual({})
    expect(Object.keys(mgr.progress.charRecords).length).toBe(0)
  })

  it('should add coins correctly', () => {
    const initial = mgr.progress.coins
    mgr.addCoins(20)
    expect(mgr.progress.coins).toBe(initial + 20)
  })

  it('should complete a character and update records', () => {
    mgr.completeCharacter('char_new', 3)
    const record = mgr.progress.charRecords['char_new']
    expect(record).toBeDefined()
    expect(record.charId).toBe('char_new')
    expect(record.reviewCount).toBe(1)
    expect(record.isDifficult).toBe(false)
  })

  it('should mark character as difficult on wrong review', () => {
    mgr.completeCharacter('char_test', 1)
    mgr.completeReview('char_test', false)
    const record = mgr.progress.charRecords['char_test']
    expect(record.isDifficult).toBe(true)
    expect(record.correctStreak).toBe(0)
  })

  it('should return correct difficult char IDs', () => {
    mgr.completeCharacter('char_diff', 1)
    mgr.completeReview('char_diff', false)
    const diffIds = mgr.getDifficultCharIds()
    expect(diffIds).toContain('char_diff')
  })

  it('should update mastery rate on completion', () => {
    mgr.completeCharacter('char_rate', 3)
    const record = mgr.progress.charRecords['char_rate']
    expect(record.masteryRate).toBeGreaterThan(70)
  })

  it('should track today learned count', () => {
    const before = mgr.progress.todayLearnedCount
    mgr.completeCharacter('char_today', 3)
    expect(mgr.progress.todayLearnedCount).toBe(before + 1)
  })

  it('should increment stars on character completion', () => {
    const before = mgr.progress.stars
    mgr.completeCharacter('char_stars', 5)
    expect(mgr.progress.stars).toBe(before + 5)
  })

  it('should record mistakes into errorProfiles and diagnose top confused pair', () => {
    mgr.recordMistake('char_da', 'similar_confuse', { targetChar: '大', selectedChar: '太' })
    mgr.recordMistake('char_da', 'similar_confuse', { targetChar: '大', selectedChar: '太' })
    mgr.recordMistake('char_ri', 'similar_confuse', { targetChar: '日', selectedChar: '目' })
    mgr.recordMistake('char_shan', 'reverse_stroke', { strokeIndex: 1 })

    expect(mgr.progress.errorProfiles.confusedPairs['大']['太']).toBe(2)
    expect(mgr.progress.errorProfiles.confusedPairs['日']['目']).toBe(1)
    expect(mgr.progress.errorProfiles.reverseStrokeErrors['char_shan']).toBe(1)

    const top = mgr.getTopConfusedPair()
    expect(top).toEqual({ target: '大', confused: '太', count: 2 })
  })

  it('should deduct coins correctly and clamp to zero', () => {
      mgr.progress.coins = 50
      mgr.deductCoins(20)
      expect(mgr.progress.coins).toBe(30)
      mgr.deductCoins(100)
      expect(mgr.progress.coins).toBe(0)
    })

    // ── Bug 回归：recordMistake 必须也更新 charRecords 主记录 ──

    it('【回归】recordMistake 必须归零 correctStreak', () => {
      mgr.completeCharacter('char_mistake_fix', 3)
      const before = mgr.progress.charRecords['char_mistake_fix']
      expect(before.correctStreak).toBeGreaterThanOrEqual(1)

      mgr.recordMistake('char_mistake_fix', 'similar_confuse', { targetChar: '大', selectedChar: '太' })
      const after = mgr.progress.charRecords['char_mistake_fix']
      expect(after.correctStreak).toBe(0)
    })

    it('【回归】recordMistake 标记 isDifficult=true', () => {
      mgr.completeCharacter('char_mistake_hard', 3)
      expect(mgr.progress.charRecords['char_mistake_hard'].isDifficult).toBe(false)
      mgr.recordMistake('char_mistake_hard', 'pronunciation')
      expect(mgr.progress.charRecords['char_mistake_hard'].isDifficult).toBe(true)
    })

    it('【回归】recordMistake 扣分（masteryRate -15，clamp ≥ 0）', () => {
      mgr.completeCharacter('char_mistake_drop', 3)
      const before = mgr.progress.charRecords['char_mistake_drop'].masteryRate
      mgr.recordMistake('char_mistake_drop', 'reverse_stroke')
      const after = mgr.progress.charRecords['char_mistake_drop'].masteryRate
      expect(after).toBeLessThan(before)
      expect(after).toBeGreaterThanOrEqual(0)
    })

    it('【回归】连续 recordMistake 扣分不低于 0', () => {
      mgr.completeCharacter('char_mistake_many', 3)
      for (let i = 0; i < 10; i++) {
        mgr.recordMistake('char_mistake_many', 'similar_confuse', { targetChar: 'A', selectedChar: 'B' })
      }
      const final = mgr.progress.charRecords['char_mistake_many'].masteryRate
      expect(final).toBeGreaterThanOrEqual(0)
    })

    it('【回归】recordMistake 不丢 errorProfiles（主记录+画像同时更新）', () => {
      mgr.completeCharacter('char_mistake_both', 3)
      mgr.recordMistake('char_mistake_both', 'reverse_stroke', { strokeIndex: 1 })
      mgr.recordMistake('char_mistake_both', 'reverse_stroke', { strokeIndex: 2 })

      // 主记录正确被改过
      expect(mgr.progress.charRecords['char_mistake_both'].correctStreak).toBe(0)
      expect(mgr.progress.charRecords['char_mistake_both'].isDifficult).toBe(true)

      // 画像记录仍然完整
      expect(mgr.progress.errorProfiles.reverseStrokeErrors['char_mistake_both']).toBe(2)
    })

    // ── Bug 回归：fsrsCompleteCharacter masteryRate ≥ 70（不是 25） ──

    it('【回归】completeCharacter 3 星 → masteryRate ≥ 70', () => {
      mgr.completeCharacter('char_fix_rate_3', 3)
      expect(mgr.progress.charRecords['char_fix_rate_3'].masteryRate).toBeGreaterThanOrEqual(70)
    })

    it('【回归】completeCharacter 1 星 → masteryRate ≥ 55（不是 25）', () => {
      mgr.completeCharacter('char_fix_rate_1', 1)
      expect(mgr.progress.charRecords['char_fix_rate_1'].masteryRate).toBeGreaterThanOrEqual(55)
    })
  })


