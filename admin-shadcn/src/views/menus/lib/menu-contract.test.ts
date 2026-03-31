import { describe, expect, it } from 'vitest'
import {
  buildListMenusParams,
  buildMenuFormDefaults,
  buildMenuSavePayload,
  buildMenuTree,
  flattenMenuOptions,
  flattenVisibleMenuRows,
} from './menu-contract'

describe('menu-contract', () => {
  const backendRows = [
    {
      menuId: 1,
      parentId: 0,
      menuName: '系统管理',
      orderNum: 1,
      path: 'system',
      component: 'Layout',
      query: '',
      isFrame: '1' as const,
      isCache: '0' as const,
      visible: '0' as const,
      status: '0' as const,
      menuType: 'M' as const,
      perms: '',
      icon: 'system',
      createTime: '2025-02-28 16:52:10',
    },
    {
      menuId: 100,
      parentId: 1,
      menuName: '菜单管理',
      orderNum: 4,
      path: 'menu',
      component: 'system/menu/index',
      query: '',
      isFrame: '1' as const,
      isCache: '0' as const,
      visible: '0' as const,
      status: '0' as const,
      menuType: 'C' as const,
      perms: 'system:menu:list',
      icon: 'tree-table',
      createTime: '2025-02-28 16:52:10',
    },
    {
      menuId: 1001,
      parentId: 100,
      menuName: '菜单新增',
      orderNum: 1,
      path: '',
      component: '',
      query: '',
      isFrame: '1' as const,
      isCache: '1' as const,
      visible: '0' as const,
      status: '0' as const,
      menuType: 'F' as const,
      perms: 'system:menu:add',
      icon: '',
      createTime: '2025-02-28 16:52:10',
    },
  ]

  it('builds backend params from menu search state', () => {
    expect(
      buildListMenusParams({
        menuName: '菜单',
        status: ['active'],
      })
    ).toEqual({
      menuName: '菜单',
      status: '0',
    })
  })

  it('builds a tree from backend rows', () => {
    const tree = buildMenuTree(backendRows)
    expect(tree).toHaveLength(1)
    expect(tree[0].children).toHaveLength(1)
    expect(tree[0].children?.[0].children?.[0].menuName).toBe('菜单新增')
  })

  it('flattens visible menu rows based on expanded ids', () => {
    const tree = buildMenuTree(backendRows)
    expect(flattenVisibleMenuRows(tree, new Set([1, 100]))).toMatchObject([
      { menuId: 1, depth: 0 },
      { menuId: 100, depth: 1 },
      { menuId: 1001, depth: 2 },
    ])
    expect(flattenVisibleMenuRows(tree, new Set([1]))).toMatchObject([
      { menuId: 1, depth: 0 },
      { menuId: 100, depth: 1 },
    ])
  })

  it('flattens menu tree into hierarchical select options', () => {
    expect(flattenMenuOptions(buildMenuTree(backendRows))).toEqual([
      { label: '系统管理', value: '1' },
      { label: '系统管理 / 菜单管理', value: '100' },
      { label: '系统管理 / 菜单管理 / 菜单新增', value: '1001' },
    ])
  })

  it('builds default form values and save payload', () => {
    expect(
      buildMenuFormDefaults({
        menuId: 100,
        parentId: 1,
        menuName: '菜单管理',
        orderNum: 4,
        path: 'menu',
        component: 'system/menu/index',
        query: '{"id":1}',
        isFrame: '1',
        isCache: '0',
        visible: '0',
        status: '1',
        menuType: 'C',
        perms: 'system:menu:list',
        icon: 'tree-table',
      })
    ).toEqual({
      menuId: 100,
      parentId: '1',
      menuName: '菜单管理',
      orderNum: 4,
      path: 'menu',
      component: 'system/menu/index',
      query: '{"id":1}',
      isFrame: 'no',
      isCache: 'cache',
      visible: 'show',
      status: 'inactive',
      menuType: 'menu',
      perms: 'system:menu:list',
      icon: 'tree-table',
    })

    expect(
      buildMenuSavePayload({
        menuId: 100,
        parentId: '1',
        menuName: '菜单管理',
        orderNum: 4,
        path: 'menu',
        component: 'system/menu/index',
        query: '{"id":1}',
        isFrame: 'no',
        isCache: 'cache',
        visible: 'show',
        status: 'inactive',
        menuType: 'menu',
        perms: 'system:menu:list',
        icon: 'tree-table',
      })
    ).toEqual({
      menuId: 100,
      parentId: 1,
      menuName: '菜单管理',
      orderNum: 4,
      path: 'menu',
      component: 'system/menu/index',
      query: '{"id":1}',
      isFrame: '1',
      isCache: '0',
      visible: '0',
      status: '1',
      menuType: 'C',
      perms: 'system:menu:list',
      icon: 'tree-table',
    })
  })
})
