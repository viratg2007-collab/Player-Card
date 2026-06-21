import { Link } from 'react-router-dom'

export default function EmptyState({ title, subtitle, cta, secondary }) {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface shadow-sm ring-1 ring-line/60">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-content">{title}</h2>
      {subtitle && <p className="mt-1 max-w-xs text-sm text-muted">{subtitle}</p>}
      {cta && (
        <Link
          to={cta.to}
          className="mt-5 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm active:scale-[0.99]"
        >
          {cta.label}
        </Link>
      )}
      {secondary && (
        <button
          type="button"
          onClick={secondary.onClick}
          className="mt-3 text-sm font-medium text-muted underline-offset-2 hover:underline"
        >
          {secondary.label}
        </button>
      )}
    </div>
  )
}
