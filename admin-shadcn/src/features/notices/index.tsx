import { getRouteApi } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { fetchNotices } from './api/notices'
import { NoticesDialogs } from './components/notices-dialogs'
import { NoticesPrimaryButtons } from './components/notices-primary-buttons'
import { NoticesProvider } from './components/notices-provider'
import { NoticesTable } from './components/notices-table'

const route = getRouteApi('/_authenticated/system/notice/')

export function Notices() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const noticesQuery = useQuery({
    queryKey: ['notices', search],
    queryFn: () => fetchNotices(search),
    placeholderData: (previousData) => previousData,
  })

  const noticesData = noticesQuery.data ?? { list: [], total: 0 }

  return (
    <NoticesProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>通知公告</h2>
          </div>
          <NoticesPrimaryButtons />
        </div>
        <NoticesTable
          data={noticesData.list}
          total={noticesData.total}
          isLoading={noticesQuery.isLoading}
          search={search}
          navigate={navigate}
        />
      </Main>

      <NoticesDialogs />
    </NoticesProvider>
  )
}
