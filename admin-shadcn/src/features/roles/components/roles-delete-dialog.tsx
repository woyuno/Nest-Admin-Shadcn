'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { deleteRole, rolesQueryKey } from '../api/roles'
import { type Role } from '../data/schema'

type RolesDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Role
}

export function RolesDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: RolesDeleteDialogProps) {
  const [value, setValue] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      await deleteRole(currentRow.roleId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKey })
      toast.success(`已删除角色 ${currentRow.roleName}`)
      setValue('')
      onOpenChange(false)
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={() => mutation.mutate()}
      disabled={value.trim() !== currentRow.roleName}
      isLoading={mutation.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle className='me-1 inline-block stroke-destructive' size={18} /> 删除角色
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            确认删除角色 <span className='font-bold'>{currentRow.roleName}</span>？
            <br />
            删除后无法恢复，请输入角色名称确认。
          </p>
          <Label className='my-2'>
            角色名称：
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='请输入角色名称以确认删除'
            />
          </Label>
          <Alert variant='destructive'>
            <AlertTitle>风险提示</AlertTitle>
            <AlertDescription>请谨慎操作，该删除不可回滚。</AlertDescription>
          </Alert>
        </div>
      }
      cancelBtnText='取消'
      confirmText='确认删除'
      destructive
    />
  )
}
