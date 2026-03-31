import { getRouteApi } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { fetchOnlineUsers } from './api/online'
import { OnlineUsersTable } from './components/online-users-table'

const route = getRouteApi('/_authenticated/monitor/online/')

export function OnlineUsers() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const onlineUsersQuery = useQuery({
    queryKey: ['online-users', search],
    queryFn: () => fetchOnlineUsers(search),
    placeholderData: (previousData) => previousData,
  })

  const onlineUsersData = onlineUsersQuery.data ?? { list: [], total: 0 }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>在线用户</h2>
        </div>
        <OnlineUsersTable
          data={onlineUsersData.list}
          total={onlineUsersData.total}
          isLoading={onlineUsersQuery.isLoading}
          search={search}
          navigate={navigate}
        />
      </Main>
    </>
  )
}
