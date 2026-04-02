import { MenusActionDialog } from './menus-action-dialog'
import { MenusDeleteDialog } from './menus-delete-dialog'
import { useMenus } from './menus-provider'

export function MenusDialogs() {
  const {
    open,
    setOpen,
    currentRow,
    setCurrentRow,
    parentRow,
    setParentRow,
  } = useMenus()

  return (
    <>
      <MenusActionDialog
        key={`menu-add-${parentRow?.menuId ?? 'root'}`}
        open={open === 'add'}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen ? 'add' : null)
          if (!nextOpen) {
            setTimeout(() => {
              setParentRow(null)
            }, 500)
          }
        }}
        parentRow={parentRow}
      />

      {currentRow ? (
        <>
          <MenusActionDialog
            key={`menu-edit-${currentRow.id}`}
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

          <MenusDeleteDialog
            key={`menu-delete-${currentRow.id}`}
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
      ) : null}
    </>
  )
}
