import { useCallback, useEffect, useState } from 'react'
import type { AccentName, ThemeName } from '@/lib/types'
import { readStore, writeStore } from '@/lib/utils'
import { ACCENTS } from '@/data/site'

const THEME_KEY = 'ziqo:theme'
const ACCENT_KEY = 'ziqo:accent'
const ACCENT_IDS = ACCENTS.map((a) => a.id)

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeName>(
    () => (document.documentElement.dataset.theme as ThemeName) ?? 'dark',
  )

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next)
    document.documentElement.dataset.theme = next
    document.documentElement.style.colorScheme = next
    document.documentElement.style.backgroundColor = next === 'light' ? '#f4f4f2' : '#060607'
    writeStore(THEME_KEY, next)
  }, [])

  const toggle = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme])

  // Follow the OS while the user has never made an explicit choice.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = (e: MediaQueryListEvent) => {
      if (!readStore(THEME_KEY, '', ['dark', 'light'] as const)) setThemeState(e.matches ? 'light' : 'dark')
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return { theme, setTheme, toggle }
}

export function useAccent() {
  const [accent, setAccentState] = useState<AccentName>(
    () => (document.documentElement.dataset.accent as AccentName) ?? 'lime',
  )

  const setAccent = useCallback((next: AccentName) => {
    setAccentState(next)
    document.documentElement.dataset.accent = next
    writeStore(ACCENT_KEY, next)
  }, [])

  return { accent, setAccent, accentIds: ACCENT_IDS }
}
