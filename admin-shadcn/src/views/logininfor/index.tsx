import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Download, Eraser, Trash2, Unlock } from 'lucide-react'
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
  cleanLogininfor,
  deleteLogininfor,
  exportLogininfor,
  fetchLogininfor,
  logininforQueryKey,
  unlockLogininfor,
} from './api/logininfor'
import { LogininforTable } from './components/logininfor-table'
import { type LogininforItem } from './data/schema'

const route = getRouteApi('/_authenticated/monitor/logininfor/')

export function Logininfor() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const queryClient = useQueryClient()
  const [selectedRows, setSelectedRows] = useState<LogininforItem[]>([])
  const [dialog, setDialog] = useState<null | 'delete' | 'clean' | 'unlock'>(null)

  const logininforQuery = useQuery({
    queryKey: ['logininfor', search],
    queryFn: () => fetchLogininfor(search),
    placeholderData: (previousData) => previousData,
  })

  const deleteMutation = useMutation({
    mutationFn: async () => deleteLogininfor(selectedRows.map((row) => row.infoId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: logininforQueryKey })
      toast.success(`已删除 ${selectedRows.length} 条登录日志`)
      setSelectedRows([])
      setDialog(null)
    },
    onError: handleServerError,
  })

  const cleanMutation = useMutation({
    mutationFn: cleanLogininfor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: logininforQueryKey })
      toast.success('登录日志已清空')
      setSelectedRows([])
      setDialog(null)
    },
    onError: handleServerError,
  })

  const unlockMutation = useMutation({
    mutationFn: async () => unlockLogininfor(selectedRows[0]!.userName),
    onSuccess: () => {
      toast.success(`用户 ${selectedRows[0]?.userName} 已解锁`)
      setDialog(null)
    },
    onError: handleServerError,
  })

  const handleExport = async () => {
    try {
      const blob = await exportLogininfor(search)
      downloadBlob(blob, `登录日志-${new Date().toISOString().slice(0, 10)}.xlsx`)
      toast.success('登录日志导出完成')
    } catch (error) {
      handleServerError(error)
    }
  }

  const data = logininforQuery.data ?? { list: [], total: 0 }
  const selectedUserName = selectedRows[0]?.userName ?? ''

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
            <h2 className='text-2xl font-bold tracking-tight'>登录日志</h2>
          </div>
          <div className='flex flex-wrap gap-2'>
            <PermissionGuard permissions={['monitor:logininfor:remove']}>
              <Button
                variant='destructive'
                disabled={!selectedRows.length}
                onClick={() => setDialog('delete')}
              >
                <Trash2 className='me-2 size-4' />
                删除选中
              </Button>
            </PermissionGuard>
            <PermissionGuard permissions={['monitor:logininfor:remove']}>
              <Button variant='outline' onClick={() => setDialog('clean')}>
                <Eraser className='me-2 size-4' />
                清空日志
              </Button>
            </PermissionGuard>
            <PermissionGuard permissions={['monitor:logininfor:unlock']}>
              <Button
                variant='outline'
                disabled={selectedRows.length !== 1}
                onClick={() => setDialog('unlock')}
              >
                <Unlock className='me-2 size-4' />
                解锁账号
              </Button>
            </PermissionGuard>
            <PermissionGuard permissions={['monitor:logininfor:export']}>
              <Button variant='outline' onClick={handleExport}>
                <Download className='me-2 size-4' />
                导出
              </Button>
            </PermissionGuard>
          </div>
        </div>

        <LogininforTable
          data={data.list}
          total={data.total}
          isLoading={logininforQuery.isLoading}
          search={search}
          navigate={navigate}
          onSelectionChange={setSelectedRows}
        />
      </Main>

      <ConfirmDialog
        open={dialog === 'delete'}
        onOpenChange={(open) => setDialog(open ? 'delete' : null)}
        handleConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
        destructive
        title='删除登录日志'
        desc={`确定删除选中的 ${selectedRows.length} 条登录日志吗？该操作不可恢复。`}
        confirmText='确认删除'
      />
      <ConfirmDialog
        open={dialog === 'clean'}
        onOpenChange={(open) => setDialog(open ? 'clean' : null)}
        handleConfirm={() => cleanMutation.mutate()}
        isLoading={cleanMutation.isPending}
        destructive
        title='清空登录日志'
        desc='确定清空全部登录日志吗？该操作不可恢复。'
        confirmText='确认清空'
      />
      <ConfirmDialog
        open={dialog === 'unlock'}
        onOpenChange={(open) => setDialog(open ? 'unlock' : null)}
        handleConfirm={() => unlockMutation.mutate()}
        isLoading={unlockMutation.isPending}
        title='解锁用户'
        desc={`确定解锁用户“${selectedUserName}”的登录状态吗？`}
        confirmText='确认解锁'
      />
    </>
  )
}

