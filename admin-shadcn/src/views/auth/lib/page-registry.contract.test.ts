import { describe, expect, it } from 'vitest'
import { defineFrontendPageRegistry } from './page-registry.contract'
import { frontendPageRegistry } from './page-registry'

describe('frontendPageRegistry contract', () => {
  it('should not contain duplicate route paths', () => {
    const routePaths = frontendPageRegistry.map((item) => item.routePath)

    expect(new Set(routePaths).size).toBe(routePaths.length)
  })

  it('should require at least one menuPaths or componentKeys entry', () => {
    expect(
      frontendPageRegistry.every(
        (item) =>
          (item.menuPaths?.length ?? 0) > 0 ||
          (item.componentKeys?.length ?? 0) > 0
      )
    ).toBe(true)
  })

  it('should require route paths to start with slash when registering new pages', () => {
    expect(() =>
      defineFrontendPageRegistry([
        {
          routePath: 'system/user',
          title: '用户管理',
          menuPaths: ['/system/user'],
        },
      ])
    ).toThrow(/routePath 必须以 \//)
  })

  it('should reject duplicate route paths during registry definition', () => {
    expect(() =>
      defineFrontendPageRegistry([
        {
          routePath: '/system/user',
          title: '用户管理',
          menuPaths: ['/system/user'],
        },
        {
          routePath: '/system/user',
          title: '用户管理副本',
          componentKeys: ['system/user/index'],
        },
      ])
    ).toThrow(/routePath 重复/)
  })
})
