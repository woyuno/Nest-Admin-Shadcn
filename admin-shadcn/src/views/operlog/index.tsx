import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Download, Eraser, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { downloadBlob } from '@/lib/download-blob'
import { handleServerError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { PermissionGuard } from '@/views/auth/components/permission-guard'
import {
  cleanOperlog,
  deleteOperlog,
  exportOperlog,
  fetchOperlog,
  operlogQueryKey,
} from './api/operlog'
import { OperlogDetailDialog } from './components/operlog-detail-dialog'
import { OperlogTable } from './components/operlog-table'
import { type OperlogItem } from './data/schema'

const route = getRouteApi('/_authenticated/monitor/operlog/')

export function Operlog() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const queryClient = useQueryClient()
  const [selectedRows, setSelectedRows] = useState<OperlogItem[]>([])
  const [currentRow, setCurrentRow] = useState<OperlogItem | null>(null)
  const [dialog, setDialog] = useState<null | 'delete' | 'clean' | 'detail'>(null)

  const operlogQuery = useQuery({
    queryKey: ['operlog', search],
    queryFn: () => fetchOperlog(search),
    placeholderData: (previousData) => previousData,
  })

  const deleteMutation = useMutation({
    mutationFn: async () => deleteOperlog(selectedRows.map((row) => row.operId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operlogQueryKey })
      toast.success(`已删除 ${selectedRows.length} 条操作日志`)
      setSelectedRows([])
      setDialog(null)
    },
    onError: handleServerError,
  })

  const cleanMutation = useMutation({
    mutationFn: cleanOperlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operlogQueryKey })
      toast.success('操作日志已清空')
      setSelectedRows([])
      setDialog(null)
    },
    onError: handleServerError,
  })

  const handleExport = async () => {
    try {
      const blob = await exportOperlog(search)
      downloadBlob(blob, `操作日志-${new Date().toISOString().slice(0, 10)}.xlsx`)
      toast.success('操作日志导出完成')
    } catch (error) {
      handleServerError(error)
    }
  }

  const data = operlogQuery.data ?? { list: [], total: 0 }

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
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>操作日志</h2>
          </div>
          <div className='flex flex-wrap gap-2'>
            <PermissionGuard permissions={['monitor:operlog:remove']}>
              <Button
                variant='destructive'
                disabled={!selectedRows.length}
                onClick={() => setDialog('delete')}
              >
                <Trash2 className='me-2 size-4' />
                删除选中
              </Button>
            </PermissionGuard>
            <PermissionGuard permissions={['monitor:operlog:remove']}>
              <Button variant='outline' onClick={() => setDialog('clean')}>
                <Eraser className='me-2 size-4' />
                清空日志
              </Button>
            </PermissionGuard>
            <PermissionGuard permissions={['monitor:operlog:export']}>
              <Button variant='outline' onClick={handleExport}>
                <Download className='me-2 size-4' />
                导出
              </Button>
            </PermissionGuard>
          </div>
        </div>

        <OperlogTable
          data={data.list}
          total={data.total}
          isLoading={operlogQuery.isLoading}
          search={search}
          navigate={navigate}
          onSelectionChange={setSelectedRows}
          onView={(row) => {
            setCurrentRow(row)
            setDialog('detail')
          }}
        />
      </Main>

      <ConfirmDialog
        open={dialog === 'delete'}
        onOpenChange={(open) => setDialog(open ? 'delete' : null)}
        handleConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
        destructive
        title='删除操作日志'
        desc={`确定删除选中的 ${selectedRows.length} 条操作日志吗？该操作不可恢复。`}
        confirmText='确认删除'
      />
      <ConfirmDialog
        open={dialog === 'clean'}
        onOpenChange={(open) => setDialog(open ? 'clean' : null)}
        handleConfirm={() => cleanMutation.mutate()}
        isLoading={cleanMutation.isPending}
        destructive
        title='清空操作日志'
        desc='确定清空全部操作日志吗？该操作不可恢复。'
        confirmText='确认清空'
      />
      <OperlogDetailDialog
        open={dialog === 'detail'}
        onOpenChange={(open) => {
          setDialog(open ? 'detail' : null)
          if (!open) {
            setCurrentRow(null)
          }
        }}
        currentRow={currentRow}
      />
    </>
  )
}

