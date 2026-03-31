import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { ActiveStatusBadge } from '@/components/status-badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Role } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { RolesStatusSwitch } from './roles-status-switch'

export const rolesColumns: ColumnDef<Role>[] = [
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
    accessorKey: 'roleId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='角色编号' />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'roleName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='角色名称' />
    ),
  },
  {
    accessorKey: 'roleKey',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='权限字符' />
    ),
  },
  {
    accessorKey: 'roleSort',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='显示顺序' />
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-3'>
          <ActiveStatusBadge status={row.original.status} />
          <RolesStatusSwitch role={row.original} />
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='创建时间' />
    ),
    cell: ({ row }) => format(row.original.createdAt, 'yyyy-MM-dd HH:mm'),
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
