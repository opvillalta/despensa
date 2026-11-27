import { describe, expect, it } from 'vitest'
import { shouldSuggestItem } from '../../src/lib/shopping'
import type { SuggestableItem } from '../../src/lib/shopping'

describe('shouldSuggestItem', () => {
  // tracking_type: level
  it('sugiere si level es low', () => {
    const item: SuggestableItem = { tracking_type: 'level', level: 'low' }
    expect(shouldSuggestItem(item)).toBe(true)
  })

  it('sugiere si level es empty', () => {
    const item: SuggestableItem = { tracking_type: 'level', level: 'empty' }
    expect(shouldSuggestItem(item)).toBe(true)
  })

  it('no sugiere si level es half', () => {
    const item: SuggestableItem = { tracking_type: 'level', level: 'half' }
    expect(shouldSuggestItem(item)).toBe(false)
  })

  it('no sugiere si level es full', () => {
    const item: SuggestableItem = { tracking_type: 'level', level: 'full' }
    expect(shouldSuggestItem(item)).toBe(false)
  })

  // tracking_type: units
  it('sugiere si quantity es 0 o 1', () => {
    expect(shouldSuggestItem({ tracking_type: 'units', quantity: 0 })).toBe(true)
    expect(shouldSuggestItem({ tracking_type: 'units', quantity: 1 })).toBe(true)
  })

  it('no sugiere si quantity es mayor a 1', () => {
    const item: SuggestableItem = { tracking_type: 'units', quantity: 2 }
    expect(shouldSuggestItem(item)).toBe(false)
  })

  it('no sugiere si quantity es null', () => {
    const item: SuggestableItem = { tracking_type: 'units', quantity: null }
    expect(shouldSuggestItem(item)).toBe(false)
  })

  // tracking_type: presence
  it('sugiere si presence es false (no tengo)', () => {
    const item: SuggestableItem = { tracking_type: 'presence', has_it: false }
    expect(shouldSuggestItem(item)).toBe(true)
  })

  it('no sugiere si presence es true (tengo)', () => {
    const item: SuggestableItem = { tracking_type: 'presence', has_it: true }
    expect(shouldSuggestItem(item)).toBe(false)
  })

  // Edge cases
  it('no sugiere si tracking_type es desconocido', () => {
    const item = { tracking_type: 'unknown' } as unknown as SuggestableItem
    expect(shouldSuggestItem(item)).toBe(false)
  })
})
