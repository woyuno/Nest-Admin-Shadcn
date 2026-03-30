import { describe, expect, it } from 'vitest'
import {
  buildDictDataFormDefaults,
  buildDictDataSavePayload,
  buildDictDataSearchParams,
  buildDictTypeFormDefaults,
  buildDictTypeSavePayload,
  buildDictTypeSearchParams,
  mapBackendDictDataItem,
  mapBackendDictTypeItem,
} from './dict-contract'

describe('dict-contract', () => {
  it('builds dict type search params', () => {
    expect(
      buildDictTypeSearchParams({
        page: 2,
        pageSize: 20,
        dictName: '用户状态',
        dictType: 'sys_user_status',
        status: ['active'],
      })
    ).toEqual({
      pageNum: 2,
      pageSize: 20,
      dictName: '用户状态',
      dictType: 'sys_user_status',
      status: '0',
    })
  })

  it('maps backend dict type item and defaults', () => {
    expect(
      mapBackendDictTypeItem({
        dictId: 1,
        dictName: '用户状态',
        dictType: 'sys_user_status',
        status: '1',
        remark: '系统状态',
        createTime: '2025-02-28 16:52:10',
      })
    ).toMatchObject({
      dictId: 1,
      dictName: '用户状态',
      dictType: 'sys_user_status',
      status: 'inactive',
      remark: '系统状态',
    })

    expect(
      buildDictTypeFormDefaults({
        dictId: 1,
        dictName: '用户状态',
        dictType: 'sys_user_status',
        status: '0',
        remark: '系统状态',
      })
    ).toEqual({
      dictId: 1,
      dictName: '用户状态',
      dictType: 'sys_user_status',
      status: 'active',
      remark: '系统状态',
    })
  })

  it('builds dict type save payload', () => {
    expect(
      buildDictTypeSavePayload({
        dictId: 1,
        dictName: ' 用户状态 ',
        dictType: ' sys_user_status ',
        status: 'inactive',
        remark: ' 系统状态 ',
      })
    ).toEqual({
      dictId: 1,
      dictName: '用户状态',
      dictType: 'sys_user_status',
      status: '1',
      remark: '系统状态',
    })
  })

  it('builds dict data search params', () => {
    expect(
      buildDictDataSearchParams({
        page: 1,
        pageSize: 10,
        dictType: 'sys_user_status',
        dictLabel: '启用',
        status: ['active'],
      })
    ).toEqual({
      pageNum: 1,
      pageSize: 10,
      dictType: 'sys_user_status',
      dictLabel: '启用',
      status: '0',
    })
  })

  it('maps backend dict data item, defaults and save payload', () => {
    expect(
      mapBackendDictDataItem({
        dictCode: 1,
        dictSort: 10,
        dictLabel: '启用',
        dictValue: '0',
        dictType: 'sys_user_status',
        cssClass: '',
        listClass: 'primary',
        status: '0',
        remark: '正常状态',
        createTime: '2025-02-28 16:52:10',
      })
    ).toMatchObject({
      dictCode: 1,
      dictLabel: '启用',
      listClass: 'primary',
      status: 'active',
    })

    expect(
      buildDictDataFormDefaults({
        dictCode: 1,
        dictSort: 10,
        dictLabel: '启用',
        dictValue: '0',
        dictType: 'sys_user_status',
        cssClass: '',
        listClass: '',
        status: '1',
        remark: '正常状态',
      })
    ).toEqual({
      dictCode: 1,
      dictSort: 10,
      dictLabel: '启用',
      dictValue: '0',
      dictType: 'sys_user_status',
      cssClass: '',
        listClass: 'default',
        status: 'inactive',
        remark: '正常状态',
      })

    expect(
      buildDictDataSavePayload({
        dictCode: 1,
        dictSort: 10,
        dictLabel: ' 启用 ',
        dictValue: ' 0 ',
        dictType: ' sys_user_status ',
        cssClass: ' text-green ',
        listClass: 'primary',
        status: 'inactive',
        remark: ' 正常状态 ',
      })
    ).toEqual({
      dictCode: 1,
      dictSort: 10,
      dictLabel: '启用',
      dictValue: '0',
      dictType: 'sys_user_status',
      cssClass: 'text-green',
      listClass: 'primary',
      status: '1',
      remark: '正常状态',
    })
  })
})
