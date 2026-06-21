import { Outlet } from 'react-router-dom'
import AppHeader from './components/AppHeader.jsx'
import BottomNav from './components/BottomNav.jsx'

// App shell: a centered, phone-width column with a sticky branded header and a
// fixed bottom tab bar.
export default function App() {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col bg-slate-100">
      <AppHeader />
      <main className="flex-1 px-4 pb-28 pt-5">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
