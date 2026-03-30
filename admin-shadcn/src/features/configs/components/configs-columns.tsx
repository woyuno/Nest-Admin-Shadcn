import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { cn } from '@/lib/utils'
import { type Config } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const configsColumns: ColumnDef<Config>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='全选参数'
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
        aria-label='选择参数'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'configName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='参数名称' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36 ps-3'>{row.original.configName}</LongText>
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
    accessorKey: 'configKey',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='参数键名' />
    ),
    cell: ({ row }) => <LongText className='max-w-40'>{row.original.configKey}</LongText>,
  },
  {
    accessorKey: 'configValue',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='参数键值' />
    ),
    cell: ({ row }) => <LongText className='max-w-40'>{row.original.configValue}</LongText>,
  },
  {
    accessorKey: 'configType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='系统内置' />
    ),
    cell: ({ row }) => (
      <Badge variant='outline'>
        {row.original.configType === 'builtIn' ? '是' : '否'}
      </Badge>
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: false,
  },
  {
    accessorKey: 'remark',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='备注' />
    ),
    cell: ({ row }) => <LongText className='max-w-48'>{row.original.remark || '-'}</LongText>,
    enableSorting: false,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='创建时间' />
    ),
    cell: ({ row }) => (
      <div className='text-nowrap'>
        {format(row.original.createdAt, 'yyyy-MM-dd HH:mm')}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
