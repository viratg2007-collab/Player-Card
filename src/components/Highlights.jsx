import { highlights } from '../lib/stats.js'

// "Personal bests" card: top knock, best bowling, most sixes — with the
// opposition for colour. Renders nothing until there's at least one highlight.
export default function Highlights({ matches }) {
  const { bestKnock, bestBowling, mostSixes } = highlights(matches)
  if (!bestKnock && !bestBowling && !mostSixes) return null

  const items = []
  if (bestKnock) {
    items.push({
      value: `${bestKnock.runs}${bestKnock.notOut ? '*' : ''}`,
      label: 'Best knock',
      sub: bestKnock.opposition ? `vs ${bestKnock.opposition}` : null,
    })
  }
  if (bestBowling) {
    items.push({
      value: `${bestBowling.wickets}/${bestBowling.runs}`,
      label: 'Best bowling',
      sub: bestBowling.opposition ? `vs ${bestBowling.opposition}` : null,
    })
  }
  if (mostSixes) {
    items.push({
      value: mostSixes.sixes,
      label: 'Most sixes',
      sub: mostSixes.opposition ? `vs ${mostSixes.opposition}` : null,
    })
  }

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60">
      <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        Personal bests
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {items.map((it) => (
          <div key={it.label}>
            <p className="text-xl font-semibold tabular-nums text-accent">{it.value}</p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-600">{it.label}</p>
            {it.sub && <p className="text-[11px] leading-tight text-slate-400">{it.sub}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
