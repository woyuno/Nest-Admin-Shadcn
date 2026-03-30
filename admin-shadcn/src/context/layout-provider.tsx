import { createContext, useContext, useState } from 'react'
import { getCookie, setCookie } from '@/lib/cookies'

export type Collapsible = 'offcanvas' | 'icon' | 'none'
type Variant = 'inset' | 'sidebar' | 'floating'
export type ContentWidth = 'narrow' | 'wide'
export type LayoutMode = 'default' | 'icon' | 'offcanvas'

// Cookie constants following the pattern from sidebar.tsx
const LAYOUT_COLLAPSIBLE_COOKIE_NAME = 'layout_collapsible'
const LAYOUT_VARIANT_COOKIE_NAME = 'layout_variant'
const LAYOUT_CONTENT_WIDTH_COOKIE_NAME = 'layout_content_width'
const LAYOUT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

// Default values
const DEFAULT_VARIANT = 'inset'
const DEFAULT_COLLAPSIBLE = 'icon'
const DEFAULT_CONTENT_WIDTH: ContentWidth = 'wide'

export function getDefaultContentWidth() {
  return DEFAULT_CONTENT_WIDTH
}

export function getLayoutMode({
  open,
  collapsible,
  contentWidth,
}: {
  open: boolean
  collapsible: Collapsible
  contentWidth: ContentWidth
}): LayoutMode {
  if (contentWidth === 'wide') {
    return 'offcanvas'
  }

  if (!open && collapsible === 'icon') {
    return 'icon'
  }

  return 'default'
}

type LayoutContextType = {
  resetLayout: () => void

  defaultCollapsible: Collapsible
  collapsible: Collapsible
  setCollapsible: (collapsible: Collapsible) => void

  defaultVariant: Variant
  variant: Variant
  setVariant: (variant: Variant) => void

  defaultContentWidth: ContentWidth
  contentWidth: ContentWidth
  setContentWidth: (contentWidth: ContentWidth) => void
}

const LayoutContext = createContext<LayoutContextType | null>(null)

type LayoutProviderProps = {
  children: React.ReactNode
}

export function LayoutProvider({ children }: LayoutProviderProps) {
  const [collapsible, _setCollapsible] = useState<Collapsible>(() => {
    const saved = getCookie(LAYOUT_COLLAPSIBLE_COOKIE_NAME)
    return (saved as Collapsible) || DEFAULT_COLLAPSIBLE
  })

  const [variant, _setVariant] = useState<Variant>(() => {
    const saved = getCookie(LAYOUT_VARIANT_COOKIE_NAME)
    return (saved as Variant) || DEFAULT_VARIANT
  })

  const [contentWidth, _setContentWidth] = useState<ContentWidth>(() => {
    const saved = getCookie(LAYOUT_CONTENT_WIDTH_COOKIE_NAME)
    return (saved as ContentWidth) || DEFAULT_CONTENT_WIDTH
  })

  const setCollapsible = (newCollapsible: Collapsible) => {
    _setCollapsible(newCollapsible)
    setCookie(
      LAYOUT_COLLAPSIBLE_COOKIE_NAME,
      newCollapsible,
      LAYOUT_COOKIE_MAX_AGE
    )
  }

  const setVariant = (newVariant: Variant) => {
    _setVariant(newVariant)
    setCookie(LAYOUT_VARIANT_COOKIE_NAME, newVariant, LAYOUT_COOKIE_MAX_AGE)
  }

  const setContentWidth = (newContentWidth: ContentWidth) => {
    _setContentWidth(newContentWidth)
    setCookie(
      LAYOUT_CONTENT_WIDTH_COOKIE_NAME,
      newContentWidth,
      LAYOUT_COOKIE_MAX_AGE
    )
  }

  const resetLayout = () => {
    setCollapsible(DEFAULT_COLLAPSIBLE)
    setVariant(DEFAULT_VARIANT)
    setContentWidth(DEFAULT_CONTENT_WIDTH)
  }

  const contextValue: LayoutContextType = {
    resetLayout,
    defaultCollapsible: DEFAULT_COLLAPSIBLE,
    collapsible,
    setCollapsible,
    defaultVariant: DEFAULT_VARIANT,
    variant,
    setVariant,
    defaultContentWidth: DEFAULT_CONTENT_WIDTH,
    contentWidth,
    setContentWidth,
  }

  return <LayoutContext value={contextValue}>{children}</LayoutContext>
}

// Define the hook for the provider
// eslint-disable-next-line react-refresh/only-export-components
export function useLayout() {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
}
