import { PostsActionDialog } from './posts-action-dialog'
import { PostsDeleteDialog } from './posts-delete-dialog'
import { usePosts } from './posts-provider'

export function PostsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePosts()

  return (
    <>
      <PostsActionDialog
        key='post-add'
        open={open === 'add'}
        onOpenChange={(nextOpen) => setOpen(nextOpen ? 'add' : null)}
      />

      {currentRow && (
        <>
          <PostsActionDialog
            key={`post-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={(nextOpen) => {
              setOpen(nextOpen ? 'edit' : null)
              if (!nextOpen) {
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />

          <PostsDeleteDialog
            key={`post-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={(nextOpen) => {
              setOpen(nextOpen ? 'delete' : null)
              if (!nextOpen) {
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
