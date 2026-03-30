import { describe, expect, it } from 'vitest'
import {
  buildExportLogininforPayload,
  buildListLogininforParams,
  mapBackendLogininforItem,
} from './logininfor-contract'

describe('logininfor-contract', () => {
  it('builds logininfor list params', () => {
    expect(
      buildListLogininforParams({
        page: 2,
        pageSize: 20,
        ipaddr: ' 127.0.0.1 ',
        userName: ' admin ',
        status: ['success'],
      })
    ).toEqual({
      pageNum: 2,
      pageSize: 20,
      ipaddr: '127.0.0.1',
      userName: 'admin',
      status: '0',
    })
  })

  it('builds logininfor export params', () => {
    expect(
      buildExportLogininforPayload({
        ipaddr: ' 192.168.0.1 ',
        userName: ' ry ',
        status: ['error'],
      })
    ).toEqual({
      ipaddr: '192.168.0.1',
      userName: 'ry',
      status: '1',
    })
  })

  it('maps backend logininfor item', () => {
    expect(
      mapBackendLogininforItem({
        infoId: 8,
        userName: 'admin',
        ipaddr: '127.0.0.1',
        loginLocation: '内网',
        browser: 'Chrome',
        os: 'Windows',
        status: '1',
        msg: '密码错误',
        loginTime: '2026-03-30 12:00:00',
      })
    ).toMatchObject({
      id: '8',
      infoId: 8,
      userName: 'admin',
      ipaddr: '127.0.0.1',
      loginLocation: '内网',
      browser: 'Chrome',
      os: 'Windows',
      status: 'error',
      msg: '密码错误',
    })
  })
})
