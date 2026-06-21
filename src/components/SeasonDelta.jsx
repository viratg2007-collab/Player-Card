import { seasonSummary } from '../lib/stats.js'
import { EM_DASH } from '../constants.js'

// Compares the selected season to the chronologically previous one. Hidden when
// "All seasons" is active or there's no earlier season to compare against.
// Always compares full seasons (ignores any format filter on the dashboard).
export default function SeasonDelta({ allMatches, season, seasons }) {
  const idx = seasons.indexOf(season)
  const previous = season && idx >= 0 ? seasons[idx + 1] : null
  if (!previous) return null

  const cur = seasonSummary(allMatches.filter((m) => m.season === season))
  const prev = seasonSummary(allMatches.filter((m) => m.season === previous))

  const items = [
    { label: 'Runs', value: cur.batting.totalRuns, delta: cur.batting.totalRuns - prev.batting.totalRuns },
    {
      label: 'Bat avg',
      value: cur.batting.average,
      delta: numericDelta(cur.batting.average, prev.batting.average),
    },
    { label: 'Wickets', value: cur.bowling.wickets, delta: cur.bowling.wickets - prev.bowling.wickets },
  ]

  return (
    <section className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line/60">
      <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        vs {previous}
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {items.map((it) => (
          <div key={it.label}>
            <p className="text-xl font-semibold tabular-nums text-content">{it.value}</p>
            <p className="text-[11px] font-medium text-muted">{it.label}</p>
            <DeltaTag delta={it.delta} />
          </div>
        ))}
      </div>
    </section>
  )
}

function numericDelta(a, b) {
  const na = Number(a)
  const nb = Number(b)
  if (Number.isNaN(na) || Number.isNaN(nb)) return null
  return Math.round((na - nb) * 10) / 10
}

function DeltaTag({ delta }) {
  if (delta == null || delta === 0) {
    return <p className="mt-0.5 text-[11px] text-muted">{delta === 0 ? 'no change' : EM_DASH}</p>
  }
  const up = delta > 0
  return (
    <p className={'mt-0.5 text-[11px] font-semibold ' + (up ? 'text-accent' : 'text-muted')}>
      {up ? '▲' : '▼'} {Math.abs(delta)}
    </p>
  )
}
