import { describe, expect, it } from 'vitest'
import {
  getDefaultContentWidth,
  getLayoutMode,
  type ContentWidth,
  type LayoutMode,
} from './layout-provider'

describe('layout-provider helpers', () => {
  it('defaults content width to wide', () => {
    expect(getDefaultContentWidth()).toBe('wide')
  })

  it('maps layout mode from sidebar and content width state', () => {
    expect(getLayoutMode({ open: true, collapsible: 'icon', contentWidth: 'narrow' })).toBe(
      'default'
    )
    expect(getLayoutMode({ open: false, collapsible: 'icon', contentWidth: 'narrow' })).toBe(
      'icon'
    )
    expect(getLayoutMode({ open: true, collapsible: 'icon', contentWidth: 'wide' })).toBe(
      'offcanvas'
    )
  })

  it('keeps only supported layout and content width values', () => {
    const modes: LayoutMode[] = ['default', 'icon', 'offcanvas']
    const widths: ContentWidth[] = ['narrow', 'wide']

    expect(modes).toHaveLength(3)
    expect(widths).toHaveLength(2)
  })
})
