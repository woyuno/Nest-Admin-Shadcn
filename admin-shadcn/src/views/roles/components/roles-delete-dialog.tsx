'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
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
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      await deleteRole(currentRow.roleId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKey })
      toast.success(`已删除角色 ${currentRow.roleName}`)
      onOpenChange(false)
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
          <AlertTriangle className='me-1 inline-block stroke-destructive' size={18} /> 删除角色
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            确认删除角色 <span className='font-bold'>{currentRow.roleName}</span>？
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
