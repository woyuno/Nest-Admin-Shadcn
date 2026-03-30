import { describe, expect, it } from 'vitest'
import { getMainWidthClasses } from './main'

describe('Main content width', () => {
  it('uses a constrained width in narrow mode', () => {
    const className = getMainWidthClasses({ fluid: false, contentWidth: 'narrow' })

    expect(className).toContain('max-w-7xl')
    expect(className).toContain('mx-auto')
  })

  it('uses full width in wide mode', () => {
    const className = getMainWidthClasses({ fluid: false, contentWidth: 'wide' })

    expect(className).toContain('w-full')
    expect(className).not.toContain('max-w-7xl')
  })
})
