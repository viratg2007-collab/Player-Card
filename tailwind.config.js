/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Navy / slate product palette
        ink: {
          DEFAULT: '#0f172a', // slate-900
          soft: '#1e293b', // slate-800
        },
        accent: {
          DEFAULT: '#4f46e5', // indigo-600
          soft: '#6366f1', // indigo-500
        },
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
