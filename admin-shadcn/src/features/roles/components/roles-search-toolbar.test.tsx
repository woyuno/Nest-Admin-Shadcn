import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { RolesSearchToolbar } from './roles-search-toolbar'
import {
  buildRolesToolbarSearch,
  resetRolesToolbarDraft,
  resetRolesToolbarSearch,
} from './roles-search-toolbar.helpers'

describe('roles-search-toolbar', () => {
  it('renders a compact filter bar with date range and action buttons', () => {
    const html = renderToStaticMarkup(
      <RolesSearchToolbar
        search={{
          roleName: '管理员',
          roleKey: 'admin',
          status: ['active'],
          beginTime: '2026-03-01',
          endTime: '2026-03-31',
        }}
        navigate={vi.fn() as never}
      />
    )

    expect(html).toContain('角色名称')
    expect(html).toContain('权限字符')
    expect(html).toContain('创建时间')
    expect(html).toContain('2026-03-01 - 2026-03-31')
    expect(html).toContain('搜索')
    expect(html).toContain('重置')
    expect(html).not.toContain('重置日期')
    expect(html).not.toContain('aria-label="开始日期"')
    expect(html).not.toContain('aria-label="结束日期"')
  })

  it('builds search params from the toolbar draft values', () => {
    expect(
      buildRolesToolbarSearch(
        {
          page: 3,
          pageSize: 20,
        },
        {
          roleName: '管理员',
          roleKey: 'admin',
          status: 'active',
          beginTime: '2026-03-01',
          endTime: '2026-03-31',
        }
      )
    ).toEqual({
      page: 1,
      pageSize: 20,
      roleName: '管理员',
      roleKey: 'admin',
      status: ['active'],
      beginTime: '2026-03-01',
      endTime: '2026-03-31',
    })
  })

  it('resets all role toolbar filters back to an empty state', () => {
    expect(
      resetRolesToolbarSearch({
        page: 3,
        pageSize: 20,
        roleName: '管理员',
        roleKey: 'admin',
        status: ['active'],
        beginTime: '2026-03-01',
        endTime: '2026-03-31',
      })
    ).toEqual({
      page: 1,
      pageSize: 20,
      roleName: undefined,
      roleKey: undefined,
      status: undefined,
      beginTime: undefined,
      endTime: undefined,
    })
  })

  it('drops incomplete date ranges instead of sending a single boundary', () => {
    expect(
      buildRolesToolbarSearch(
        {
          page: 2,
          pageSize: 20,
        },
        {
          roleName: '管理员',
          roleKey: '',
          status: 'all',
          beginTime: '',
          endTime: '2026-03-31',
        }
      )
    ).toEqual({
      page: 1,
      pageSize: 20,
      roleName: '管理员',
      roleKey: undefined,
      status: undefined,
      beginTime: undefined,
      endTime: undefined,
    })
  })

  it('clears the local toolbar draft when the reset button logic runs', () => {
    expect(
      resetRolesToolbarDraft({
        roleName: '管理员',
        roleKey: 'admin',
        status: 'active',
        beginTime: '2026-03-01',
        endTime: '2026-03-31',
      })
    ).toEqual({
      roleName: '',
      roleKey: '',
      status: 'all',
      beginTime: '',
      endTime: '',
    })
  })
})
