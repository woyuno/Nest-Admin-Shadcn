import { getRouteApi } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { AdminPageShell } from '@/components/layout/admin-page-shell'
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
      <AdminPageShell
        title='参数设置'
        actions={<ConfigsPrimaryButtons search={search} />}
      >
        <ConfigsTable
          data={configsData.list}
          total={configsData.total}
          isLoading={configsQuery.isLoading}
          search={search}
          navigate={navigate}
        />
      </AdminPageShell>

      <ConfigsDialogs />
    </ConfigsProvider>
  )
}
