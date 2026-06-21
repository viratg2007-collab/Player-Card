import { statsByFormat } from '../lib/stats.js'

// A compact table showing the player's key numbers per format (T20, 50-over, …).
// Hidden until there are at least two formats to compare — with one format it
// just repeats the headline stats.
export default function FormatBreakdown({ matches }) {
  const rows = statsByFormat(matches)
  if (rows.length < 2) return null

  return (
    <section className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line/60">
      <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        By format
      </h2>

      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 gap-y-2 text-sm">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
          Format
        </span>
        <span className="text-right text-[11px] font-medium uppercase tracking-wide text-muted">
          M
        </span>
        <span className="text-right text-[11px] font-medium uppercase tracking-wide text-muted">
          Runs
        </span>
        <span className="text-right text-[11px] font-medium uppercase tracking-wide text-muted">
          Wkts
        </span>

        {rows.map((r) => (
          <FormatRow key={r.format} row={r} />
        ))}
      </div>
    </section>
  )
}

function FormatRow({ row }) {
  return (
    <>
      <span className="truncate font-medium text-content">{row.format}</span>
      <span className="text-right tabular-nums text-muted">{row.matches}</span>
      <span className="text-right font-semibold tabular-nums text-content">{row.runs}</span>
      <span className="text-right font-semibold tabular-nums text-content">{row.wickets}</span>
    </>
  )
}
