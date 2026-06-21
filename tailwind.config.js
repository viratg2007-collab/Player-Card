/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Navy / slate product palette. `ink` and `accent` are fixed brand
        // colors (the navy hero looks good in both themes). The semantic tokens
        // below are backed by CSS variables and flip in dark mode — see
        // index.css.
        ink: {
          DEFAULT: '#0f172a', // slate-900
          soft: '#1e293b', // slate-800
        },
        accent: {
          DEFAULT: '#4f46e5', // indigo-600
          soft: '#6366f1', // indigo-500
        },
        appbg: 'rgb(var(--appbg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        surface2: 'rgb(var(--surface2) / <alpha-value>)',
        content: 'rgb(var(--content) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
