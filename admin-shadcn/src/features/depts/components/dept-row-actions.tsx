import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PermissionGuard } from '@/features/auth/components/permission-guard'
import { type Dept } from '../data/schema'
import { useDepts } from './depts-provider'

type DeptRowActionsProps = {
  row: Dept
}

export function DeptRowActions({ row }: DeptRowActionsProps) {
  const { setCurrentRow, setParentRow, setOpen } = useDepts()

  return (
    <div className='flex items-center gap-2'>
      <PermissionGuard permissions={['system:dept:edit']}>
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
      <PermissionGuard permissions={['system:dept:add']}>
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
      {row.parentId !== 0 ? (
        <PermissionGuard permissions={['system:dept:remove']}>
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
      ) : null}
    </div>
  )
}
