import React from 'react'
import ReactDOM from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
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
