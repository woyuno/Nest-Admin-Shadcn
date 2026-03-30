import { describe, expect, it } from 'vitest'
import {
  buildDeptFormDefaults,
  buildDeptSavePayload,
  buildDeptTree,
  buildListDeptsParams,
  flattenDeptOptions,
  flattenVisibleDeptRows,
} from './dept-contract'

describe('dept-contract', () => {
  const backendRows = [
    {
      deptId: 100,
      parentId: 0,
      deptName: 'nest-admin科技',
      orderNum: 0,
      leader: 'admin',
      phone: '15888888888',
      email: 'admin@example.com',
      status: '0' as const,
      createTime: '2025-02-28 16:52:10',
    },
    {
      deptId: 101,
      parentId: 100,
      deptName: '深圳总公司',
      orderNum: 1,
      leader: 'ry',
      phone: '15666666666',
      email: 'ry@example.com',
      status: '0' as const,
      createTime: '2025-02-28 16:52:10',
    },
    {
      deptId: 102,
      parentId: 101,
      deptName: '测试部门',
      orderNum: 2,
      leader: 'ry',
      phone: '15666666666',
      email: 'ry@example.com',
      status: '0' as const,
      createTime: '2025-02-28 16:52:10',
    },
  ]

  it('builds backend params from depts search state', () => {
    expect(
      buildListDeptsParams({
        deptName: '深圳',
        status: ['active'],
      })
    ).toEqual({
      deptName: '深圳',
      status: '0',
    })
  })

  it('builds a tree from backend rows', () => {
    const tree = buildDeptTree(backendRows)
    expect(tree).toHaveLength(1)
    expect(tree[0].children).toHaveLength(1)
    expect(tree[0].children?.[0].children?.[0].deptName).toBe('测试部门')
  })

  it('flattens visible dept rows based on expanded ids', () => {
    const tree = buildDeptTree(backendRows)
    expect(flattenVisibleDeptRows(tree, new Set([100, 101]))).toMatchObject([
      { deptId: 100, depth: 0 },
      { deptId: 101, depth: 1 },
      { deptId: 102, depth: 2 },
    ])
    expect(flattenVisibleDeptRows(tree, new Set([100]))).toMatchObject([
      { deptId: 100, depth: 0 },
      { deptId: 101, depth: 1 },
    ])
  })

  it('flattens dept tree into hierarchical select options', () => {
    expect(flattenDeptOptions(buildDeptTree(backendRows))).toEqual([
      { label: 'nest-admin科技', value: '100' },
      { label: 'nest-admin科技 / 深圳总公司', value: '101' },
      { label: 'nest-admin科技 / 深圳总公司 / 测试部门', value: '102' },
    ])
  })

  it('builds default form values and save payload', () => {
    expect(
      buildDeptFormDefaults({
        deptId: 102,
        parentId: 101,
        deptName: '测试部门',
        orderNum: 2,
        leader: 'ry',
        phone: '15666666666',
        email: 'ry@example.com',
        status: '1',
      })
    ).toEqual({
      deptId: 102,
      parentId: '101',
      deptName: '测试部门',
      orderNum: 2,
      leader: 'ry',
      phone: '15666666666',
      email: 'ry@example.com',
      status: 'inactive',
    })

    expect(
      buildDeptSavePayload({
        deptId: 102,
        parentId: '101',
        deptName: '测试部门',
        orderNum: 2,
        leader: 'ry',
        phone: '15666666666',
        email: 'ry@example.com',
        status: 'inactive',
      })
    ).toEqual({
      deptId: 102,
      parentId: 101,
      deptName: '测试部门',
      orderNum: 2,
      leader: 'ry',
      phone: '15666666666',
      email: 'ry@example.com',
      status: '1',
    })
  })
})
