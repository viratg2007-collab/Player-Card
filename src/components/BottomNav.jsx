import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Stats', end: true, icon: BarsIcon },
  { to: '/history', label: 'Matches', end: false, icon: ListIcon },
  { to: '/add', label: 'Add', end: false, icon: PlusIcon, primary: true },
  { to: '/friends', label: 'Friends', end: false, icon: FriendsIcon },
  { to: '/profile', label: 'Profile', end: false, icon: UserIcon },
]

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ to, label, end, icon: Icon, primary }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                primary
                  ? 'text-accent'
                  : isActive
                    ? 'text-accent'
                    : 'text-muted hover:text-muted',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={
                    primary
                      ? 'flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white shadow-sm'
                      : ''
                  }
                >
                  <Icon active={isActive} />
                </span>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function BarsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="6" y1="20" x2="6" y2="12" />
      <line x1="12" y1="20" x2="12" y2="6" />
      <line x1="18" y1="20" x2="18" y2="10" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="8" y1="7" x2="20" y2="7" />
      <line x1="8" y1="12" x2="20" y2="12" />
      <line x1="8" y1="17" x2="20" y2="17" />
      <circle cx="4" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="17" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="6" x2="12" y2="18" />
      <line x1="6" y1="12" x2="18" y2="12" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  )
}

function FriendsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="3.2" />
      <path d="M3 19c0-3 2.7-4.6 6-4.6s6 1.6 6 4.6" />
      <path d="M16 5.2a3 3 0 0 1 0 5.8" />
      <path d="M17.5 14.2c2.3.4 3.8 1.8 3.8 4.3" />
    </svg>
  )
}
