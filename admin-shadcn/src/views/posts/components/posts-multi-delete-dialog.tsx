import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type Table } from '@tanstack/react-table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { deletePosts, postsQueryKey } from '../api/posts'
import { type Post } from '../data/schema'

type PostsMultiDeleteDialogProps<TData> = {
  table: Table<TData>
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PostsMultiDeleteDialog<TData>({
  table,
  open,
  onOpenChange,
}: PostsMultiDeleteDialogProps<TData>) {
  const queryClient = useQueryClient()
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedPosts = selectedRows.map((row) => row.original as Post)

  const deleteMutation = useMutation({
    mutationFn: () => deletePosts(selectedPosts.map((item) => item.postId)),
    onSuccess: () => {
      table.resetRowSelection()
      queryClient.invalidateQueries({ queryKey: postsQueryKey })
      onOpenChange(false)
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='批量删除岗位'
      desc={`确定要删除选中的 ${selectedPosts.length} 个岗位吗？该操作不可恢复。`}
      confirmText='确认删除'
      destructive
      isLoading={deleteMutation.isPending}
      handleConfirm={() => deleteMutation.mutate()}
    />
  )
}
