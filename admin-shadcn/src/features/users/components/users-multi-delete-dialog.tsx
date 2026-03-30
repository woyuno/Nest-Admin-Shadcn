'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { deleteUsers, usersQueryKey } from '../api/users'
import { type User } from '../data/schema'

type UserMultiDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedUsers: User[]
  onDeleted?: () => void
}

const CONFIRM_WORD = 'DELETE'

export function UsersMultiDeleteDialog({
  open,
  onOpenChange,
  selectedUsers,
  onDeleted,
}: UserMultiDeleteDialogProps) {
  const [value, setValue] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      await deleteUsers(selectedUsers.map((user) => user.userId!))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKey })
      onDeleted?.()
      setValue('')
      onOpenChange(false)
      toast.success(`已删除 ${selectedUsers.length} 个用户`)
    },
  })

  const handleDelete = () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`请输入 "${CONFIRM_WORD}" 以确认删除`)
      return
    }
    mutation.mutate()
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== CONFIRM_WORD}
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

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span>请输入 "{CONFIRM_WORD}" 进行确认：</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`请输入 "${CONFIRM_WORD}" 以确认删除`}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>风险提示</AlertTitle>
            <AlertDescription>
              请谨慎操作，该删除不可回滚。
            </AlertDescription>
          </Alert>
        </div>
      }
      cancelBtnText='取消'
      confirmText='确认删除'
      destructive
    />
  )
}
