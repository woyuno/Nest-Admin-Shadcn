import { describe, expect, it } from 'vitest'
import {
  buildCacheValueDefaults,
  mapBackendCacheKeys,
  mapBackendCacheNames,
  mapBackendCacheOverview,
} from './cache-contract'

describe('cache-contract', () => {
  it('maps cache overview', () => {
    expect(
      mapBackendCacheOverview({
        info: { redis_version: '7.2.0', redis_mode: 'standalone', aof_enabled: '0' },
        dbSize: 15,
        commandStats: [{ name: 'get', value: 30 }],
      })
    ).toEqual({
      info: {
        redisVersion: '7.2.0',
        redisMode: '单机',
        tcpPort: '',
        connectedClients: '',
        uptimeInDays: '',
        usedMemoryHuman: '',
        usedCpu: '',
        maxmemoryHuman: '',
        aofEnabled: '否',
        rdbStatus: '',
        inputKbps: '',
        outputKbps: '',
      },
      dbSize: 15,
      commandStats: [{ id: 'get-0', name: 'get', value: 30 }],
    })
  })

  it('maps cache names and keys', () => {
    expect(mapBackendCacheNames([{ cacheName: 'login_tokens:', remark: '登录态' }])).toEqual([
      {
        id: 'login_tokens:-0',
        cacheName: 'login_tokens:',
        displayName: 'login_tokens',
        remark: '登录态',
      },
    ])

    expect(mapBackendCacheKeys('login_tokens:', ['login_tokens:admin'])).toEqual([
      { id: 'login_tokens:admin-0', cacheKey: 'login_tokens:admin', displayKey: 'admin' },
    ])
  })

  it('builds cache value defaults', () => {
    expect(buildCacheValueDefaults({ cacheName: 'foo', cacheKey: 'foo:1' })).toEqual({
      cacheName: 'foo',
      cacheKey: 'foo:1',
      cacheValue: '',
    })
  })
})
