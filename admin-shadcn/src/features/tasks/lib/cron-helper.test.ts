import { describe, expect, it } from 'vitest'
import { buildCronExpressionFromPreset } from './cron-helper'

describe('cron-helper', () => {
  it('builds every n minutes expressions', () => {
    expect(
      buildCronExpressionFromPreset({
        type: 'every-n-minutes',
        interval: 10,
      })
    ).toBe('0 */10 * * * ?')
  })

  it('builds daily expressions', () => {
    expect(
      buildCronExpressionFromPreset({
        type: 'daily',
        hour: 8,
        minute: 30,
      })
    ).toBe('0 30 8 * * ?')
  })

  it('builds weekly expressions', () => {
    expect(
      buildCronExpressionFromPreset({
        type: 'weekly',
        hour: 9,
        minute: 15,
        weekDay: 'MON',
      })
    ).toBe('0 15 9 ? * MON')
  })
})
