import { type ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { ActiveStatusBadge } from '@/components/status-badge'
import { type User } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { UsersStatusSwitch } from './users-status-switch'

export const usersColumns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
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
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'userId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='用户编号' />
    ),
    cell: ({ row }) => <div>{row.original.userId ?? '-'}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'userName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='用户账号' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36 ps-3'>{row.getValue('userName')}</LongText>
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
    accessorKey: 'nickName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='用户昵称' />
    ),
    cell: ({ row }) => <LongText className='max-w-36'>{row.original.nickName}</LongText>,
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'deptName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='部门' />
    ),
    cell: ({ row }) => <LongText className='max-w-36'>{row.original.deptName}</LongText>,
  },
  {
    accessorKey: 'roleNames',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='角色' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-40'>{row.original.roleNames ?? '-'}</LongText>
    ),
  },
  {
    accessorKey: 'phonenumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='手机号码' />
    ),
    cell: ({ row }) => <div>{row.original.phonenumber}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      const { status } = row.original
      return (
        <div className='flex items-center gap-3'>
          <ActiveStatusBadge status={status} />
          <UsersStatusSwitch user={row.original} />
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: false,
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
