'use client'

import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="w-8 h-8 rounded-lg bg-bg-surface border border-border flex items-center justify-center text-sm"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}