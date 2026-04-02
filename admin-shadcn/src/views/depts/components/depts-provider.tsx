import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Dept } from '../data/schema'

type DeptsDialogType = 'add' | 'edit' | 'delete'

type DeptsContextType = {
  open: DeptsDialogType | null
  setOpen: (str: DeptsDialogType | null) => void
  currentRow: Dept | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Dept | null>>
  parentRow: Dept | null
  setParentRow: React.Dispatch<React.SetStateAction<Dept | null>>
}

const DeptsContext = React.createContext<DeptsContextType | null>(null)

export function DeptsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<DeptsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Dept | null>(null)
  const [parentRow, setParentRow] = useState<Dept | null>(null)

  return (
    <DeptsContext
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        parentRow,
        setParentRow,
      }}
    >
      {children}
    </DeptsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDepts() {
  const deptsContext = React.useContext(DeptsContext)
  if (!deptsContext) {
    throw new Error('useDepts has to be used within <DeptsContext>')
  }

  return deptsContext
}
