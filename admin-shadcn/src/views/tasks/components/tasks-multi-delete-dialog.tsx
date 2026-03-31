'use client'

import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { ConfirmDialog } from '@/components/confirm-dialog'

type TaskMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

export function TasksMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: TaskMultiDeleteDialogProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = () => {
    onOpenChange(false)

    toast.promise(sleep(2000), {
      loading: 'Deleting tasks...',
      success: () => {
        table.resetRowSelection()
        return `Deleted ${selectedRows.length} ${
          selectedRows.length > 1 ? 'tasks' : 'task'
        }`
      },
      error: 'Error',
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Delete {selectedRows.length}{' '}
          {selectedRows.length > 1 ? 'tasks' : 'task'}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete the selected tasks? <br />
            This action cannot be undone.
          </p>
        </div>
      }
      confirmText='Delete'
      destructive
    />
  )
}
