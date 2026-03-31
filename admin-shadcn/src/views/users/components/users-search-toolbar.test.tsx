import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { UsersSearchToolbar } from './users-search-toolbar'
import {
  buildUsersToolbarSearch,
  resetUsersToolbarDraft,
  resetUsersToolbarSearch,
} from './users-search-toolbar.helpers'

describe('users-search-toolbar', () => {
  it('renders a compact filter bar with date range and action buttons', () => {
    const html = renderToStaticMarkup(
      <UsersSearchToolbar
        search={{
          username: 'zhangsan',
          phonenumber: '13800138000',
          status: ['active'],
          beginTime: '2026-03-01',
          endTime: '2026-03-31',
        }}
        navigate={vi.fn() as never}
      />
    )

    expect(html).toContain('用户账号')
    expect(html).toContain('手机号')
    expect(html).toContain('创建时间')
    expect(html).toContain('2026-03-01 - 2026-03-31')
    expect(html).toContain('搜索')
    expect(html).toContain('重置')
    expect(html).not.toContain('重置部门和日期')
    expect(html).not.toContain('aria-label="开始日期"')
    expect(html).not.toContain('aria-label="结束日期"')
  })

  it('applies top filters without clearing the selected dept', () => {
    expect(
      buildUsersToolbarSearch(
        {
          page: 3,
          pageSize: 20,
          deptId: '100',
        },
        {
          username: 'zhangsan',
          phonenumber: '13800138000',
          status: 'active',
          beginTime: '2026-03-01',
          endTime: '2026-03-31',
        }
      )
    ).toEqual({
      page: 1,
      pageSize: 20,
      deptId: '100',
      username: 'zhangsan',
      phonenumber: '13800138000',
      status: ['active'],
      beginTime: '2026-03-01',
      endTime: '2026-03-31',
    })
  })

  it('resets only the toolbar filters and keeps dept selection intact', () => {
    expect(
      resetUsersToolbarSearch({
        page: 3,
        pageSize: 20,
        deptId: '100',
        username: 'zhangsan',
        phonenumber: '13800138000',
        status: ['active'],
        beginTime: '2026-03-01',
        endTime: '2026-03-31',
      })
    ).toEqual({
      page: 1,
      pageSize: 20,
      deptId: '100',
      username: undefined,
      phonenumber: undefined,
      status: undefined,
      beginTime: undefined,
      endTime: undefined,
    })
  })

  it('drops incomplete date ranges instead of sending a single boundary', () => {
    expect(
      buildUsersToolbarSearch(
        {
          page: 2,
          pageSize: 20,
          deptId: '100',
        },
        {
          username: 'zhangsan',
          phonenumber: '',
          status: 'all',
          beginTime: '2026-03-01',
          endTime: '',
        }
      )
    ).toEqual({
      page: 1,
      pageSize: 20,
      deptId: '100',
      username: 'zhangsan',
      phonenumber: undefined,
      status: undefined,
      beginTime: undefined,
      endTime: undefined,
    })
  })

  it('clears the local toolbar draft when the reset button logic runs', () => {
    expect(
      resetUsersToolbarDraft({
        username: 'zhangsan',
        phonenumber: '13800138000',
        status: 'active',
        beginTime: '2026-03-01',
        endTime: '2026-03-31',
      })
    ).toEqual({
      username: '',
      phonenumber: '',
      status: 'all',
      beginTime: '',
      endTime: '',
    })
  })
})
