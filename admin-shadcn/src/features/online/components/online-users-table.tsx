import { useEffect, useState } from 'react'
import {
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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import { Button } from '@/components/ui/button'
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
import { forceLogoutOnlineUser } from '../api/online'
import { type OnlineUser } from '../data/schema'

type OnlineUsersTableProps = {
  data: OnlineUser[]
  total?: number
  isLoading?: boolean
  search: Record<string, unknown>
  navigate: NavigateFn
}

export function OnlineUsersTable({
  data,
  total = data.length,
  isLoading = false,
  search,
  navigate,
}: OnlineUsersTableProps) {
  const queryClient = useQueryClient()
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  const forceLogoutMutation = useMutation({
    mutationFn: (tokenId: string) => forceLogoutOnlineUser(tokenId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-users'] })
      toast.success('在线用户已强退')
    },
  })

  const columns = [
    {
      accessorKey: 'tokenId',
      header: '会话编号',
      cell: ({ row }: { row: { original: OnlineUser } }) => row.original.tokenId,
    },
    {
      accessorKey: 'userName',
      header: '登录账号',
      cell: ({ row }: { row: { original: OnlineUser } }) => row.original.userName,
    },
    {
      accessorKey: 'deptName',
      header: '所属部门',
      cell: ({ row }: { row: { original: OnlineUser } }) => row.original.deptName || '-',
    },
    {
      accessorKey: 'ipaddr',
      header: '主机',
      cell: ({ row }: { row: { original: OnlineUser } }) => row.original.ipaddr || '-',
    },
    {
      accessorKey: 'loginLocation',
      header: '登录地点',
      cell: ({ row }: { row: { original: OnlineUser } }) => row.original.loginLocation || '-',
    },
    {
      accessorKey: 'os',
      header: '操作系统',
      cell: ({ row }: { row: { original: OnlineUser } }) => row.original.os || '-',
    },
    {
      accessorKey: 'browser',
      header: '浏览器',
      cell: ({ row }: { row: { original: OnlineUser } }) => row.original.browser || '-',
    },
    {
      accessorKey: 'loginTime',
      header: '登录时间',
      cell: ({ row }: { row: { original: OnlineUser } }) =>
        format(row.original.loginTime, 'yyyy-MM-dd HH:mm:ss'),
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }: { row: { original: OnlineUser } }) => (
        <PermissionGuard permissions={['monitor:online:forceLogout']}>
          <Button
            variant='ghost'
            size='sm'
            className='text-red-500 hover:text-red-500'
            disabled={forceLogoutMutation.isPending}
            onClick={() => forceLogoutMutation.mutate(row.original.tokenId)}
          >
            <LogOut className='me-1 size-4' />
            强退
          </Button>
        </PermissionGuard>
      ),
    },
  ]

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
      columnFilters,
      columnVisibility,
    },
    onPaginationChange,
    onColumnFiltersChange,
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
                    className={cn('bg-background group-hover/row:bg-muted')}
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
                <TableCell colSpan={columns.length} className='h-24 text-center text-muted-foreground'>
                  正在加载在线用户...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className='group/row'>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn('bg-background group-hover/row:bg-muted')}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  没有查询到在线用户
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
