import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Download, Eye, Eraser } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { PermissionGuard } from '@/views/auth/components/permission-guard'
import {
  cleanTaskLogs,
  exportTaskLogs,
  fetchTaskLogs,
  taskLogsQueryKey,
} from '../api/tasks'
import {
  getJobGroupLabel,
  getTaskLogStatusLabel,
  jobGroupOptions,
  taskLogStatusOptions,
  type TaskItem,
  type TaskLogItem,
} from '../lib/task-contract'

type TasksLogsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTask?: TaskItem
}

type TaskLogsSearchState = {
  page: number
  pageSize: number
  jobName?: string
  jobGroup?: 'DEFAULT' | 'SYSTEM'
  status?: 'success' | 'error'
}

const defaultSearch: TaskLogsSearchState = {
  page: 1,
  pageSize: 10,
}

export function TasksLogsDialog({
  open,
  onOpenChange,
  currentTask,
}: TasksLogsDialogProps) {
  const queryClient = useQueryClient()
  const [detailRow, setDetailRow] = useState<TaskLogItem | null>(null)
  const [confirmCleanOpen, setConfirmCleanOpen] = useState(false)
  const [search, setSearch] = useState<TaskLogsSearchState>(defaultSearch)

  useEffect(() => {
    if (!open) return
    setSearch({
      ...defaultSearch,
      jobName: currentTask?.jobName || undefined,
      jobGroup: currentTask?.jobGroup,
    })
  }, [currentTask, open])

  const logsQuery = useQuery({
    queryKey: ['task-logs', search],
    queryFn: () =>
      fetchTaskLogs({
        page: search.page,
        pageSize: search.pageSize,
        jobName: search.jobName,
        jobGroup: search.jobGroup ? [search.jobGroup] : undefined,
        status: search.status ? [search.status] : undefined,
      }),
    enabled: open,
    placeholderData: (previousData) => previousData,
  })

  const cleanMutation = useMutation({
    mutationFn: cleanTaskLogs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskLogsQueryKey })
      toast.success('调度日志已清空')
      setConfirmCleanOpen(false)
    },
    onError: handleServerError,
  })

  const rows = logsQuery.data?.list ?? []
  const total = logsQuery.data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / search.pageSize))
  const title = currentTask ? `${currentTask.jobName} 的调度日志` : '调度日志'
  const description = currentTask
    ? `当前已按任务“${currentTask.jobName}”自动筛选日志。`
    : '查看定时任务执行历史、异常信息和运行结果。'

  const summaryText = useMemo(() => {
    if (!total) return '当前没有可展示的调度日志。'
    return `共 ${total} 条日志，当前第 ${search.page} 页，每页 ${search.pageSize} 条。`
  }, [search.page, search.pageSize, total])

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-6xl'>
          <DialogHeader className='text-start'>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='flex flex-wrap items-center gap-2'>
              <Input
                value={search.jobName ?? ''}
                onChange={(event) =>
                  setSearch((prev) => ({
                    ...prev,
                    page: 1,
                    jobName: event.target.value || undefined,
                  }))
                }
                placeholder='按任务名称筛选'
                className='h-9 w-full sm:w-56'
              />
              <Select
                value={search.jobGroup ?? 'all'}
                onValueChange={(value) =>
                  setSearch((prev) => ({
                    ...prev,
                    page: 1,
                    jobGroup:
                      value === 'DEFAULT' || value === 'SYSTEM'
                        ? value
                        : undefined,
                  }))
                }
              >
                <SelectTrigger className='w-full sm:w-44'>
                  <SelectValue placeholder='任务组' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>全部任务组</SelectItem>
                  {jobGroupOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={search.status ?? 'all'}
                onValueChange={(value) =>
                  setSearch((prev) => ({
                    ...prev,
                    page: 1,
                    status:
                      value === 'success' || value === 'error'
                        ? value
                        : undefined,
                  }))
                }
              >
                <SelectTrigger className='w-full sm:w-44'>
                  <SelectValue placeholder='执行状态' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>全部状态</SelectItem>
                  {taskLogStatusOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant='outline'
                onClick={() => setSearch(defaultSearch)}
              >
                重置
              </Button>
              <div className='ms-auto flex flex-wrap gap-2'>
                <PermissionGuard permissions={['monitor:job:remove']}>
                  <Button
                    variant='outline'
                    onClick={() => setConfirmCleanOpen(true)}
                  >
                    <Eraser className='me-1 size-4' />
                    清空日志
                  </Button>
                </PermissionGuard>
                <PermissionGuard permissions={['monitor:job:export']}>
                  <Button
                    variant='secondary'
                    onClick={async () => {
                      try {
                        const blob = await exportTaskLogs({
                          jobName: search.jobName,
                          jobGroup: search.jobGroup ? [search.jobGroup] : undefined,
                          status: search.status ? [search.status] : undefined,
                        })
                        downloadBlob(
                          blob,
                          `调度日志-${new Date().toISOString().slice(0, 10)}.xlsx`
                        )
                        toast.success('调度日志导出完成')
                      } catch (error) {
                        handleServerError(error)
                      }
                    }}
                  >
                    <Download className='me-1 size-4' />
                    导出日志
                  </Button>
                </PermissionGuard>
              </div>
            </div>

            <div className='rounded-md border p-3 text-sm text-muted-foreground'>
              {summaryText}
            </div>

            <div className='overflow-hidden rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日志编号</TableHead>
                    <TableHead>任务名称</TableHead>
                    <TableHead>任务组</TableHead>
                    <TableHead>调用目标</TableHead>
                    <TableHead>日志信息</TableHead>
                    <TableHead>执行状态</TableHead>
                    <TableHead>执行时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logsQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className='h-24 text-center text-muted-foreground'>
                        正在加载调度日志...
                      </TableCell>
                    </TableRow>
                  ) : rows.length ? (
                    rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.jobLogId}</TableCell>
                        <TableCell>{row.jobName}</TableCell>
                        <TableCell>{getJobGroupLabel(row.jobGroup)}</TableCell>
                        <TableCell className='max-w-72 truncate'>{row.invokeTarget}</TableCell>
                        <TableCell className='max-w-72 truncate'>{row.jobMessage || '-'}</TableCell>
                        <TableCell>{getTaskLogStatusLabel(row.status)}</TableCell>
                        <TableCell>{format(row.createTime, 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                        <TableCell>
                          <Button variant='ghost' size='sm' onClick={() => setDetailRow(row)}>
                            <Eye className='me-1 size-4' />
                            详情
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className='h-24 text-center'>
                        没有查询到调度日志
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className='flex flex-wrap items-center justify-between gap-2 text-sm'>
              <div className='text-muted-foreground'>
                第 {search.page} / {pageCount} 页
              </div>
              <div className='flex flex-wrap items-center gap-2'>
                <Select
                  value={String(search.pageSize)}
                  onValueChange={(value) =>
                    setSearch((prev) => ({
                      ...prev,
                      page: 1,
                      pageSize: Number(value),
                    }))
                  }
                >
                  <SelectTrigger className='w-28'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50, 100].map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size} 条/页
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant='outline'
                  disabled={search.page <= 1}
                  onClick={() =>
                    setSearch((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
                  }
                >
                  上一页
                </Button>
                <Button
                  variant='outline'
                  disabled={search.page >= pageCount}
                  onClick={() =>
                    setSearch((prev) => ({
                      ...prev,
                      page: Math.min(pageCount, prev.page + 1),
                    }))
                  }
                >
                  下一页
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailRow} onOpenChange={(state) => !state && setDetailRow(null)}>
        <DialogContent className='sm:max-w-2xl'>
          <DialogHeader className='text-start'>
            <DialogTitle>调度日志详情</DialogTitle>
            <DialogDescription>查看本次任务执行的详细结果和异常信息。</DialogDescription>
          </DialogHeader>
          {detailRow ? (
            <div className='grid gap-4 rounded-md border p-4 text-sm md:grid-cols-2'>
              <div>
                <div className='text-muted-foreground'>日志编号</div>
                <div>{detailRow.jobLogId}</div>
              </div>
              <div>
                <div className='text-muted-foreground'>任务名称</div>
                <div>{detailRow.jobName}</div>
              </div>
              <div>
                <div className='text-muted-foreground'>任务组</div>
                <div>{getJobGroupLabel(detailRow.jobGroup)}</div>
              </div>
              <div>
                <div className='text-muted-foreground'>执行状态</div>
                <div>{getTaskLogStatusLabel(detailRow.status)}</div>
              </div>
              <div className='md:col-span-2'>
                <div className='text-muted-foreground'>调用目标</div>
                <div>{detailRow.invokeTarget}</div>
              </div>
              <div className='md:col-span-2'>
                <div className='text-muted-foreground'>日志信息</div>
                <div>{detailRow.jobMessage || '-'}</div>
              </div>
              <div className='md:col-span-2'>
                <div className='text-muted-foreground'>异常信息</div>
                <div className='whitespace-pre-wrap break-all'>
                  {detailRow.exceptionInfo || '无异常信息'}
                </div>
              </div>
              <div>
                <div className='text-muted-foreground'>执行时间</div>
                <div>{format(detailRow.createTime, 'yyyy-MM-dd HH:mm:ss')}</div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant='outline' onClick={() => setDetailRow(null)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmCleanOpen}
        onOpenChange={setConfirmCleanOpen}
        handleConfirm={() => cleanMutation.mutate()}
        isLoading={cleanMutation.isPending}
        destructive
        title='清空调度日志'
        desc='确定清空所有调度日志吗？该操作不可恢复。'
        confirmText='确认清空'
      />
    </>
  )
}

