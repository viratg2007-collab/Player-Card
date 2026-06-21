import { useState } from 'react'
import { getTheme, setTheme } from '../lib/theme.js'

const OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

// Segmented Light / Dark / System control. Applies immediately and persists.
export default function ThemeToggle() {
  const [theme, setLocal] = useState(getTheme())

  function choose(value) {
    setLocal(value)
    setTheme(value)
  }

  return (
    <div className="inline-flex w-full rounded-xl bg-surface2 p-0.5">
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => choose(value)}
          className={
            'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ' +
            (theme === value ? 'bg-surface text-content shadow-sm' : 'text-muted')
          }
        >
          {label}
        </button>
      ))}
    </div>
  )
}
