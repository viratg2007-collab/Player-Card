// Light/dark theme handling. Preference is stored in localStorage as one of
// 'light' | 'dark' | 'system'. 'system' follows the OS setting live.

const KEY = 'pc-theme'
const media = () => window.matchMedia('(prefers-color-scheme: dark)')

export function getTheme() {
  return localStorage.getItem(KEY) || 'system'
}

export function resolveDark(theme = getTheme()) {
  if (theme === 'dark') return true
  if (theme === 'light') return false
  return media().matches
}

function apply(theme) {
  document.documentElement.classList.toggle('dark', resolveDark(theme))
}

export function setTheme(theme) {
  localStorage.setItem(KEY, theme)
  apply(theme)
}

// Call once at startup. Applies the saved theme and keeps 'system' in sync with
// OS changes.
export function initTheme() {
  apply(getTheme())
  media().addEventListener('change', () => {
    if (getTheme() === 'system') apply('system')
  })
}
