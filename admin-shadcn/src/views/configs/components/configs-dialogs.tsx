import { ConfigsActionDialog } from './configs-action-dialog'
import { ConfigsDeleteDialog } from './configs-delete-dialog'
import { useConfigs } from './configs-provider'

export function ConfigsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useConfigs()

  return (
    <>
      <ConfigsActionDialog
        key='config-add'
        open={open === 'add'}
        onOpenChange={(nextOpen) => setOpen(nextOpen ? 'add' : null)}
      />

      {currentRow && (
        <>
          <ConfigsActionDialog
            key={`config-edit-${currentRow.id}`}
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

          <ConfigsDeleteDialog
            key={`config-delete-${currentRow.id}`}
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
