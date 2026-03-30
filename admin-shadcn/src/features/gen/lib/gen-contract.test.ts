import { describe, expect, it } from 'vitest'
import {
  buildListGenTablesParams,
  mapBackendGenTableItem,
} from './gen-contract'

describe('gen-contract', () => {
  it('builds gen table params', () => {
    expect(
      buildListGenTablesParams({
        page: 2,
        pageSize: 20,
        tableName: ' sys_user ',
        tableComment: ' 用户表 ',
      })
    ).toEqual({
      pageNum: 2,
      pageSize: 20,
      tableName: 'sys_user',
      tableComment: '用户表',
    })
  })

  it('maps backend gen table item', () => {
    expect(
      mapBackendGenTableItem({
        tableId: 1,
        tableName: 'sys_user',
        tableComment: '用户表',
        className: 'SysUser',
      })
    ).toMatchObject({
      id: '1',
      tableId: 1,
      tableName: 'sys_user',
      tableComment: '用户表',
      className: 'SysUser',
      genType: '0',
      genPath: '',
    })
  })
})
