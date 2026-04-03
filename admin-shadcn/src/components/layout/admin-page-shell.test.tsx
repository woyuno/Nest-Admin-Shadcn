import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { AdminPageShell } from './admin-page-shell'

vi.mock('@/components/layout/header', () => ({
  Header: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
}))

vi.mock('@/components/layout/main', () => ({
  Main: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => <main data-class={className}>{children}</main>,
}))

vi.mock('@/components/search', () => ({
  Search: () => <div>搜索框</div>,
}))

vi.mock('@/components/theme-switch', () => ({
  ThemeSwitch: () => <button>主题切换</button>,
}))

vi.mock('@/components/config-drawer', () => ({
  ConfigDrawer: () => <button>配置抽屉</button>,
}))

vi.mock('@/components/profile-dropdown', () => ({
  ProfileDropdown: () => <button>个人菜单</button>,
}))

describe('AdminPageShell', () => {
  it('renders shared admin layout with actions, sidebar and content', () => {
    const html = renderToStaticMarkup(
      <AdminPageShell
        title='任务中心'
        description='统一承载标题区、主操作区和正文布局。'
        actions={<div>页面操作</div>}
        sidebar={<aside>筛选侧栏</aside>}
      >
        <section>列表表格</section>
      </AdminPageShell>
    )

    expect(html).toContain('任务中心')
    expect(html).toContain('统一承载标题区、主操作区和正文布局。')
    expect(html).toContain('页面操作')
    expect(html).toContain('筛选侧栏')
    expect(html).toContain('列表表格')
    expect(html).toContain('搜索框')
    expect(html).toContain('主题切换')
    expect(html).toContain('配置抽屉')
    expect(html).toContain('个人菜单')
  })
})
