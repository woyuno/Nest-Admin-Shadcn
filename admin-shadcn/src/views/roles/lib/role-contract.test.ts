import { describe, expect, it } from 'vitest'
import {
  buildListRolesParams,
  mapBackendRoleStatusFromEnabled,
  mapBackendRoleListItem,
} from './role-contract'

describe('role-contract', () => {
  it('builds backend params from search state', () => {
    expect(
      buildListRolesParams({
        page: 2,
        pageSize: 20,
        roleName: '普通',
        roleKey: 'common',
        status: ['active'],
        beginTime: '2026-03-01',
        endTime: '2026-03-31',
      })
    ).toEqual({
      pageNum: 2,
      pageSize: 20,
      roleName: '普通',
      roleKey: 'common',
      status: '0',
      params: {
        beginTime: '2026-03-01',
        endTime: '2026-03-31',
      },
    })
  })

  it('maps backend role row into frontend table row', () => {
    expect(
      mapBackendRoleListItem({
        roleId: 2,
        roleName: '普通角色',
        roleKey: 'common',
        roleSort: 2,
        status: '0',
        createTime: '2025-02-28 16:52:10',
      })
    ).toMatchObject({
      id: '2',
      roleId: 2,
      roleName: '普通角色',
      roleKey: 'common',
      roleSort: 2,
      status: 'active',
    })
  })

  it('maps role switch state to backend status payload', () => {
    expect(mapBackendRoleStatusFromEnabled(true)).toBe('0')
    expect(mapBackendRoleStatusFromEnabled(false)).toBe('1')
  })
})
