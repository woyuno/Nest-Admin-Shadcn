import { useState } from 'react'
import { type RowSelectionState } from '@tanstack/react-table'
import { getRouteApi } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { AdminPageShell } from '@/components/layout/admin-page-shell'
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
      <AdminPageShell
        title='用户管理'
        actions={
          <UsersPrimaryButtons
            search={search}
            selectedUsers={selectedUsers}
            onClearSelection={() => {
              setRowSelection({})
              setSelectedUsers([])
            }}
          />
        }
        sidebar={
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
        }
      >
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
      </AdminPageShell>

      <UsersDialogs />
    </UsersProvider>
  )
}
