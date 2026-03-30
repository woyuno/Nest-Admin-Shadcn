import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Notice } from '../data/schema'

type NoticesDialogType = 'add' | 'edit' | 'delete'

type NoticesContextType = {
  open: NoticesDialogType | null
  setOpen: (str: NoticesDialogType | null) => void
  currentRow: Notice | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Notice | null>>
}

const NoticesContext = React.createContext<NoticesContextType | null>(null)

export function NoticesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<NoticesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Notice | null>(null)

  return (
    <NoticesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </NoticesContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotices() {
  const noticesContext = React.useContext(NoticesContext)
  if (!noticesContext) {
    throw new Error('useNotices has to be used within <NoticesContext>')
  }

  return noticesContext
}
