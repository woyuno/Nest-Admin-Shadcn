import { RolesActionDialog } from './roles-action-dialog'
import { RolesDataScopeDialog } from './roles-data-scope-dialog'
import { RolesDeleteDialog } from './roles-delete-dialog'
import { useRoles } from './roles-provider'

export function RolesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useRoles()

  return (
    <>
      <RolesActionDialog
        key='role-add'
        open={open === 'add'}
        onOpenChange={(nextOpen) => setOpen(nextOpen ? 'add' : null)}
      />

      {currentRow && (
        <>
          <RolesActionDialog
            key={`role-edit-${currentRow.id}`}
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
          <RolesDeleteDialog
            key={`role-delete-${currentRow.id}`}
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
          <RolesDataScopeDialog
            key={`role-data-scope-${currentRow.id}`}
            open={open === 'data-scope'}
            onOpenChange={(nextOpen) => {
              setOpen(nextOpen ? 'data-scope' : null)
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
