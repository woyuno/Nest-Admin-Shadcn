import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type Table } from '@tanstack/react-table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { deleteNotices, noticesQueryKey } from '../api/notices'
import { type Notice } from '../data/schema'

type NoticesMultiDeleteDialogProps<TData> = {
  table: Table<TData>
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NoticesMultiDeleteDialog<TData>({
  table,
  open,
  onOpenChange,
}: NoticesMultiDeleteDialogProps<TData>) {
  const queryClient = useQueryClient()
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedNotices = selectedRows.map((row) => row.original as Notice)

  const deleteMutation = useMutation({
    mutationFn: () => deleteNotices(selectedNotices.map((item) => item.noticeId)),
    onSuccess: () => {
      table.resetRowSelection()
      queryClient.invalidateQueries({ queryKey: noticesQueryKey })
      onOpenChange(false)
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='批量删除公告'
      desc={`确定要删除选中的 ${selectedNotices.length} 条公告吗？该操作不可恢复。`}
      confirmText='确认删除'
      destructive
      isLoading={deleteMutation.isPending}
      handleConfirm={() => deleteMutation.mutate()}
    />
  )
}
