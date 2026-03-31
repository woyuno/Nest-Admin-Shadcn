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
import { Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { OperlogStatusBadge } from '@/components/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { PermissionGuard } from '@/features/auth/components/permission-guard'
import { type OperlogItem } from '../data/schema'
import {
  getOperlogBusinessTypeLabel,
  operlogBusinessTypeOptions,
} from '../lib/operlog-contract'

type OperlogTableProps = {
  data: OperlogItem[]
  total?: number
  isLoading?: boolean
  search: Record<string, unknown>
  navigate: NavigateFn
  onSelectionChange?: (rows: OperlogItem[]) => void
  onView?: (row: OperlogItem) => void
}

export function OperlogTable({
  data,
  total = data.length,
  isLoading = false,
  search,
  navigate,
  onSelectionChange,
  onView,
}: OperlogTableProps) {
  const selectionSignatureRef = useRef('')
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<OperlogItem>[]>(
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
      { accessorKey: 'operId', header: '日志编号' },
      { accessorKey: 'title', header: '系统模块' },
      {
        accessorKey: 'businessType',
        header: '操作类型',
        cell: ({ row }) => getOperlogBusinessTypeLabel(row.original.businessType),
      },
      { accessorKey: 'operName', header: '操作人员' },
      { accessorKey: 'operIp', header: '主机' },
      {
        accessorKey: 'status',
        header: '状态',
        cell: ({ row }) => <OperlogStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'operTime',
        header: '操作时间',
        cell: ({ row }) => format(row.original.operTime, 'yyyy-MM-dd HH:mm:ss'),
      },
      {
        accessorKey: 'costTime',
        header: '耗时',
        cell: ({ row }) => `${row.original.costTime} 毫秒`,
      },
      {
        id: 'actions',
        header: '操作',
        cell: ({ row }) => (
          <PermissionGuard permissions={['monitor:operlog:query']}>
            <Button variant='ghost' size='sm' onClick={() => onView?.(row.original)}>
              <Eye className='me-1 size-4' />
              详情
            </Button>
          </PermissionGuard>
        ),
      },
    ],
    [onView]
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
      { columnId: 'title', searchKey: 'title', type: 'string' },
      { columnId: 'operName', searchKey: 'operName', type: 'string' },
      { columnId: 'businessType', searchKey: 'businessType', type: 'array' },
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
    const signature = rows.map((row) => row.operId).join(',')
    if (selectionSignatureRef.current === signature) return
    selectionSignatureRef.current = signature
    onSelectionChange?.(rows)
  }, [onSelectionChange, rowSelection, data])

  return (
    <div className={cn('flex flex-1 flex-col gap-4')}>
      <DataTableToolbar
        table={table}
        searchPlaceholder='按系统模块搜索'
        searchKey='title'
        textFilters={[
          {
            columnId: 'operName',
            placeholder: '按操作人员搜索',
          },
        ]}
        filters={[
          {
            columnId: 'businessType',
            title: '类型',
            options: operlogBusinessTypeOptions.map((item) => ({
              label: item.label,
              value: item.value,
            })),
          },
          {
            columnId: 'status',
            title: '状态',
            selectionMode: 'single',
            options: [
              { label: '正常', value: 'success' },
              { label: '失败', value: 'error' },
            ],
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
                  正在加载操作日志...
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
                      className='bg-background group-hover/row:bg-muted'
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  没有查询到操作日志
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
