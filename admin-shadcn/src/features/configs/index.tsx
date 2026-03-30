import { getRouteApi } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { fetchConfigs } from './api/configs'
import { ConfigsDialogs } from './components/configs-dialogs'
import { ConfigsPrimaryButtons } from './components/configs-primary-buttons'
import { ConfigsProvider } from './components/configs-provider'
import { ConfigsTable } from './components/configs-table'

const route = getRouteApi('/_authenticated/system/config/')

export function Configs() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const configsQuery = useQuery({
    queryKey: ['configs', search],
    queryFn: () => fetchConfigs(search),
    placeholderData: (previousData) => previousData,
  })

  const configsData = configsQuery.data ?? { list: [], total: 0 }

  return (
    <ConfigsProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>参数设置</h2>
          </div>
          <ConfigsPrimaryButtons search={search} />
        </div>
        <ConfigsTable
          data={configsData.list}
          total={configsData.total}
          isLoading={configsQuery.isLoading}
          search={search}
          navigate={navigate}
        />
      </Main>

      <ConfigsDialogs />
    </ConfigsProvider>
  )
}
