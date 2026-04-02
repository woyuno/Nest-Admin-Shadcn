import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { deleteNotice, noticesQueryKey } from '../api/notices'
import { type Notice } from '../data/schema'

type NoticesDeleteDialogProps = {
  currentRow: Notice
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NoticesDeleteDialog({
  currentRow,
  open,
  onOpenChange,
}: NoticesDeleteDialogProps) {
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: () => deleteNotice(currentRow.noticeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noticesQueryKey })
      onOpenChange(false)
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='删除公告'
      desc={`确定要删除公告“${currentRow.noticeTitle}”吗？该操作不可恢复。`}
      confirmText='确认删除'
      destructive
      isLoading={deleteMutation.isPending}
      handleConfirm={() => deleteMutation.mutate()}
    />
  )
}
