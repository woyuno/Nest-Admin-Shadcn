'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { deleteRoles, rolesQueryKey } from '../api/roles'
import { type Role } from '../data/schema'

type RolesMultiDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedRoles: Role[]
  onDeleted?: () => void
}

export function RolesMultiDeleteDialog({
  open,
  onOpenChange,
  selectedRoles,
  onDeleted,
}: RolesMultiDeleteDialogProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      await deleteRoles(selectedRoles.map((role) => role.roleId))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKey })
      onDeleted?.()
      setValue('')
      onOpenChange(false)
      toast.success(`已删除 ${selectedRoles.length} 个角色`)
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
          <AlertTriangle className='me-1 inline-block stroke-destructive' size={18} /> 删除 {selectedRoles.length} 个角色
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            确认删除当前选中的角色吗？
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
