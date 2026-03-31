import { describe, expect, it } from 'vitest'
import { CircleHelp, Settings } from 'lucide-react'
import {
  getMenuIconLabel,
  menuIconOptions,
  resolveMenuIcon,
} from './menu-icon-registry'

describe('menu-icon-registry', () => {
  it('resolves registered icon keys to icon components', () => {
    expect(resolveMenuIcon('system')).toBe(Settings)
    expect(resolveMenuIcon(' SYSTEM ')).toBe(Settings)
  })

  it('falls back to help icon for unknown keys', () => {
    expect(resolveMenuIcon('unknown-icon')).toBe(CircleHelp)
  })

  it('returns empty state for blank keys', () => {
    expect(resolveMenuIcon('')).toBeNull()
    expect(getMenuIconLabel('')).toBe('')
  })

  it('returns labels for known icons and original text for unknown keys', () => {
    expect(getMenuIconLabel('monitor')).toBe('监控')
    expect(getMenuIconLabel('legacy-icon')).toBe('legacy-icon')
  })

  it('exposes a sizable icon catalog for the menu picker', () => {
    expect(menuIconOptions.length).toBeGreaterThan(40)
    expect(menuIconOptions).toContainEqual(
      expect.objectContaining({ key: 'dashboard', label: '仪表盘' })
    )
  })
})
