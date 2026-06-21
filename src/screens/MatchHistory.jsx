import { useEffect, useMemo, useState } from 'react'
import { useSeasonMatches } from '../hooks/useSeasonMatches.js'
import { deleteMatch } from '../db/matches.js'
import SeasonSelect from '../components/SeasonSelect.jsx'
import FilterPills from '../components/FilterPills.jsx'
import SwipeableMatchRow from '../components/SwipeableMatchRow.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function MatchHistory() {
  const { loading, matches, seasons, season, chooseSeason, reload } = useSeasonMatches()
  const [format, setFormat] = useState('')

  async function handleDelete(matchId) {
    await deleteMatch(matchId)
    await reload()
  }

  // Formats present in the current season, most-played first.
  const formats = useMemo(() => {
    const counts = new Map()
    for (const m of matches) counts.set(m.format, (counts.get(m.format) || 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([f]) => f)
  }, [matches])

  // Drop the format filter if it's no longer available (e.g. season changed).
  useEffect(() => {
    if (format && !formats.includes(format)) setFormat('')
  }, [formats, format])

  if (loading) return <Loading />

  if (seasons.length === 0) {
    return (
      <EmptyState
        title="No matches yet"
        subtitle="Your logged matches will appear here."
        cta={{ to: '/add', label: 'Add a match' }}
      />
    )
  }

  const visible = format ? matches.filter((m) => m.format === format) : matches

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-ink">Matches</h1>
        <p className="text-sm text-slate-500">
          {visible.length} {visible.length === 1 ? 'match' : 'matches'}
          {format ? ` · ${format}` : ''}
        </p>
      </header>

      <SeasonSelect seasons={seasons} value={season} onChange={chooseSeason} />
      <FilterPills options={formats} value={format} onChange={setFormat} allLabel="All formats" />

      {visible.length === 0 ? (
        <p className="rounded-xl bg-white px-4 py-3 text-sm text-slate-500 ring-1 ring-slate-200/60">
          No matches to show.
        </p>
      ) : (
        <>
          <div className="space-y-2">
            {visible.map((m) => (
              <SwipeableMatchRow key={m.id} match={m} onDelete={handleDelete} />
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">
            Swipe a match left to delete
          </p>
        </>
      )}
    </div>
  )
}

function Loading() {
  return (
    <div className="space-y-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-white/60" />
      ))}
    </div>
  )
}
