import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getCookie, removeCookie, setCookie } from '@/lib/cookies'

export type ColorTheme = 'default' | 'enterprise-blue' | 'teal'

const COLOR_THEME_COOKIE_NAME = 'vite-ui-color-theme'
const COLOR_THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year
const DEFAULT_COLOR_THEME: ColorTheme = 'teal'

export function getDefaultColorTheme() {
  return DEFAULT_COLOR_THEME
}

export function isColorTheme(value: string): value is ColorTheme {
  return ['default', 'enterprise-blue', 'teal'].includes(value)
}

type ColorThemeProviderProps = {
  children: React.ReactNode
  defaultColorTheme?: ColorTheme
  storageKey?: string
}

type ColorThemeProviderState = {
  colorTheme: ColorTheme
  defaultColorTheme: ColorTheme
  setColorTheme: (colorTheme: ColorTheme) => void
  resetColorTheme: () => void
}

const initialState: ColorThemeProviderState = {
  colorTheme: DEFAULT_COLOR_THEME,
  defaultColorTheme: DEFAULT_COLOR_THEME,
  setColorTheme: () => null,
  resetColorTheme: () => null,
}

const ColorThemeContext = createContext<ColorThemeProviderState>(initialState)

export function ColorThemeProvider({
  children,
  defaultColorTheme = DEFAULT_COLOR_THEME,
  storageKey = COLOR_THEME_COOKIE_NAME,
}: ColorThemeProviderProps) {
  const [colorTheme, _setColorTheme] = useState<ColorTheme>(() => {
    const saved = getCookie(storageKey)
    return saved && isColorTheme(saved) ? saved : defaultColorTheme
  })

  useEffect(() => {
    const root = window.document.documentElement
    root.dataset.colorTheme = colorTheme
  }, [colorTheme])

  const setColorTheme = (nextColorTheme: ColorTheme) => {
    setCookie(storageKey, nextColorTheme, COLOR_THEME_COOKIE_MAX_AGE)
    _setColorTheme(nextColorTheme)
  }

  const resetColorTheme = () => {
    removeCookie(storageKey)
    _setColorTheme(defaultColorTheme)
  }

  const contextValue = useMemo(
    () => ({
      colorTheme,
      defaultColorTheme,
      setColorTheme,
      resetColorTheme,
    }),
    [colorTheme, defaultColorTheme]
  )

  return (
    <ColorThemeContext value={contextValue}>{children}</ColorThemeContext>
  )
}

export const useColorTheme = () => {
  const context = useContext(ColorThemeContext)

  if (!context) {
    throw new Error('useColorTheme must be used within a ColorThemeProvider')
  }

  return context
}
