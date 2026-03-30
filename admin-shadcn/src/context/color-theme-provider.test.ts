import { describe, expect, it } from 'vitest'
import {
  getDefaultColorTheme,
  isColorTheme,
  type ColorTheme,
} from './color-theme-provider'

describe('color-theme-provider', () => {
  it('uses default theme color preset', () => {
    expect(getDefaultColorTheme()).toBe('teal')
  })

  it('accepts supported color theme presets', () => {
    const values: ColorTheme[] = ['default', 'enterprise-blue', 'teal']

    expect(values.every(isColorTheme)).toBe(true)
  })

  it('rejects unsupported color theme presets', () => {
    expect(isColorTheme('purple')).toBe(false)
  })
})
