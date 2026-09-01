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
})
