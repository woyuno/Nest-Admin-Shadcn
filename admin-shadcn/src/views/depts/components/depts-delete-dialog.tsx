import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { deleteDept, deptsQueryKey } from '../api/depts'
import { type Dept } from '../data/schema'

type DeptsDeleteDialogProps = {
  currentRow: Dept
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeptsDeleteDialog({
  currentRow,
  open,
  onOpenChange,
}: DeptsDeleteDialogProps) {
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: () => deleteDept(currentRow.deptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deptsQueryKey })
      onOpenChange(false)
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='删除部门'
      desc={`确定要删除部门“${currentRow.deptName}”吗？该操作不可恢复。`}
      confirmText='确认删除'
      destructive
      isLoading={deleteMutation.isPending}
      handleConfirm={() => deleteMutation.mutate()}
    />
  )
}
