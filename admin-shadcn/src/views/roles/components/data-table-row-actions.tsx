import { type Row } from '@tanstack/react-table'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { CircleCheckBig, Trash2, UserRoundCog, UserPen } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
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
import {
  fetchRoleDetail,
  fetchRoleMenuTree,
  roleDetailQueryKey,
  roleMenuTreeQueryKey,
} from '../api/roles'
import { type Role } from '../data/schema'
import { getRoleRowActions } from './role-row-actions'
import { useRoles } from './roles-provider'

type DataTableRowActionsProps = {
  row: Row<Role>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useRoles()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { open } = useSidebar()
  const { collapsible, contentWidth } = useLayout()
  const actions = getRoleRowActions(row.original.roleId)
  const isWideLayout =
    getLayoutMode({ open, collapsible, contentWidth }) === 'offcanvas'

  const prefetchEditData = () => {
    void queryClient.prefetchQuery({
      queryKey: roleDetailQueryKey(row.original.roleId),
      queryFn: () => fetchRoleDetail(row.original.roleId),
      staleTime: 60_000,
    })
    void queryClient.prefetchQuery({
      queryKey: roleMenuTreeQueryKey(row.original.roleId),
      queryFn: () => fetchRoleMenuTree(row.original.roleId),
      staleTime: 60_000,
    })
  }

  if (actions.length === 0) {
    return null
  }

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
          <PermissionGuard permissions={['system:role:edit']}>
            {actions.includes('edit') ? (
              <DropdownMenuItem
                onPointerEnter={prefetchEditData}
                onClick={() => {
                  prefetchEditData()
                  setCurrentRow(row.original)
                  setOpen('edit')
                }}
              >
                <UserPen className='size-4' />
                修改
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
                <CircleCheckBig className='size-4' />
                数据权限
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
                <UserRoundCog className='size-4' />
                分配用户
              </DropdownMenuItem>
            ) : null}
          </PermissionGuard>
          <PermissionGuard permissions={['system:role:remove']}>
            {actions.includes('delete') ? (
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
            ) : null}
          </PermissionGuard>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className='flex flex-wrap items-center gap-1'>
      <PermissionGuard permissions={['system:role:edit']}>
        {actions.includes('edit') ? (
          <Button
            variant='ghost'
            size='sm'
            onPointerEnter={prefetchEditData}
            onClick={() => {
              prefetchEditData()
              setCurrentRow(row.original)
              setOpen('edit')
            }}
          >
            <UserPen className='me-1 size-4' />
            修改
          </Button>
        ) : null}
      </PermissionGuard>
      <PermissionGuard permissions={['system:role:edit']}>
        {actions.includes('data-scope') ? (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('data-scope')
            }}
          >
            <CircleCheckBig className='me-1 size-4' />
            数据权限
          </Button>
        ) : null}
      </PermissionGuard>
      <PermissionGuard permissions={['system:role:edit']}>
        {actions.includes('assign-user') ? (
          <Button
            variant='ghost'
            size='sm'
            onClick={() =>
              navigate({
                to: '/system/role-auth/user/$roleId',
                params: { roleId: String(row.original.roleId) },
              })
            }
          >
            <UserRoundCog className='me-1 size-4' />
            分配用户
          </Button>
        ) : null}
      </PermissionGuard>
      <PermissionGuard permissions={['system:role:remove']}>
        {actions.includes('delete') ? (
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
        ) : null}
      </PermissionGuard>
    </div>
  )
}

