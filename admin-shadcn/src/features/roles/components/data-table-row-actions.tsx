import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { CircleCheckBig, Trash2, UserRoundCog, UserPen } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PermissionGuard } from '@/features/auth/components/permission-guard'
import { type Role } from '../data/schema'
import { getRoleRowActions } from './role-row-actions'
import { useRoles } from './roles-provider'

type DataTableRowActionsProps = {
  row: Row<Role>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useRoles()
  const navigate = useNavigate()
  const actions = getRoleRowActions(row.original.roleId)

  if (actions.length === 0) {
    return null
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'>
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' sideOffset={8} className='z-[70] w-[180px]'>
        <PermissionGuard permissions={['system:role:edit']}>
          {actions.includes('edit') ? (
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(row.original)
                setOpen('edit')
              }}
            >
              修改
              <DropdownMenuShortcut>
                <UserPen size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          ) : null}
        </PermissionGuard>
        <PermissionGuard permissions={['system:role:edit']}>
          {actions.includes('data-scope') ? (
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(row.original)
                setOpen('data-scope')
              }}
            >
              数据权限
              <DropdownMenuShortcut>
                <CircleCheckBig size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          ) : null}
        </PermissionGuard>
        <PermissionGuard permissions={['system:role:edit']}>
          {actions.includes('assign-user') ? (
            <DropdownMenuItem
              onClick={() =>
                navigate({
                  to: '/system/role-auth/user/$roleId',
                  params: { roleId: String(row.original.roleId) },
                })
              }
            >
              分配用户
              <DropdownMenuShortcut>
                <UserRoundCog size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          ) : null}
        </PermissionGuard>
        <PermissionGuard permissions={['system:role:remove']}>
          {actions.includes('delete') ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setCurrentRow(row.original)
                  setOpen('delete')
                }}
                className='text-red-500!'
              >
                删除
                <DropdownMenuShortcut>
                  <Trash2 size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </>
          ) : null}
        </PermissionGuard>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
