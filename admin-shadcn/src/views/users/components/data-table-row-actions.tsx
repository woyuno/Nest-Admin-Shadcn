import { type Row } from '@tanstack/react-table'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { KeyRound, ShieldCheck, Trash2, UserPen } from 'lucide-react'
import { getLayoutMode, useLayout } from '@/context/layout-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSidebar } from '@/components/ui/sidebar'
import { PermissionGuard } from '@/views/auth/components/permission-guard'
import { type User } from '../data/schema'
import { useUsers } from './users-provider'

type DataTableRowActionsProps = {
  row: Row<User>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useUsers()
  const { open } = useSidebar()
  const { collapsible, contentWidth } = useLayout()
  const isWideLayout =
    getLayoutMode({ open, collapsible, contentWidth }) === 'offcanvas'

  if (!isWideLayout) {
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>更多操作</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[180px]'>
          <PermissionGuard permissions={['system:user:edit']}>
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(row.original)
                setOpen('edit')
              }}
            >
              <UserPen className='size-4' />
              修改
            </DropdownMenuItem>
          </PermissionGuard>
          <PermissionGuard permissions={['system:user:edit']}>
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(row.original)
                setOpen('reset-password')
              }}
            >
              <KeyRound className='size-4' />
              重置密码
            </DropdownMenuItem>
          </PermissionGuard>
          <PermissionGuard permissions={['system:user:edit']}>
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(row.original)
                setOpen('auth-role')
              }}
            >
              <ShieldCheck className='size-4' />
              分配角色
            </DropdownMenuItem>
          </PermissionGuard>
          <PermissionGuard permissions={['system:user:remove']}>
            <DropdownMenuItem
              variant='destructive'
              onClick={() => {
                setCurrentRow(row.original)
                setOpen('delete')
              }}
            >
              <Trash2 className='size-4' />
              删除
            </DropdownMenuItem>
          </PermissionGuard>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className='flex flex-wrap items-center gap-1'>
      <PermissionGuard permissions={['system:user:edit']}>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('edit')
          }}
        >
          <UserPen className='me-1 size-4' />
          修改
        </Button>
      </PermissionGuard>
      <PermissionGuard permissions={['system:user:edit']}>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('reset-password')
          }}
        >
          <KeyRound className='me-1 size-4' />
          重置密码
        </Button>
      </PermissionGuard>
      <PermissionGuard permissions={['system:user:edit']}>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('auth-role')
          }}
        >
          <ShieldCheck className='me-1 size-4' />
          分配角色
        </Button>
      </PermissionGuard>
      <PermissionGuard permissions={['system:user:remove']}>
        <Button
          variant='ghost'
          size='sm'
          className='text-red-500 hover:text-red-500'
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('delete')
          }}
        >
          <Trash2 className='me-1 size-4' />
          删除
        </Button>
      </PermissionGuard>
    </div>
  )
}

