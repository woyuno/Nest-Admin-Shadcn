import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { deleteDictData, deleteDictType, dictsQueryKey } from '../api/dicts'
import { type DictType } from '../data/schema'
import { DictDataActionDialog } from './dict-data-action-dialog'
import { DictTypeActionDialog } from './dict-type-action-dialog'
import { useDicts } from './dicts-provider'

type DictsDialogsProps = {
  selectedType?: DictType | null
}

function DictTypeDeleteDialog({
  open,
  onOpenChange,
  dictId,
  dictName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  dictId: number
  dictName: string
}) {
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: () => deleteDictType(dictId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictsQueryKey })
      onOpenChange(false)
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='删除字典类型'
      desc={`确定要删除字典类型“${dictName}”吗？该操作不可恢复。`}
      confirmText='确认删除'
      destructive
      isLoading={deleteMutation.isPending}
      handleConfirm={() => deleteMutation.mutate()}
    />
  )
}

function DictDataDeleteDialog({
  open,
  onOpenChange,
  dictCode,
  dictLabel,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  dictCode: number
  dictLabel: string
}) {
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: () => deleteDictData(dictCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictsQueryKey })
      onOpenChange(false)
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='删除字典数据'
      desc={`确定要删除字典数据“${dictLabel}”吗？该操作不可恢复。`}
      confirmText='确认删除'
      destructive
      isLoading={deleteMutation.isPending}
      handleConfirm={() => deleteMutation.mutate()}
    />
  )
}

export function DictsDialogs({ selectedType }: DictsDialogsProps) {
  const {
    open,
    setOpen,
    currentTypeRow,
    setCurrentTypeRow,
    currentDataRow,
    setCurrentDataRow,
  } = useDicts()

  return (
    <>
      <DictTypeActionDialog
        key='dict-type-add'
        open={open === 'typeAdd'}
        onOpenChange={(nextOpen) => setOpen(nextOpen ? 'typeAdd' : null)}
      />

      <DictDataActionDialog
        key={`dict-data-add-${selectedType?.dictId ?? 'none'}`}
        selectedType={selectedType}
        open={open === 'dataAdd'}
        onOpenChange={(nextOpen) => setOpen(nextOpen ? 'dataAdd' : null)}
      />

      {currentTypeRow ? (
        <>
          <DictTypeActionDialog
            key={`dict-type-edit-${currentTypeRow.id}`}
            open={open === 'typeEdit'}
            onOpenChange={(nextOpen) => {
              setOpen(nextOpen ? 'typeEdit' : null)
              if (!nextOpen) {
                setTimeout(() => setCurrentTypeRow(null), 500)
              }
            }}
            currentRow={currentTypeRow}
          />
          <DictTypeDeleteDialog
            open={open === 'typeDelete'}
            onOpenChange={(nextOpen) => {
              setOpen(nextOpen ? 'typeDelete' : null)
              if (!nextOpen) {
                setTimeout(() => setCurrentTypeRow(null), 500)
              }
            }}
            dictId={currentTypeRow.dictId}
            dictName={currentTypeRow.dictName}
          />
        </>
      ) : null}

      {currentDataRow ? (
        <>
          <DictDataActionDialog
            key={`dict-data-edit-${currentDataRow.id}`}
            selectedType={selectedType}
            open={open === 'dataEdit'}
            onOpenChange={(nextOpen) => {
              setOpen(nextOpen ? 'dataEdit' : null)
              if (!nextOpen) {
                setTimeout(() => setCurrentDataRow(null), 500)
              }
            }}
            currentRow={currentDataRow}
          />
          <DictDataDeleteDialog
            open={open === 'dataDelete'}
            onOpenChange={(nextOpen) => {
              setOpen(nextOpen ? 'dataDelete' : null)
              if (!nextOpen) {
                setTimeout(() => setCurrentDataRow(null), 500)
              }
            }}
            dictCode={currentDataRow.dictCode}
            dictLabel={currentDataRow.dictLabel}
          />
        </>
      ) : null}
    </>
  )
}
