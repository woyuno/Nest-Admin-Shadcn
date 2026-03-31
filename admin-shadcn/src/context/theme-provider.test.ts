import { describe, expect, it } from 'vitest'
import { DEFAULT_THEME } from './theme-provider'

describe('theme-provider', () => {
  it('uses light as the default theme', () => {
    expect(DEFAULT_THEME).toBe('light')
  })
})
