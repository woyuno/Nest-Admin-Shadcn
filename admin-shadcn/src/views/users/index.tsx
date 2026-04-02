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
import { fetchUserDeptTree, fetchUsers } from './api/users'
import { UsersDeptFilter } from './components/users-dept-filter'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersSearchToolbar } from './components/users-search-toolbar'
import { UsersTable } from './components/users-table'
import { type User } from './data/schema'

const route = getRouteApi('/_authenticated/system/user/')

export function Users() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const usersQuery = useQuery({
    queryKey: ['users', search],
    queryFn: () => fetchUsers(search),
    placeholderData: (previousData) => previousData,
  })
  const deptTreeQuery = useQuery({
    queryKey: ['users', 'dept-tree-sidebar'],
    queryFn: fetchUserDeptTree,
    placeholderData: (previousData) => previousData,
  })

  const usersData = usersQuery.data ?? { list: [], total: 0 }

  return (
    <UsersProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>用户管理</h2>
          </div>
          <UsersPrimaryButtons
            search={search}
            selectedUsers={selectedUsers}
            onClearSelection={() => {
              setRowSelection({})
              setSelectedUsers([])
            }}
          />
        </div>
        <div className='flex flex-1 flex-col gap-4 lg:flex-row lg:items-start'>
          <UsersDeptFilter
            data={deptTreeQuery.data ?? []}
            selectedDeptId={search.deptId}
            onSelect={(deptId) =>
              navigate({
                search: (prev) => ({
                  ...(prev as Record<string, unknown>),
                  page: 1,
                  deptId,
                }),
              })
            }
          />
          <div className='flex flex-1 flex-col gap-4'>
            <UsersSearchToolbar
              key={`${search.username ?? ''}|${search.phonenumber ?? ''}|${search.status?.[0] ?? ''}|${search.beginTime ?? ''}|${search.endTime ?? ''}`}
              search={search}
              navigate={navigate}
            />
            <UsersTable
              data={usersData.list}
              total={usersData.total}
              isLoading={usersQuery.isLoading}
              search={search}
              navigate={navigate}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              onSelectedUsersChange={(nextUsers) =>
                setSelectedUsers((prev) => {
                  const prevIds = prev.map((item) => item.userId).join(',')
                  const nextIds = nextUsers.map((item) => item.userId).join(',')
                  return prevIds === nextIds ? prev : nextUsers
                })
              }
            />
          </div>
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
