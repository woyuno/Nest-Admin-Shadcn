import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type Table } from '@tanstack/react-table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { configsQueryKey, deleteConfigs } from '../api/configs'
import { type Config } from '../data/schema'

type ConfigsMultiDeleteDialogProps<TData> = {
  table: Table<TData>
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConfigsMultiDeleteDialog<TData>({
  table,
  open,
  onOpenChange,
}: ConfigsMultiDeleteDialogProps<TData>) {
  const queryClient = useQueryClient()
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedConfigs = selectedRows.map((row) => row.original as Config)

  const deleteMutation = useMutation({
    mutationFn: () => deleteConfigs(selectedConfigs.map((item) => item.configId)),
    onSuccess: () => {
      table.resetRowSelection()
      queryClient.invalidateQueries({ queryKey: configsQueryKey })
      onOpenChange(false)
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='批量删除参数'
      desc={`确定要删除选中的 ${selectedConfigs.length} 个参数吗？该操作不可恢复。`}
      confirmText='确认删除'
      destructive
      isLoading={deleteMutation.isPending}
      handleConfirm={() => deleteMutation.mutate()}
    />
  )
}
