import { describe, expect, it } from 'vitest'
import {
  buildExportUsersPayload,
  buildListUsersParams,
  mapBackendStatusFromEnabled,
  mapBackendUserListItem,
  stripWrappedQuotes,
} from './user-contract'

describe('user-contract', () => {
  it('builds backend list params from users search state', () => {
    expect(
      buildListUsersParams({
        page: 3,
        pageSize: 20,
        deptId: '100',
        username: 'alice',
        phonenumber: '13800138000',
        status: ['active'],
        beginTime: '2026-03-01',
        endTime: '2026-03-31',
      })
    ).toEqual({
      pageNum: 3,
      pageSize: 20,
      deptId: '100',
      userName: 'alice',
      phonenumber: '13800138000',
      status: '0',
      params: {
        beginTime: '2026-03-01',
        endTime: '2026-03-31',
      },
    })
  })

  it('maps backend users into table rows', () => {
    expect(
      mapBackendUserListItem({
        userId: 12,
        userName: 'admin',
        nickName: '管理员',
        email: 'admin@example.com',
        phonenumber: '13800138000',
        status: '0',
        dept: { deptName: '研发部' },
        createTime: '2026-03-30 10:00:00',
      })
    ).toMatchObject({
      id: '12',
      userId: 12,
      userName: 'admin',
      nickName: '管理员',
      email: 'admin@example.com',
      phonenumber: '13800138000',
      deptName: '研发部',
      status: 'active',
    })
  })

  it('strips wrapped quotes from string search values', () => {
    expect(stripWrappedQuotes('"1566"')).toBe('1566')
    expect(stripWrappedQuotes('ry')).toBe('ry')
    expect(stripWrappedQuotes(undefined)).toBe('')
  })

  it('maps switch enabled state to backend status payload', () => {
    expect(mapBackendStatusFromEnabled(true)).toBe('0')
    expect(mapBackendStatusFromEnabled(false)).toBe('1')
  })

  it('builds export payload without pagination fields', () => {
    expect(
      buildExportUsersPayload({
        page: 5,
        pageSize: 20,
        username: 'ry',
        status: ['active'],
      })
    ).toEqual({
      userName: 'ry',
      phonenumber: undefined,
      status: '0',
    })
  })
})
