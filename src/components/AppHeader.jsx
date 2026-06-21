import Logo from './Logo.jsx'

// Slim branded app bar shown at the top of every screen. Gives the app a
// consistent product identity above the per-screen titles.
export default function AppHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div
        className="mx-auto flex max-w-md items-center gap-2 px-4 py-3"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-white">
          <Logo size={17} />
        </span>
        <span className="text-base font-bold tracking-tight text-ink">
          Player Card
        </span>
      </div>
    </header>
  )
}
