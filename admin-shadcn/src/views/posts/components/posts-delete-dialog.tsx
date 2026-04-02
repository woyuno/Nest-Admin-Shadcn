import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { deletePost, postsQueryKey } from '../api/posts'
import { type Post } from '../data/schema'

type PostsDeleteDialogProps = {
  currentRow: Post
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PostsDeleteDialog({
  currentRow,
  open,
  onOpenChange,
}: PostsDeleteDialogProps) {
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: () => deletePost(currentRow.postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsQueryKey })
      onOpenChange(false)
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='删除岗位'
      desc={`确定要删除岗位“${currentRow.postName}”吗？该操作不可恢复。`}
      confirmText='确认删除'
      destructive
      isLoading={deleteMutation.isPending}
      handleConfirm={() => deleteMutation.mutate()}
    />
  )
}
