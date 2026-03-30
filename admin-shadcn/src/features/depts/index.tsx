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
import { fetchDepts } from './api/depts'
import { DeptsDialogs } from './components/depts-dialogs'
import { DeptsPrimaryButtons } from './components/depts-primary-buttons'
import { DeptsProvider } from './components/depts-provider'
import { DeptsTable } from './components/depts-table'
import { flattenVisibleDeptRows } from './lib/dept-contract'

const route = getRouteApi('/_authenticated/system/dept/')

export function Depts() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [isExpandedAll, setIsExpandedAll] = useState(true)
  const deptsQuery = useQuery({
    queryKey: ['depts', search],
    queryFn: () => fetchDepts(search),
    placeholderData: (previousData) => previousData,
  })

  const deptTree = deptsQuery.data ?? []

  const allExpandableIds = useMemo(() => {
    const ids = new Set<number>()
    const walk = (nodes: typeof deptTree) => {
      nodes.forEach((node) => {
        if ((node.children ?? []).length > 0) {
          ids.add(node.deptId)
          walk(node.children ?? [])
        }
      })
    }
    walk(deptTree)
    return ids
  }, [deptTree])

  const visibleRows = useMemo(() => {
    const effectiveExpandedIds = isExpandedAll ? allExpandableIds : expandedIds
    return flattenVisibleDeptRows(deptTree, effectiveExpandedIds)
  }, [allExpandableIds, deptTree, expandedIds, isExpandedAll])

  return (
    <DeptsProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>部门管理</h2>
          </div>
          <DeptsPrimaryButtons
            isExpandedAll={isExpandedAll}
            onToggleExpandAll={() => setIsExpandedAll((prev) => !prev)}
          />
        </div>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
          <Input
            value={search.deptName ?? ''}
            onChange={(event) =>
              navigate({
                search: (prev) => ({
                  ...(prev as Record<string, unknown>),
                  deptName: event.target.value || undefined,
                }),
              })
            }
            placeholder='按部门名称搜索'
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
              <SelectValue placeholder='部门状态' />
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
                  deptName: undefined,
                  status: undefined,
                }),
              })
            }
          >
            重置
          </Button>
          <RefreshPageButton className='sm:ms-auto' />
        </div>
        <DeptsTable
          rows={visibleRows}
          isLoading={deptsQuery.isLoading}
          expandedIds={isExpandedAll ? allExpandableIds : expandedIds}
          onToggleExpand={(deptId) => {
            setIsExpandedAll(false)
            setExpandedIds((prev) => {
              const next = new Set(prev)
              if (next.has(deptId)) {
                next.delete(deptId)
              } else {
                next.add(deptId)
              }
              return next
            })
          }}
        />
      </Main>

      <DeptsDialogs />
    </DeptsProvider>
  )
}
