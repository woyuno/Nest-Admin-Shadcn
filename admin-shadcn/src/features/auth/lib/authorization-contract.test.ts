import { describe, expect, it } from 'vitest'
import {
  buildSidebarGroupsFromMenus,
  canAccessRoute,
  hasPermission,
  type BackendMenuRoute,
  type FrontendPageRegistryItem,
} from './authorization-contract'

const registry: FrontendPageRegistryItem[] = [
  {
    routePath: '/',
    title: '首页',
    menuPaths: ['/index'],
    componentKeys: ['index', 'dashboard/index'],
  },
  {
    routePath: '/system/user',
    title: '用户管理',
    menuPaths: ['/system/user'],
    componentKeys: ['system/user/index'],
    requiredPermissions: ['system:user:list'],
  },
]

describe('authorization-contract', () => {
  it('maps backend menus to sidebar groups and warns on unmapped pages', () => {
    const menus: BackendMenuRoute[] = [
      {
        path: '/index',
        component: 'Layout',
        meta: { title: '首页' },
        children: [
          {
            path: 'index',
            component: 'dashboard/index',
            meta: { title: '工作台' },
          },
        ],
      },
      {
        path: '/system',
        component: 'Layout',
        meta: { title: '系统管理' },
        children: [
          {
            path: 'user',
            component: 'system/user/index',
            meta: { title: '用户管理' },
          },
          {
            path: 'role',
            component: 'system/role/index',
            meta: { title: '角色管理' },
          },
        ],
      },
    ]

    const result = buildSidebarGroupsFromMenus(menus, registry)

    expect(result.allowedRoutePaths).toEqual(['/', '/system/user'])
    expect(result.navGroups).toEqual([
      {
        title: '首页',
        items: [{ title: '工作台', url: '/' }],
      },
      {
        title: '系统管理',
        items: [{ title: '用户管理', url: '/system/user' }],
      },
    ])
    expect(result.warnings).toEqual([
      '未找到后端菜单映射: 角色管理 (/system/role) -> system/role/index',
    ])
  })

  it('maps external backend menu links without warnings', () => {
    const menus: BackendMenuRoute[] = [
      {
        path: 'https://nest-admin.dooring.vip',
        component: 'Layout',
        meta: { title: 'nest-admin官网' },
      },
    ]

    const result = buildSidebarGroupsFromMenus(menus, registry)

    expect(result.navGroups).toEqual([
      {
        title: '快捷入口',
        items: [
          {
            title: 'nest-admin官网',
            url: 'https://nest-admin.dooring.vip',
          },
        ],
      },
    ])
    expect(result.allowedRoutePaths).toEqual([])
    expect(result.warnings).toEqual([])
  })

  it('treats wildcard permission as global access', () => {
    expect(hasPermission(['*:*:*'], ['system:user:list'])).toBe(true)
    expect(hasPermission(['system:user:list'], ['system:user:list'])).toBe(true)
    expect(hasPermission(['system:user:list'], ['system:user:edit'])).toBe(false)
  })

  it('checks route access against declared permission requirements', () => {
    expect(
      canAccessRoute({
        pathname: '/system/user',
        permissions: ['system:user:list'],
        registry,
      })
    ).toBe(true)

    expect(
      canAccessRoute({
        pathname: '/system/user',
        permissions: ['system:role:list'],
        registry,
      })
    ).toBe(false)

    expect(
      canAccessRoute({
        pathname: '/settings',
        permissions: [],
        registry,
      })
    ).toBe(true)
  })
})
