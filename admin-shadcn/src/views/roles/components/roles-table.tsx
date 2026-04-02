import { useEffect } from 'react'
import {
  type OnChangeFn,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/data-table'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import { type Role } from '../data/schema'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { rolesColumns as columns } from './roles-columns'

type RolesTableProps = {
  data: Role[]
  total: number
  isLoading: boolean
  search: Record<string, unknown>
  navigate: NavigateFn
  rowSelection: RowSelectionState
  onRowSelectionChange: OnChangeFn<RowSelectionState>
  onSelectedRolesChange?: (roles: Role[]) => void
}

export function RolesTable({
  data,
  total,
  isLoading,
  search,
  navigate,
  rowSelection,
  onRowSelectionChange,
  onSelectedRolesChange,
}: RolesTableProps) {
  const { columnFilters, onColumnFiltersChange, pagination, onPaginationChange } =
    useTableUrlState({
      search,
      navigate,
      pagination: { defaultPage: 1, defaultPageSize: 10 },
      globalFilter: { enabled: false },
      columnFilters: [
        { columnId: 'roleName', searchKey: 'roleName', type: 'string' },
        { columnId: 'roleKey', searchKey: 'roleKey', type: 'string' },
        { columnId: 'status', searchKey: 'status', type: 'array' },
      ],
    })

  const pageCount = Math.max(1, Math.ceil(total / pagination.pageSize))

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    pageCount,
    state: { columnFilters, pagination, rowSelection },
    enableRowSelection: true,
    onColumnFiltersChange,
    onPaginationChange,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  useEffect(() => {
    const nextSelectedRoles = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original)
      .filter(Boolean)

    onSelectedRolesChange?.(nextSelectedRoles)
  }, [data, onSelectedRolesChange, rowSelection])

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                  正在加载角色数据...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  没有查询到角色数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
      <DataTableBulkActions table={table} />
    </div>
  )
}
