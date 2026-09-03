/**
 * tests/unit/drillEngine.pinyin.test.js
 * ================================================================
 * E4: 拼音助手函数单元测试
 * ─────────────────────────────────────────────────────────────
 * 覆盖：
 *  - extractPinyinInitial: 单字母、双字母声母
 *  - extractPinyinFinal: 各种韵母
 *  - isCorrectPinyinInitial / isCorrectPinyinFinal
 *  - 边界情况（空字符串、无声母拼音）
 * ─────────────────────────────────────────────────────────────
 */

import { describe, it, expect } from 'vitest'
import {
  isCorrectPinyinInitial,
  isCorrectPinyinFinal,
  _pinyinHelpers,
} from '../../src/utils/drillEngine.js'

const { extractPinyinInitial, extractPinyinFinal, PINYIN_INITIALS } = _pinyinHelpers

// ── PINYIN_INITIALS 常量 ──────────────────────────────────────

describe('PINYIN_INITIALS 完整性', () => {
  it('包含所有 21 个声母（含 zh/ch/sh）', () => {
    expect(PINYIN_INITIALS).toContain('b'); expect(PINYIN_INITIALS).toContain('p')
    expect(PINYIN_INITIALS).toContain('m'); expect(PINYIN_INITIALS).toContain('f')
    expect(PINYIN_INITIALS).toContain('d'); expect(PINYIN_INITIALS).toContain('t')
    expect(PINYIN_INITIALS).toContain('n'); expect(PINYIN_INITIALS).toContain('l')
    expect(PINYIN_INITIALS).toContain('g'); expect(PINYIN_INITIALS).toContain('k')
    expect(PINYIN_INITIALS).toContain('h'); expect(PINYIN_INITIALS).toContain('j')
    expect(PINYIN_INITIALS).toContain('q'); expect(PINYIN_INITIALS).toContain('x')
    expect(PINYIN_INITIALS).toContain('zh'); expect(PINYIN_INITIALS).toContain('ch')
    expect(PINYIN_INITIALS).toContain('sh'); expect(PINYIN_INITIALS).toContain('r')
    expect(PINYIN_INITIALS).toContain('z'); expect(PINYIN_INITIALS).toContain('c')
    expect(PINYIN_INITIALS).toContain('s'); expect(PINYIN_INITIALS).toContain('y')
    expect(PINYIN_INITIALS).toContain('w')
  })
})

// ── extractPinyinInitial ──────────────────────────────────────

describe('extractPinyinInitial', () => {
  it('单字母声母: b', () => expect(extractPinyinInitial('bao')).toBe('b'))
  it('单字母声母: r', () => expect(extractPinyinInitial('ri')).toBe('r'))
  it('双字母声母: sh', () => expect(extractPinyinInitial('shuang')).toBe('sh'))
  it('双字母声母: zh', () => expect(extractPinyinInitial('zhong')).toBe('zh'))
  it('双字母声母: ch', () => expect(extractPinyinInitial('chang')).toBe('ch'))
  it('零声母: an', () => expect(extractPinyinInitial('an')).toBe(''))
  it('零声母: ou', () => expect(extractPinyinInitial('ou')).toBe(''))
  it('空字符串返回 ""', () => expect(extractPinyinInitial('')).toBe(''))
  it('null 返回 ""', () => expect(extractPinyinInitial(null)).toBe(''))
  it('undefined 返回 ""', () => expect(extractPinyinInitial(undefined)).toBe(''))
})

// ── extractPinyinFinal ────────────────────────────────────────

describe('extractPinyinFinal', () => {
  it('简单韵母 ao', () => expect(extractPinyinFinal('bao')).toBe('ao'))
  it('韵母 i', () => expect(extractPinyinFinal('ri')).toBe('i'))
  it('双字母声母 → 韵母 uang', () => expect(extractPinyinFinal('shuang')).toBe('uang'))
  it('零声母 → 韵母 an', () => expect(extractPinyinFinal('an')).toBe('an'))
  it('空字符串返回 ""', () => expect(extractPinyinFinal('')).toBe(''))
})

// ── isCorrectPinyinInitial ────────────────────────────────────

describe('isCorrectPinyinInitial', () => {
  it('正确声母 sh', () => expect(isCorrectPinyinInitial('shuang', 'sh')).toBe(true))
  it('错误声母 s（shuang 应是 sh）', () => expect(isCorrectPinyinInitial('shuang', 's')).toBe(false))
  it('错误声母 z（zhong 应是 zh）', () => expect(isCorrectPinyinInitial('zhong', 'z')).toBe(false))
  it('正确单字母 b', () => expect(isCorrectPinyinInitial('bao', 'b')).toBe(true))
  it('零声母：空候选正确', () => expect(isCorrectPinyinInitial('an', '')).toBe(true))
})

// ── isCorrectPinyinFinal ──────────────────────────────────────

describe('isCorrectPinyinFinal', () => {
  it('声母+韵母均正确', () => {
    expect(isCorrectPinyinFinal('shuang', 'sh', 'uang')).toBe(true)
  })
  it('声母错 → 韵母即使对也算错', () => {
    expect(isCorrectPinyinFinal('shuang', 's', 'uang')).toBe(false)
  })
  it('声母对 → 韵母错', () => {
    expect(isCorrectPinyinFinal('shuang', 'sh', 'ang')).toBe(false)
  })
  it('零声母 → 韵母直接判断', () => {
    expect(isCorrectPinyinFinal('an', '', 'an')).toBe(true)
    expect(isCorrectPinyinFinal('an', '', 'ang')).toBe(false)
  })
})
