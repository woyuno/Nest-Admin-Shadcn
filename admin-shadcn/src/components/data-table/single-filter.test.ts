import { describe, expect, it } from 'vitest'
import { getNextSingleFilterValue } from './single-filter.helpers'

describe('getNextSingleFilterValue', () => {
  it('keeps only the newly selected value', () => {
    expect(getNextSingleFilterValue(['active'], 'inactive')).toEqual([
      'inactive',
    ])
  })

  it('clears the filter when the same value is selected again', () => {
    expect(getNextSingleFilterValue(['active'], 'active')).toBeUndefined()
  })

  it('accepts empty state and creates a single-item selection', () => {
    expect(getNextSingleFilterValue(undefined, 'active')).toEqual(['active'])
  })
})
