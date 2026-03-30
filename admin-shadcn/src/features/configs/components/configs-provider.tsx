import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Config } from '../data/schema'

type ConfigsDialogType = 'add' | 'edit' | 'delete'

type ConfigsContextType = {
  open: ConfigsDialogType | null
  setOpen: (str: ConfigsDialogType | null) => void
  currentRow: Config | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Config | null>>
}

const ConfigsContext = React.createContext<ConfigsContextType | null>(null)

export function ConfigsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<ConfigsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Config | null>(null)

  return (
    <ConfigsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ConfigsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfigs() {
  const configsContext = React.useContext(ConfigsContext)
  if (!configsContext) {
    throw new Error('useConfigs has to be used within <ConfigsContext>')
  }

  return configsContext
}
