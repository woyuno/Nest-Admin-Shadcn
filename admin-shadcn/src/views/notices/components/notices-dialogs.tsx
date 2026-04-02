import { NoticesActionDialog } from './notices-action-dialog'
import { NoticesDeleteDialog } from './notices-delete-dialog'
import { useNotices } from './notices-provider'

export function NoticesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useNotices()

  return (
    <>
      <NoticesActionDialog
        key='notice-add'
        open={open === 'add'}
        onOpenChange={(nextOpen) => setOpen(nextOpen ? 'add' : null)}
      />

      {currentRow && (
        <>
          <NoticesActionDialog
            key={`notice-edit-${currentRow.id}`}
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

          <NoticesDeleteDialog
            key={`notice-delete-${currentRow.id}`}
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
