import { useEffect, useMemo, useRef, useState } from 'react'
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { format } from 'date-fns'
import { Play, Trash2, Eye, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { TaskStatusBadge } from '@/components/status-badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { PermissionGuard } from '@/views/auth/components/permission-guard'
import { handleServerError } from '@/lib/handle-server-error'
import {
  changeTaskStatus,
} from '../api/tasks'
import {
  getJobGroupLabel,
  type TaskItem,
  taskStatusOptions,
  jobGroupOptions,
} from '../lib/task-contract'

type TasksTableProps = {
  data: TaskItem[]
  total?: number
  isLoading?: boolean
  search: Record<string, unknown>
  navigate: NavigateFn
  onSelectionChange?: (rows: TaskItem[]) => void
  onEdit?: (row: TaskItem) => void
  onDelete?: (row: TaskItem) => void
  onRun?: (row: TaskItem) => void
  onView?: (row: TaskItem) => void
  onViewLogs?: (row: TaskItem) => void
  onStatusChanged?: () => void
}

function TaskStatusSwitch({
  task,
  onStatusChanged,
}: {
  task: TaskItem
  onStatusChanged?: () => void
}) {
  const [checked, setChecked] = useState(task.status === 'active')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    setChecked(task.status === 'active')
  }, [task.status])

  return (
    <PermissionGuard permissions={['monitor:job:changeStatus']}>
      <div className='flex items-center gap-2'>
        <Switch
          checked={checked}
          disabled={pending}
          aria-label={`${task.jobName} 状态切换`}
          onCheckedChange={async (nextChecked) => {
            try {
              setPending(true)
              setChecked(nextChecked)
              await changeTaskStatus({ jobId: task.jobId, enabled: nextChecked })
              toast.success(`${task.jobName} 已${nextChecked ? '启用' : '暂停'}`)
              onStatusChanged?.()
            } catch (error) {
              setChecked(!nextChecked)
              handleServerError(error)
            } finally {
              setPending(false)
            }
          }}
        />
        <span className='text-sm text-muted-foreground'>
          {checked ? '启用' : '停用'}
        </span>
      </div>
    </PermissionGuard>
  )
}

export function TasksTable({
  data,
  total = data.length,
  isLoading = false,
  search,
  navigate,
  onSelectionChange,
  onEdit,
  onDelete,
  onRun,
  onView,
  onViewLogs,
  onStatusChanged,
}: TasksTableProps) {
  const selectionSignatureRef = useRef('')
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<TaskItem>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label='全选'
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label='选择当前行'
          />
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },
      { accessorKey: 'jobId', header: '任务编号' },
      { accessorKey: 'jobName', header: '任务名称' },
      {
        accessorKey: 'jobGroup',
        header: '任务组名',
        cell: ({ row }) => getJobGroupLabel(row.original.jobGroup),
      },
      { accessorKey: 'invokeTarget', header: '调用目标' },
      { accessorKey: 'cronExpression', header: 'Cron 表达式' },
      {
        accessorKey: 'status',
        header: '状态标签',
        cell: ({ row }) => <TaskStatusBadge status={row.original.status} />,
      },
      {
        id: 'statusSwitch',
        header: '状态切换',
        cell: ({ row }) => (
          <TaskStatusSwitch
            task={row.original}
            onStatusChanged={onStatusChanged}
          />
        ),
      },
      {
        accessorKey: 'updateTime',
        header: '更新时间',
        cell: ({ row }) => format(row.original.updateTime, 'yyyy-MM-dd HH:mm:ss'),
      },
      {
        id: 'actions',
        header: '操作',
        cell: ({ row }) => (
          <div className='flex flex-wrap gap-1'>
            <PermissionGuard permissions={['monitor:job:edit']}>
              <Button variant='ghost' size='sm' onClick={() => onEdit?.(row.original)}>
                <Pencil className='me-1 size-4' />
                修改
              </Button>
            </PermissionGuard>
            <PermissionGuard permissions={['monitor:job:remove']}>
              <Button variant='ghost' size='sm' onClick={() => onDelete?.(row.original)}>
                <Trash2 className='me-1 size-4' />
                删除
              </Button>
            </PermissionGuard>
            <PermissionGuard permissions={['monitor:job:changeStatus']}>
              <Button variant='ghost' size='sm' onClick={() => onRun?.(row.original)}>
                <Play className='me-1 size-4' />
                执行
              </Button>
            </PermissionGuard>
            <PermissionGuard permissions={['monitor:job:query']}>
              <Button variant='ghost' size='sm' onClick={() => onView?.(row.original)}>
                <Eye className='me-1 size-4' />
                详情
              </Button>
            </PermissionGuard>
            <PermissionGuard permissions={['monitor:job:query']}>
              <Button variant='ghost' size='sm' onClick={() => onViewLogs?.(row.original)}>
                日志
              </Button>
            </PermissionGuard>
          </div>
        ),
      },
    ],
    [onDelete, onEdit, onRun, onStatusChanged, onView, onViewLogs]
  )

  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: false },
    columnFilters: [
      { columnId: 'jobName', searchKey: 'jobName', type: 'string' },
      { columnId: 'jobGroup', searchKey: 'jobGroup', type: 'array' },
      { columnId: 'status', searchKey: 'status', type: 'array' },
    ],
  })

  const pageCount = Math.max(1, Math.ceil(total / pagination.pageSize))

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    pageCount,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  useEffect(() => {
    ensurePageInRange(pageCount, { resetTo: 'last' })
  }, [ensurePageInRange, pageCount])

  useEffect(() => {
    const rows = table.getSelectedRowModel().rows.map((row) => row.original)
    const signature = rows.map((row) => row.jobId).join(',')
    if (selectionSignatureRef.current === signature) return
    selectionSignatureRef.current = signature
    onSelectionChange?.(rows)
  }, [data, onSelectionChange, rowSelection])

  return (
    <div className={cn('flex flex-1 flex-col gap-4')}>
      <DataTableToolbar
        table={table}
        searchPlaceholder='按任务名称搜索'
        searchKey='jobName'
        filters={[
          {
            columnId: 'jobGroup',
            title: '任务组',
            selectionMode: 'single',
            options: jobGroupOptions.map((item) => ({
              label: item.label,
              value: item.value,
            })),
          },
          {
            columnId: 'status',
            title: '任务状态',
            selectionMode: 'single',
            options: taskStatusOptions.map((item) => ({
              label: item.label,
              value: item.value,
            })),
          },
        ]}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className='bg-background group-hover/row:bg-muted'
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center text-muted-foreground'
                >
                  正在加载定时任务...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='group/row'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className='bg-background align-top group-hover/row:bg-muted'
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  没有查询到定时任务
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
    </div>
  )
}

