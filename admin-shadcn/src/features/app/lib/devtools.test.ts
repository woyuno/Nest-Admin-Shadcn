import { describe, expect, it } from 'vitest'
import { shouldShowDevtools } from './devtools'

describe('devtools visibility', () => {
  it('hides devtools by default in development', () => {
    expect(shouldShowDevtools({ isDev: true })).toBe(false)
  })

  it('shows devtools only when the opt-in flag is true in development', () => {
    expect(shouldShowDevtools({ isDev: true, enabledFlag: 'true' })).toBe(true)
  })

  it('always hides devtools outside development', () => {
    expect(shouldShowDevtools({ isDev: false, enabledFlag: 'true' })).toBe(false)
  })
})
