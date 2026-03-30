import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { KeyRound, ShieldCheck, Trash2, UserPen } from 'lucide-react'
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
import { type User } from '../data/schema'
import { useUsers } from './users-provider'

type DataTableRowActionsProps = {
  row: Row<User>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useUsers()
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <PermissionGuard permissions={['system:user:edit']}>
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
          </PermissionGuard>
          <PermissionGuard permissions={['system:user:edit']}>
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(row.original)
                setOpen('reset-password')
              }}
            >
              重置密码
              <DropdownMenuShortcut>
                <KeyRound size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </PermissionGuard>
          <PermissionGuard permissions={['system:user:edit']}>
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(row.original)
                setOpen('auth-role')
              }}
            >
              分配角色
              <DropdownMenuShortcut>
                <ShieldCheck size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </PermissionGuard>
          <PermissionGuard permissions={['system:user:remove']}>
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
          </PermissionGuard>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
