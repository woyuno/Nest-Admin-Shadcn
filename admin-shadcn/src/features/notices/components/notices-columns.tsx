import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { PublishStatusBadge } from '@/components/status-badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { cn } from '@/lib/utils'
import { type Notice } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const noticesColumns: ColumnDef<Notice>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='全选公告'
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn('max-md:sticky start-0 z-10 rounded-tl-[inherit]'),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='选择公告'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'noticeTitle',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='公告标题' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-40 ps-3'>{row.original.noticeTitle}</LongText>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'noticeType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='公告类型' />
    ),
    cell: ({ row }) =>
      row.original.noticeType === 'announcement' ? '公告' : '通知',
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => <PublishStatusBadge status={row.original.status} />,
    enableSorting: false,
  },
  {
    accessorKey: 'createBy',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='创建者' />
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='创建时间' />
    ),
    cell: ({ row }) => format(row.original.createdAt, 'yyyy-MM-dd'),
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
