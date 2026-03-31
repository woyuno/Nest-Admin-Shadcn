import { describe, expect, it } from 'vitest'
import { resolveDateRangeSelection } from './date-range-picker'

describe('date-range-picker', () => {
  it('keeps the popover open after the first click when the calendar returns a same-day range', () => {
    const day = new Date('2026-03-15T00:00:00.000Z')

    expect(
      resolveDateRangeSelection(undefined, {
        from: day,
        to: day,
      })
    ).toEqual({
      draftRange: {
        from: day,
        to: undefined,
      },
      committedRange: undefined,
      shouldClose: false,
    })
  })

  it('commits the range after the second click', () => {
    const from = new Date('2026-03-15T00:00:00.000Z')
    const to = new Date('2026-03-20T00:00:00.000Z')

    expect(
      resolveDateRangeSelection(
        {
          from,
          to: undefined,
        },
        {
          from,
          to,
        }
      )
    ).toEqual({
      draftRange: {
        from,
        to,
      },
      committedRange: {
        from,
        to,
      },
      shouldClose: true,
    })
  })
})
