import {
  getCoreRowModel,
  getPaginationRowModel,
  type ColumnDef,
  useReactTable,
} from '@tanstack/react-table'
import { DataTablePagination } from '@/components/data-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type ExampleRow = {
  id: string
  exampleId: number
  exampleName: string
  status: 'enabled' | 'disabled'
  remark: string
  createdAt: Date
}

type ExamplesTableProps = {
  data: ExampleRow[]
  total: number
  isLoading: boolean
  search: {
    page?: number
    pageSize?: number
  }
  navigate: (options: unknown) => void
}

const columns: Array<ColumnDef<ExampleRow>> = [
  {
    accessorKey: 'exampleName',
    header: '示例名称',
  },
  {
    accessorKey: 'status',
    header: '状态',
    cell: ({ row }) => (row.original.status === 'enabled' ? '启用' : '停用'),
  },
  {
    accessorKey: 'remark',
    header: '备注',
  },
]

export function ExamplesTable({
  data,
  total,
  isLoading,
  search,
}: ExamplesTableProps) {
  const table = useReactTable({
    data,
    columns,
    pageCount: Math.max(1, Math.ceil(total / (search.pageSize ?? 10))),
    state: {
      pagination: {
        pageIndex: Math.max((search.page ?? 1) - 1, 0),
        pageSize: search.pageSize ?? 10,
      },
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className='flex flex-1 flex-col gap-4 rounded-md border p-4'>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : String(header.column.columnDef.header ?? '')}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                加载中...
              </TableCell>
            </TableRow>
          ) : data.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{String(cell.getValue() ?? '')}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                暂无数据
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination table={table} className='mt-auto' />
    </div>
  )
}
