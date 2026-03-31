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
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import { Checkbox } from '@/components/ui/checkbox'
import { SuccessStatusBadge } from '@/components/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { type LogininforItem } from '../data/schema'

type LogininforTableProps = {
  data: LogininforItem[]
  total?: number
  isLoading?: boolean
  search: Record<string, unknown>
  navigate: NavigateFn
  onSelectionChange?: (rows: LogininforItem[]) => void
}

export function LogininforTable({
  data,
  total = data.length,
  isLoading = false,
  search,
  navigate,
  onSelectionChange,
}: LogininforTableProps) {
  const selectionSignatureRef = useRef('')
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<LogininforItem>[]>(
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
      { accessorKey: 'infoId', header: '访问编号' },
      { accessorKey: 'userName', header: '用户账号' },
      { accessorKey: 'ipaddr', header: '登录地址' },
      { accessorKey: 'loginLocation', header: '登录地点' },
      { accessorKey: 'os', header: '操作系统' },
      { accessorKey: 'browser', header: '浏览器' },
      {
        accessorKey: 'status',
        header: '状态',
        cell: ({ row }) => <SuccessStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'msg',
        header: '描述',
        cell: ({ row }) => (
          <span className='line-clamp-1 max-w-[220px]'>{row.original.msg || '-'}</span>
        ),
      },
      {
        accessorKey: 'loginTime',
        header: '访问时间',
        cell: ({ row }) => format(row.original.loginTime, 'yyyy-MM-dd HH:mm:ss'),
      },
    ],
    []
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
      { columnId: 'ipaddr', searchKey: 'ipaddr', type: 'string' },
      { columnId: 'userName', searchKey: 'userName', type: 'string' },
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
    const signature = rows.map((row) => row.infoId).join(',')
    if (selectionSignatureRef.current === signature) return
    selectionSignatureRef.current = signature
    onSelectionChange?.(rows)
  }, [onSelectionChange, rowSelection, data])

  return (
    <div className={cn('flex flex-1 flex-col gap-4')}>
      <DataTableToolbar
        table={table}
        searchPlaceholder='按登录地址搜索'
        searchKey='ipaddr'
        textFilters={[
          {
            columnId: 'userName',
            placeholder: '按用户账号搜索',
          },
        ]}
        filters={[
          {
            columnId: 'status',
            title: '状态',
            selectionMode: 'single',
            options: [
              { label: '成功', value: 'success' },
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
                  正在加载登录日志...
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
                  没有查询到登录日志
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
