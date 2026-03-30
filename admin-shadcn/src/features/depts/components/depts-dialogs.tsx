import { DeptsActionDialog } from './depts-action-dialog'
import { DeptsDeleteDialog } from './depts-delete-dialog'
import { useDepts } from './depts-provider'

export function DeptsDialogs() {
  const {
    open,
    setOpen,
    currentRow,
    setCurrentRow,
    parentRow,
    setParentRow,
  } = useDepts()

  return (
    <>
      <DeptsActionDialog
        key={`dept-add-${parentRow?.deptId ?? 'root'}`}
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
          <DeptsActionDialog
            key={`dept-edit-${currentRow.id}`}
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

          <DeptsDeleteDialog
            key={`dept-delete-${currentRow.id}`}
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
