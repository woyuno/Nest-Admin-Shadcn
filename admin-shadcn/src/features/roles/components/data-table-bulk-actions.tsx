import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PermissionGuard } from '@/features/auth/components/permission-guard'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type Role } from '../data/schema'
import { RolesMultiDeleteDialog } from './roles-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  return (
    <>
      <BulkActionsToolbar table={table} entityName='角色'>
        <PermissionGuard permissions={['system:role:remove']}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='destructive'
                size='icon'
                onClick={() => setShowDeleteConfirm(true)}
                className='size-8'
                aria-label='删除选中角色'
                title='删除选中角色'
              >
                <Trash2 />
                <span className='sr-only'>删除选中角色</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>删除选中角色</p>
            </TooltipContent>
          </Tooltip>
        </PermissionGuard>
      </BulkActionsToolbar>

      <RolesMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        selectedRoles={selectedRows.map((row) => row.original as Role)}
        onDeleted={() => table.resetRowSelection()}
      />
    </>
  )
}
