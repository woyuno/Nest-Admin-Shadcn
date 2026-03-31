/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'

const OverlayContainerContext = React.createContext<HTMLElement | null>(null)

export function OverlayContainerProvider({
  container,
  children,
}: {
  container: HTMLElement | null
  children: React.ReactNode
}) {
  return (
    <OverlayContainerContext.Provider value={container}>
      {children}
    </OverlayContainerContext.Provider>
  )
}

export function useOverlayContainer() {
  return React.useContext(OverlayContainerContext)
}
