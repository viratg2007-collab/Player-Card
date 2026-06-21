// A pill-style season filter. `seasons` is the list of available labels; the
// special value '' means "All seasons".
export default function SeasonSelect({ seasons, value, onChange }) {
  if (seasons.length === 0) return null

  const options = ['', ...seasons]

  return (
    <div className="-mx-4 mb-4 overflow-x-auto px-4">
      <div className="flex gap-2">
        {options.map((s) => {
          const active = s === value
          return (
            <button
              key={s || 'all'}
              type="button"
              onClick={() => onChange(s)}
              className={
                'whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition ' +
                (active
                  ? 'bg-ink text-white'
                  : 'bg-surface text-muted ring-1 ring-line')
              }
            >
              {s || 'All seasons'}
            </button>
          )
        })}
      </div>
    </div>
  )
}
