import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { deleteMenu, menusQueryKey } from '../api/menus'
import { type Menu } from '../data/schema'

type MenusDeleteDialogProps = {
  currentRow: Menu
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MenusDeleteDialog({
  currentRow,
  open,
  onOpenChange,
}: MenusDeleteDialogProps) {
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: () => deleteMenu(currentRow.menuId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menusQueryKey })
      onOpenChange(false)
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='删除菜单'
      desc={`确定要删除菜单“${currentRow.menuName}”吗？该操作不可恢复。`}
      confirmText='确认删除'
      destructive
      isLoading={deleteMutation.isPending}
      handleConfirm={() => deleteMutation.mutate()}
    />
  )
}
