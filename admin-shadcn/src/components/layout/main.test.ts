import { describe, expect, it } from 'vitest'
import { getMainClassName } from './main'

describe('Main layout', () => {
  it('uses constrained content by default', () => {
    const className = getMainClassName({})

    expect(className).toContain('max-w-7xl')
    expect(className).toContain('w-full')
    expect(className).toContain('mx-auto')
  })

  it('keeps fixed layout behavior when requested', () => {
    const className = getMainClassName({ fixed: true })

    expect(className).toContain('flex')
    expect(className).toContain('grow')
    expect(className).toContain('overflow-hidden')
  })
})
