import { useSeasonMatches } from '../hooks/useSeasonMatches.js'
import SeasonSelect from '../components/SeasonSelect.jsx'
import MatchListItem from '../components/MatchListItem.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function MatchHistory() {
  const { loading, matches, seasons, season, chooseSeason } = useSeasonMatches()

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

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-ink">Matches</h1>
        <p className="text-sm text-slate-500">
          {matches.length} {matches.length === 1 ? 'match' : 'matches'}
        </p>
      </header>

      <SeasonSelect seasons={seasons} value={season} onChange={chooseSeason} />

      {matches.length === 0 ? (
        <p className="rounded-xl bg-white px-4 py-3 text-sm text-slate-500 ring-1 ring-slate-200/60">
          No matches in this season.
        </p>
      ) : (
        <div className="space-y-2">
          {matches.map((m) => (
            <MatchListItem key={m.id} match={m} />
          ))}
        </div>
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
