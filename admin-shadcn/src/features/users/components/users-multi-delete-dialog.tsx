'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { deleteUsers, usersQueryKey } from '../api/users'
import { type User } from '../data/schema'

type UserMultiDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedUsers: User[]
  onDeleted?: () => void
}

export function UsersMultiDeleteDialog({
  open,
  onOpenChange,
  selectedUsers,
  onDeleted,
}: UserMultiDeleteDialogProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      await deleteUsers(selectedUsers.map((user) => user.userId!))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKey })
      onDeleted?.()
      onOpenChange(false)
      toast.success(`已删除 ${selectedUsers.length} 个用户`)
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={() => mutation.mutate()}
      isLoading={mutation.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          删除 {selectedUsers.length} 个用户
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            确认删除当前选中的用户吗？
            <br />
            删除后无法恢复。
          </p>
        </div>
      }
      cancelBtnText='取消'
      confirmText='确认删除'
      destructive
    />
  )
}
