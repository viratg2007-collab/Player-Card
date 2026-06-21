import { statsBySeason } from '../lib/stats.js'

// Side-by-side comparison of every season's headline numbers. Takes ALL matches
// (not season-filtered) and is hidden until there are 2+ seasons to compare.
export default function SeasonComparison({ matches }) {
  const rows = statsBySeason(matches)
  if (rows.length < 2) return null

  return (
    <section className="overflow-x-auto rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line">
      <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        Season comparison
      </h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] uppercase tracking-wide text-muted">
            <th className="pb-2 text-left font-medium">Season</th>
            <th className="pb-2 text-right font-medium">M</th>
            <th className="pb-2 text-right font-medium">Runs</th>
            <th className="pb-2 text-right font-medium">Avg</th>
            <th className="pb-2 text-right font-medium">HS</th>
            <th className="pb-2 text-right font-medium">Wkts</th>
            <th className="pb-2 text-right font-medium">Best</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.season} className="border-t border-line">
              <td className="py-2 text-left font-medium text-content">{r.season}</td>
              <td className="py-2 text-right tabular-nums text-muted">{r.matches}</td>
              <td className="py-2 text-right font-semibold tabular-nums text-content">{r.runs}</td>
              <td className="py-2 text-right tabular-nums text-content">{r.battingAverage}</td>
              <td className="py-2 text-right tabular-nums text-content">{r.highest}</td>
              <td className="py-2 text-right font-semibold tabular-nums text-content">{r.wickets}</td>
              <td className="py-2 text-right tabular-nums text-content">{r.best}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
