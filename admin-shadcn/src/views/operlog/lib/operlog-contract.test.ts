import { describe, expect, it } from 'vitest'
import {
  buildExportOperlogPayload,
  buildListOperlogParams,
  getOperlogBusinessTypeLabel,
  mapBackendOperlogItem,
} from './operlog-contract'

describe('operlog-contract', () => {
  it('builds operlog list params', () => {
    expect(
      buildListOperlogParams({
        page: 3,
        pageSize: 15,
        title: ' 用户管理 ',
        operName: ' admin ',
        businessType: ['2'],
        status: ['error'],
      })
    ).toEqual({
      pageNum: 3,
      pageSize: 15,
      title: '用户管理',
      operName: 'admin',
      businessType: '2',
      status: '1',
    })
  })

  it('builds operlog export params', () => {
    expect(
      buildExportOperlogPayload({
        title: ' 菜单管理 ',
        operName: ' ry ',
        businessType: ['3'],
        status: ['success'],
      })
    ).toEqual({
      title: '菜单管理',
      operName: 'ry',
      businessType: '3',
      status: '0',
    })
  })

  it('maps backend operlog item and label', () => {
    expect(getOperlogBusinessTypeLabel('5')).toBe('导出')
    expect(
      mapBackendOperlogItem({
        operId: 11,
        title: '用户管理',
        businessType: '2',
        operName: 'admin',
        operIp: '127.0.0.1',
        status: '1',
        costTime: 20,
        operTime: '2026-03-30 12:00:00',
      })
    ).toMatchObject({
      id: '11',
      operId: 11,
      title: '用户管理',
      businessType: '2',
      operName: 'admin',
      operIp: '127.0.0.1',
      status: 'error',
      costTime: 20,
    })
  })
})
