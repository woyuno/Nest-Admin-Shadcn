import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type DictData, type DictType } from '../data/schema'

type DictsDialogType =
  | 'typeAdd'
  | 'typeEdit'
  | 'typeDelete'
  | 'dataAdd'
  | 'dataEdit'
  | 'dataDelete'

type DictsContextType = {
  open: DictsDialogType | null
  setOpen: (str: DictsDialogType | null) => void
  currentTypeRow: DictType | null
  setCurrentTypeRow: React.Dispatch<React.SetStateAction<DictType | null>>
  currentDataRow: DictData | null
  setCurrentDataRow: React.Dispatch<React.SetStateAction<DictData | null>>
}

const DictsContext = React.createContext<DictsContextType | null>(null)

export function DictsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<DictsDialogType>(null)
  const [currentTypeRow, setCurrentTypeRow] = useState<DictType | null>(null)
  const [currentDataRow, setCurrentDataRow] = useState<DictData | null>(null)

  return (
    <DictsContext
      value={{
        open,
        setOpen,
        currentTypeRow,
        setCurrentTypeRow,
        currentDataRow,
        setCurrentDataRow,
      }}
    >
      {children}
    </DictsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDicts() {
  const dictsContext = React.useContext(DictsContext)
  if (!dictsContext) {
    throw new Error('useDicts has to be used within <DictsContext>')
  }

  return dictsContext
}
