import { getRouteApi } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { AdminPageShell } from '@/components/layout/admin-page-shell'
import { PermissionGuard } from '@/views/auth/components/permission-guard'
import { fetchExamples } from './api/examples'
import { ExamplesTable } from './components/examples-table'

const route = getRouteApi('/_authenticated/system/example/')

export function ExamplePage() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const examplesQuery = useQuery({
    queryKey: ['examples', search],
    queryFn: () => fetchExamples(search),
    placeholderData: (previousData) => previousData,
  })

  const examplesData = examplesQuery.data ?? { list: [], total: 0 }

  return (
    <AdminPageShell
      title='示例模块'
      description='复制这个页面后，继续补筛选栏、弹窗和批量操作。'
      actions={
        <PermissionGuard permissions={['system:example:add']}>
          <Button>新增示例</Button>
        </PermissionGuard>
      }
    >
      <ExamplesTable
        data={examplesData.list}
        total={examplesData.total}
        isLoading={examplesQuery.isLoading}
        search={search}
        navigate={navigate}
      />
    </AdminPageShell>
  )
}
