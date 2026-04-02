import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { PermissionGuard } from '@/views/auth/components/permission-guard'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { PostsMultiDeleteDialog } from './posts-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <>
      <BulkActionsToolbar table={table} entityName='岗位'>
        <PermissionGuard permissions={['system:post:remove']}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='destructive'
                size='icon'
                onClick={() => setShowDeleteConfirm(true)}
                className='size-8'
                aria-label='删除选中岗位'
                title='删除选中岗位'
              >
                <Trash2 />
                <span className='sr-only'>删除选中岗位</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>删除选中岗位</p>
            </TooltipContent>
          </Tooltip>
        </PermissionGuard>
      </BulkActionsToolbar>

      <PostsMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}

