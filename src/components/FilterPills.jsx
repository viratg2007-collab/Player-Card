// Generic horizontal pill filter. `options` is a list of string values; `''`
// (the leading "all" pill) means no filter. Hidden when there's nothing to
// filter between.
export default function FilterPills({ options, value, onChange, allLabel = 'All' }) {
  if (options.length < 2) return null

  const items = ['', ...options]

  return (
    <div className="-mx-4 mb-3 overflow-x-auto px-4">
      <div className="flex gap-2">
        {items.map((opt) => {
          const active = opt === value
          return (
            <button
              key={opt || 'all'}
              type="button"
              onClick={() => onChange(opt)}
              className={
                'whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition ' +
                (active
                  ? 'bg-accent text-white'
                  : 'bg-surface text-muted ring-1 ring-line')
              }
            >
              {opt || allLabel}
            </button>
          )
        })}
      </div>
    </div>
  )
}
