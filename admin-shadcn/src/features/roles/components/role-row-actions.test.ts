import { describe, expect, it } from 'vitest'
import { getRoleRowActions } from './role-row-actions'

describe('role-row-actions', () => {
  it('does not show row actions for super admin', () => {
    expect(getRoleRowActions(1)).toEqual([])
  })

  it('shows the full action set for normal roles', () => {
    expect(getRoleRowActions(2)).toEqual(['edit', 'data-scope', 'delete'])
  })
})
