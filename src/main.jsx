import React from 'react'
import ReactDOM from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import { initTheme } from './lib/theme.js'
import App from './App.jsx'

// Apply the saved theme before first paint to avoid a flash.
initTheme()

// Register the offline service worker in production builds.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
import Dashboard from './screens/Dashboard.jsx'
import MatchHistory from './screens/MatchHistory.jsx'
import MatchForm from './screens/MatchForm.jsx'
import MatchDetail from './screens/MatchDetail.jsx'
import Profile from './screens/Profile.jsx'

// HashRouter keeps deep links working when this is served as a static file
// (and later wrapped in a native shell) without server-side route config.
const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'history', element: <MatchHistory /> },
      { path: 'add', element: <MatchForm /> },
      { path: 'match/:id', element: <MatchDetail /> },
      { path: 'match/:id/edit', element: <MatchForm /> },
      { path: 'profile', element: <Profile /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
