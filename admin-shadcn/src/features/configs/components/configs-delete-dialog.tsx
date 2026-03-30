import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { configsQueryKey, deleteConfig } from '../api/configs'
import { type Config } from '../data/schema'

type ConfigsDeleteDialogProps = {
  currentRow: Config
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConfigsDeleteDialog({
  currentRow,
  open,
  onOpenChange,
}: ConfigsDeleteDialogProps) {
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: () => deleteConfig(currentRow.configId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configsQueryKey })
      onOpenChange(false)
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='删除参数'
      desc={`确定要删除参数“${currentRow.configName}”吗？该操作不可恢复。`}
      confirmText='确认删除'
      destructive
      isLoading={deleteMutation.isPending}
      handleConfirm={() => deleteMutation.mutate()}
    />
  )
}
