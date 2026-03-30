import { describe, expect, it } from 'vitest'
import {
  buildListOnlineUsersParams,
  filterOnlineUsers,
  mapBackendOnlineUserItem,
} from './online-contract'

describe('online-contract', () => {
  const source = [
    {
      tokenId: 'token-admin',
      userName: 'admin',
      deptName: '研发部门',
      ipaddr: '127.0.0.1',
      loginLocation: '内网',
      browser: 'Chrome',
      os: 'Windows 11',
      loginTime: '2025-02-28 16:52:10',
    },
    {
      tokenId: 'token-ry',
      userName: 'ry',
      deptName: '测试部门',
      ipaddr: '192.168.0.8',
      loginLocation: '深圳',
      browser: 'Edge',
      os: 'Windows 10',
      loginTime: '2025-02-28 16:54:10',
    },
  ].map(mapBackendOnlineUserItem)

  it('builds list params for online users', () => {
    expect(
      buildListOnlineUsersParams({
        page: 2,
        pageSize: 10,
        ipaddr: '127.0.0.1',
        userName: 'admin',
      })
    ).toEqual({
      pageNum: 1,
      pageSize: 9999,
      ipaddr: '127.0.0.1',
      userName: 'admin',
    })
  })

  it('maps backend online user item', () => {
    expect(source[0]).toMatchObject({
      tokenId: 'token-admin',
      userName: 'admin',
      ipaddr: '127.0.0.1',
      browser: 'Chrome',
    })
  })

  it('filters online users client-side when backend ignores search params', () => {
    expect(filterOnlineUsers(source, { userName: 'ry' })).toHaveLength(1)
    expect(filterOnlineUsers(source, { ipaddr: '127.0.0.1' })[0].userName).toBe('admin')
  })
})
