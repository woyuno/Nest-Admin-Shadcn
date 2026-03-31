import { useState } from 'react'
import { type RowSelectionState } from '@tanstack/react-table'
import { getRouteApi } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { fetchRoles } from './api/roles'
import { RolesDialogs } from './components/roles-dialogs'
import { RolesPrimaryButtons } from './components/roles-primary-buttons'
import { RolesProvider } from './components/roles-provider'
import { RolesSearchToolbar } from './components/roles-search-toolbar'
import { RolesTable } from './components/roles-table'
import { type Role } from './data/schema'

const route = getRouteApi('/_authenticated/system/role/')

export function Roles() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([])
  const rolesQuery = useQuery({
    queryKey: ['roles', search],
    queryFn: () => fetchRoles(search),
    placeholderData: (previousData) => previousData,
  })

  const rolesData = rolesQuery.data ?? { list: [], total: 0 }

  return (
    <RolesProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>角色管理</h2>
          </div>
          <RolesPrimaryButtons
            search={search}
            selectedRoles={selectedRoles}
            onClearSelection={() => {
              setRowSelection({})
              setSelectedRoles([])
            }}
          />
        </div>
        <RolesSearchToolbar
          key={`${search.roleName ?? ''}|${search.roleKey ?? ''}|${search.status?.[0] ?? ''}|${search.beginTime ?? ''}|${search.endTime ?? ''}`}
          search={search}
          navigate={navigate}
        />
        <RolesTable
          data={rolesData.list}
          total={rolesData.total}
          isLoading={rolesQuery.isLoading}
          search={search}
          navigate={navigate}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          onSelectedRolesChange={(nextRoles) =>
            setSelectedRoles((prev) => {
              const prevIds = prev.map((item) => item.roleId).join(',')
              const nextIds = nextRoles.map((item) => item.roleId).join(',')
              return prevIds === nextIds ? prev : nextRoles
            })
          }
        />
      </Main>

      <RolesDialogs />
    </RolesProvider>
  )
}
