import { useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Input } from '@/components/ui/input'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { RefreshPageButton } from '@/components/refresh-page-button'
import { Search } from '@/components/search'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ThemeSwitch } from '@/components/theme-switch'
import { fetchMenus } from './api/menus'
import { MenusDialogs } from './components/menus-dialogs'
import { MenusPrimaryButtons } from './components/menus-primary-buttons'
import { MenusProvider } from './components/menus-provider'
import { MenusTable } from './components/menus-table'
import { flattenVisibleMenuRows } from './lib/menu-contract'

const route = getRouteApi('/_authenticated/system/menu/')

export function Menus() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [isExpandedAll, setIsExpandedAll] = useState(false)
  const menusQuery = useQuery({
    queryKey: ['menus', search],
    queryFn: () => fetchMenus(search),
    placeholderData: (previousData) => previousData,
  })

  const menuTree = menusQuery.data ?? []

  const allExpandableIds = useMemo(() => {
    const ids = new Set<number>()
    const walk = (nodes: typeof menuTree) => {
      nodes.forEach((node) => {
        if ((node.children ?? []).length > 0) {
          ids.add(node.menuId)
          walk(node.children ?? [])
        }
      })
    }
    walk(menuTree)
    return ids
  }, [menuTree])

  const visibleRows = useMemo(() => {
    const effectiveExpandedIds = isExpandedAll ? allExpandableIds : expandedIds
    return flattenVisibleMenuRows(menuTree, effectiveExpandedIds)
  }, [allExpandableIds, expandedIds, isExpandedAll, menuTree])

  return (
    <MenusProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>菜单管理</h2>
          </div>
          <MenusPrimaryButtons
            isExpandedAll={isExpandedAll}
            onToggleExpandAll={() => setIsExpandedAll((prev) => !prev)}
          />
        </div>

        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
          <Input
            value={search.menuName ?? ''}
            onChange={(event) =>
              navigate({
                search: (prev) => ({
                  ...(prev as Record<string, unknown>),
                  menuName: event.target.value || undefined,
                }),
              })
            }
            placeholder='按菜单名称搜索'
            className='h-9 w-full sm:max-w-64'
          />
          <Select
            value={(search.status ?? [])[0] ?? 'all'}
            onValueChange={(value) =>
              navigate({
                search: (prev) => ({
                  ...(prev as Record<string, unknown>),
                  status:
                    value === 'active' || value === 'inactive'
                      ? [value]
                      : undefined,
                }),
              })
            }
          >
            <SelectTrigger className='w-full sm:w-44'>
              <SelectValue placeholder='菜单状态' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>全部状态</SelectItem>
              <SelectItem value='active'>启用</SelectItem>
              <SelectItem value='inactive'>停用</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant='outline'
            onClick={() =>
              navigate({
                search: (prev) => ({
                  ...(prev as Record<string, unknown>),
                  menuName: undefined,
                  status: undefined,
                }),
              })
            }
          >
            重置
          </Button>
          <RefreshPageButton className='sm:ms-auto' />
        </div>

        <MenusTable
          rows={visibleRows}
          isLoading={menusQuery.isLoading}
          expandedIds={isExpandedAll ? allExpandableIds : expandedIds}
          onToggleExpand={(menuId) => {
            setIsExpandedAll(false)
            setExpandedIds((prev) => {
              const next = new Set(prev)
              if (next.has(menuId)) {
                next.delete(menuId)
              } else {
                next.add(menuId)
              }
              return next
            })
          }}
        />
      </Main>

      <MenusDialogs />
    </MenusProvider>
  )
}
