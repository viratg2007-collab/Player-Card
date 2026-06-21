import { Outlet } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'

// App shell: a centered, phone-width column with a fixed bottom tab bar.
export default function App() {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col bg-slate-100">
      <main className="flex-1 px-4 pb-28 pt-6">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
