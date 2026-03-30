'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { deleteUser, usersQueryKey } from '../api/users'
import { type User } from '../data/schema'

type UserDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: UserDeleteDialogProps) {
  const [value, setValue] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      if (!currentRow.userId) {
        throw new Error('缺少用户 ID，无法删除')
      }

      await deleteUser(currentRow.userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKey })
      toast.success(`已删除用户 ${currentRow.userName ?? currentRow.username}`)
      setValue('')
      onOpenChange(false)
    },
  })

  const handleDelete = () => {
    if (value.trim() !== currentRow.username) return
    mutation.mutate()
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.username}
      isLoading={mutation.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          删除用户
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            确认删除用户{' '}
            <span className='font-bold'>{currentRow.username}</span>?
            <br />
            删除后无法恢复，请再次输入用户名确认。
          </p>

          <Label className='my-2'>
            用户账号：
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='请输入用户名以确认删除'
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
