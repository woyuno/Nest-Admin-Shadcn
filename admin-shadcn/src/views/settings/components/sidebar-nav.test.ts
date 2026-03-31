import { describe, expect, it } from 'vitest'
import { resolveSidebarNavValue } from './sidebar-nav'

describe('settings sidebar-nav', () => {
  const items = [
    { href: '/settings', title: '个人资料', icon: null as never },
    { href: '/settings/account', title: '账户信息', icon: null as never },
    { href: '/settings/appearance', title: '外观设置', icon: null as never },
  ]

  it('maps the profile alias route to the personal profile navigation item', () => {
    expect(resolveSidebarNavValue('/user/profile', items)).toBe('/settings')
  })

  it('keeps direct settings routes unchanged', () => {
    expect(resolveSidebarNavValue('/settings/account', items)).toBe(
      '/settings/account'
    )
  })
})
