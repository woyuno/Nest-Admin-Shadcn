import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PermissionGuard } from '@/views/auth/components/permission-guard'
import { type Menu } from '../data/schema'
import { useMenus } from './menus-provider'

type MenuRowActionsProps = {
  row: Menu
}

export function MenuRowActions({ row }: MenuRowActionsProps) {
  const { setCurrentRow, setParentRow, setOpen } = useMenus()

  return (
    <div className='flex items-center gap-2'>
      <PermissionGuard permissions={['system:menu:edit']}>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => {
            setCurrentRow(row)
            setOpen('edit')
          }}
        >
          <Pencil className='me-1 size-4' />
          修改
        </Button>
      </PermissionGuard>
      <PermissionGuard permissions={['system:menu:add']}>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => {
            setParentRow(row)
            setOpen('add')
          }}
        >
          <Plus className='me-1 size-4' />
          新增
        </Button>
      </PermissionGuard>
      <PermissionGuard permissions={['system:menu:remove']}>
        <Button
          variant='ghost'
          size='sm'
          className='text-red-500 hover:text-red-500'
          onClick={() => {
            setCurrentRow(row)
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

