// A compact bar chart of runs per batting innings across the (already
// season-filtered) matches, oldest to newest. Pure CSS bars — no chart library,
// so it stays dependency-light and easy to port to a native shell later.
//
// `matches` arrives most-recent-first (see getAllMatches); we reverse to read
// left-to-right chronologically. Not-out innings are marked with a dot.

export default function RunsTrend({ matches }) {
  const innings = matches
    .filter((m) => m.batting?.didBat && m.batting.howOut !== 'dnb')
    .slice()
    .reverse()
    .map((m) => ({
      runs: m.batting.runs || 0,
      notOut: m.batting.howOut === 'notout',
      label: m.opposition || '—',
      date: m.date,
    }))

  // Need at least two innings for a trend to mean anything.
  if (innings.length < 2) return null

  const max = Math.max(...innings.map((i) => i.runs), 1)

  return (
    <section className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line/60">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          Runs per innings
        </h2>
        <span className="text-[11px] text-muted">
          {innings.length} innings
        </span>
      </div>

      <div className="flex h-28 items-end gap-1.5">
        {innings.map((inn, i) => {
          const heightPct = Math.max((inn.runs / max) * 100, 3)
          const isBest = inn.runs === max
          return (
            <div
              key={i}
              className="group flex h-full flex-1 flex-col items-center justify-end"
              title={`${inn.runs}${inn.notOut ? '*' : ''} vs ${inn.label}`}
            >
              <span className="mb-1 text-[10px] font-semibold tabular-nums text-muted opacity-0 transition group-hover:opacity-100">
                {inn.runs}
                {inn.notOut ? '*' : ''}
              </span>
              <div
                className={
                  'w-full rounded-t-md transition-all ' +
                  (isBest ? 'bg-accent' : 'bg-slate-300')
                }
                style={{ height: `${heightPct}%` }}
              />
            </div>
          )
        })}
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-muted">
        <span>Oldest</span>
        <span>Latest</span>
      </div>
    </section>
  )
}
