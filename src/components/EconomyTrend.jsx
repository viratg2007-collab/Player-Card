import { oversToDecimal, oversToBalls } from '../lib/overs.js'

// Bar chart of bowling economy per spell across the (already-filtered) matches,
// oldest to newest. Lower is better, so the best (lowest) economy is
// highlighted. Mirrors RunsTrend; pure CSS bars, no chart library.
export default function EconomyTrend({ matches }) {
  const spells = matches
    .filter((m) => m.bowling?.didBowl && oversToBalls(m.bowling.overs) > 0)
    .slice()
    .reverse()
    .map((m) => ({
      econ: m.bowling.runsConceded / oversToDecimal(m.bowling.overs),
      opposition: m.opposition || '—',
    }))

  if (spells.length < 2) return null

  const max = Math.max(...spells.map((s) => s.econ), 1)
  const best = Math.min(...spells.map((s) => s.econ))

  return (
    <section className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line/60">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          Economy per spell
        </h2>
        <span className="text-[11px] text-muted">{spells.length} spells</span>
      </div>

      <div className="flex h-28 items-end gap-1.5">
        {spells.map((sp, i) => {
          const heightPct = Math.max((sp.econ / max) * 100, 3)
          const isBest = sp.econ === best
          return (
            <div
              key={i}
              className="group flex h-full flex-1 flex-col items-center justify-end"
              title={`${sp.econ.toFixed(2)} vs ${sp.opposition}`}
            >
              <span className="mb-1 text-[10px] font-semibold tabular-nums text-muted opacity-0 transition group-hover:opacity-100">
                {sp.econ.toFixed(1)}
              </span>
              <div
                className={'w-full rounded-t-md transition-all ' + (isBest ? 'bg-accent' : 'bg-slate-300')}
                style={{ height: `${heightPct}%` }}
              />
            </div>
          )
        })}
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-muted">
        <span>Oldest</span>
        <span>Lower is better</span>
      </div>
    </section>
  )
}
