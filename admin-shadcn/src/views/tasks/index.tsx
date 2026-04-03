import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Download, FileText, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { downloadBlob } from '@/lib/download-blob'
import { handleServerError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { AdminPageShell } from '@/components/layout/admin-page-shell'
import { PermissionGuard } from '@/views/auth/components/permission-guard'
import {
  deleteTasks,
  exportTasks,
  fetchTaskDetail,
  fetchTasks,
  runTask,
  tasksQueryKey,
} from './api/tasks'
import { TasksActionDialog } from './components/tasks-action-dialog'
import { TasksLogsDialog } from './components/tasks-logs-dialog'
import { TasksTable } from './components/tasks-table'
import {
  concurrentPolicyOptions,
  getJobGroupLabel,
  getJobStatusLabel,
  misfirePolicyOptions,
  type JobFormValues,
  type TaskItem,
} from './lib/task-contract'

const route = getRouteApi('/_authenticated/monitor/job/')

export function Tasks() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const queryClient = useQueryClient()
  const [selectedRows, setSelectedRows] = useState<TaskItem[]>([])
  const [editingRow, setEditingRow] = useState<TaskItem | undefined>()
  const [deletingRows, setDeletingRows] = useState<TaskItem[]>([])
  const [runningRow, setRunningRow] = useState<TaskItem | null>(null)
  const [logsRow, setLogsRow] = useState<TaskItem | undefined>()
  const [detailRow, setDetailRow] = useState<TaskItem | null>(null)
  const [detailData, setDetailData] = useState<JobFormValues | null>(null)
  const [dialog, setDialog] = useState<null | 'create' | 'edit' | 'logs' | 'detail'>(null)

  const tasksQuery = useQuery({
    queryKey: ['tasks', search],
    queryFn: () => fetchTasks(search),
    placeholderData: (previousData) => previousData,
  })

  const deleteMutation = useMutation({
    mutationFn: async () => deleteTasks(deletingRows.map((row) => row.jobId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey })
      toast.success(`已删除 ${deletingRows.length} 个定时任务`)
      setSelectedRows([])
      setDeletingRows([])
    },
    onError: handleServerError,
  })

  const runMutation = useMutation({
    mutationFn: async () => runTask(runningRow!.jobId),
    onSuccess: () => {
      toast.success(`任务 ${runningRow?.jobName} 已触发执行`)
      setRunningRow(null)
    },
    onError: handleServerError,
  })

  const rows = tasksQuery.data?.list ?? []
  const total = tasksQuery.data?.total ?? 0
  const deleteCount = deletingRows.length

  const detailMeta = useMemo(() => {
    if (!detailData) return []

    const misfireLabel =
      misfirePolicyOptions.find((item) => item.value === detailData.misfirePolicy)?.label ??
      detailData.misfirePolicy
    const concurrentLabel =
      concurrentPolicyOptions.find((item) => item.value === detailData.concurrent)?.label ??
      detailData.concurrent

    return [
      { label: '任务编号', value: String(detailData.jobId ?? '-') },
      { label: '任务名称', value: detailData.jobName },
      { label: '任务组', value: getJobGroupLabel(detailData.jobGroup) },
      { label: '任务状态', value: getJobStatusLabel(detailData.status) },
      { label: 'Cron 表达式', value: detailData.cronExpression },
      { label: '执行策略', value: misfireLabel },
      { label: '并发策略', value: concurrentLabel },
      { label: '调用目标', value: detailData.invokeTarget },
      { label: '备注', value: detailData.remark || '无' },
    ]
  }, [detailData])

  return (
    <>
      <AdminPageShell
        title='定时任务'
        actions={
          <div className='flex flex-wrap gap-2'>
            <PermissionGuard permissions={['monitor:job:add']}>
              <Button
                onClick={() => {
                  setEditingRow(undefined)
                  setDialog('create')
                }}
              >
                <Plus className='me-1 size-4' />
                新增任务
              </Button>
            </PermissionGuard>
            <PermissionGuard permissions={['monitor:job:remove']}>
              <Button
                variant='destructive'
                disabled={!selectedRows.length}
                onClick={() => setDeletingRows(selectedRows)}
              >
                <Trash2 className='me-1 size-4' />
                删除选中
              </Button>
            </PermissionGuard>
            <PermissionGuard permissions={['monitor:job:query']}>
              <Button
                variant='outline'
                onClick={() => {
                  setLogsRow(undefined)
                  setDialog('logs')
                }}
              >
                <FileText className='me-1 size-4' />
                全部日志
              </Button>
            </PermissionGuard>
            <PermissionGuard permissions={['monitor:job:export']}>
              <Button
                variant='secondary'
                onClick={async () => {
                  try {
                    const blob = await exportTasks(search)
                    downloadBlob(
                      blob,
                      `定时任务-${new Date().toISOString().slice(0, 10)}.xlsx`
                    )
                    toast.success('定时任务导出完成')
                  } catch (error) {
                    handleServerError(error)
                  }
                }}
              >
                <Download className='me-1 size-4' />
                导出
              </Button>
            </PermissionGuard>
          </div>
        }
      >
        <TasksTable
          data={rows}
          total={total}
          isLoading={tasksQuery.isLoading}
          search={search}
          navigate={navigate}
          onSelectionChange={setSelectedRows}
          onStatusChanged={() =>
            queryClient.invalidateQueries({ queryKey: tasksQueryKey })
          }
          onEdit={(row) => {
            setEditingRow(row)
            setDialog('edit')
          }}
          onDelete={(row) => setDeletingRows([row])}
          onRun={(row) => setRunningRow(row)}
          onView={async (row) => {
            try {
              setDetailRow(row)
              setDetailData(await fetchTaskDetail(row.jobId))
              setDialog('detail')
            } catch (error) {
              handleServerError(error)
            }
          }}
          onViewLogs={(row) => {
            setLogsRow(row)
            setDialog('logs')
          }}
        />
      </AdminPageShell>

      <TasksActionDialog
        currentRow={dialog === 'edit' ? editingRow : undefined}
        open={dialog === 'create' || dialog === 'edit'}
        onOpenChange={(open) => {
          if (!open) {
            setDialog(null)
            setEditingRow(undefined)
          }
        }}
      />

      <TasksLogsDialog
        open={dialog === 'logs'}
        currentTask={logsRow}
        onOpenChange={(open) => {
          if (!open) {
            setDialog(null)
            setLogsRow(undefined)
          }
        }}
      />

      <Dialog
        open={dialog === 'detail'}
        onOpenChange={(open) => {
          if (!open) {
            setDialog(null)
            setDetailRow(null)
            setDetailData(null)
          }
        }}
      >
        <DialogContent className='sm:max-w-3xl'>
          <DialogHeader className='text-start'>
            <DialogTitle>任务详情</DialogTitle>
            <DialogDescription>
              查看任务“{detailRow?.jobName ?? ''}”的执行配置和当前策略。
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 rounded-md border p-4 text-sm md:grid-cols-2'>
            {detailMeta.map((item) => (
              <div key={item.label} className={item.label === '调用目标' || item.label === '备注' ? 'md:col-span-2' : ''}>
                <div className='text-muted-foreground'>{item.label}</div>
                <div className='break-all whitespace-pre-wrap'>{item.value}</div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDialog(null)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteCount > 0}
        onOpenChange={(open) => {
          if (!open) setDeletingRows([])
        }}
        handleConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
        destructive
        title='删除定时任务'
        desc={`确定删除选中的 ${deleteCount} 个定时任务吗？该操作不可恢复。`}
        confirmText='确认删除'
      />

      <ConfirmDialog
        open={!!runningRow}
        onOpenChange={(open) => {
          if (!open) setRunningRow(null)
        }}
        handleConfirm={() => runMutation.mutate()}
        isLoading={runMutation.isPending}
        title='立即执行一次'
        desc={`确定立即执行任务“${runningRow?.jobName || ''}”吗？`}
        confirmText='确认执行'
      />
    </>
  )
}

