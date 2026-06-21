import { Link } from 'react-router-dom'
import { useSeasonMatches } from '../hooks/useSeasonMatches.js'
import { seasonSummary } from '../lib/stats.js'
import { loadSampleData } from '../db/seed.js'
import SeasonSelect from '../components/SeasonSelect.jsx'
import StatCard from '../components/StatCard.jsx'
import RunsTrend from '../components/RunsTrend.jsx'
import MatchListItem from '../components/MatchListItem.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function Dashboard() {
  const { loading, matches, seasons, season, chooseSeason } = useSeasonMatches()

  if (loading) return <Loading />

  if (matches.length === 0 && seasons.length === 0) {
    return (
      <EmptyState
        title="No matches yet"
        subtitle="Log your first match to start building your season stats."
        cta={{ to: '/add', label: 'Add your first match' }}
        secondary={{
          label: 'Or load a sample season',
          onClick: async () => {
            await loadSampleData()
            window.location.reload()
          },
        }}
      />
    )
  }

  const s = seasonSummary(matches)
  const recent = matches.slice(0, 4)
  const seasonLabel = season || 'All seasons'

  return (
    <div>
      {/* Navy hero — headline figures at a glance */}
      <header className="mb-5 rounded-2xl bg-gradient-to-br from-ink to-ink-soft p-5 text-white shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-300">
          {seasonLabel}
        </p>
        <h1 className="mt-0.5 text-2xl font-bold">Season stats</h1>
        <div className="mt-4 flex divide-x divide-white/10">
          <HeroStat value={s.matchesPlayed} label="Matches" />
          <HeroStat value={s.batting.totalRuns} label="Runs" />
          <HeroStat value={s.bowling.wickets} label="Wickets" />
          <HeroStat value={s.fielding.dismissals} label="Fielding" />
        </div>
      </header>

      <SeasonSelect seasons={seasons} value={season} onChange={chooseSeason} />

      <div className="space-y-3">
        <StatCard
          title="Batting"
          accent
          stats={[
            { label: 'Runs', value: s.batting.totalRuns },
            { label: 'Average', value: s.batting.average },
            { label: 'Strike rate', value: s.batting.strikeRate },
            { label: 'Innings', value: s.batting.inningsCount },
            { label: 'High score', value: s.batting.highest },
            { label: '50s / 100s', value: `${s.batting.fifties}/${s.batting.hundreds}` },
          ]}
        />

        <RunsTrend matches={matches} />

        <StatCard
          title="Bowling"
          stats={[
            { label: 'Wickets', value: s.bowling.wickets },
            { label: 'Average', value: s.bowling.average },
            { label: 'Economy', value: s.bowling.economy },
            { label: 'Overs', value: s.bowling.oversBowled },
            { label: 'Best', value: s.bowling.best },
            { label: 'Maidens', value: s.bowling.maidens },
          ]}
        />

        <StatCard
          title="Fielding"
          stats={[
            { label: 'Catches', value: s.fielding.catches },
            { label: 'Run-outs', value: s.fielding.runOuts },
            { label: 'Stumpings', value: s.fielding.stumpings },
          ]}
        />
      </div>

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Recent matches
          </h2>
          <Link to="/history" className="text-sm font-medium text-accent">
            See all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="rounded-xl bg-white px-4 py-3 text-sm text-slate-500 ring-1 ring-slate-200/60">
            No matches in this season yet.
          </p>
        ) : (
          <div className="space-y-2">
            {recent.map((m) => (
              <MatchListItem key={m.id} match={m} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function HeroStat({ value, label }) {
  return (
    <div className="flex-1 px-3 first:pl-0 last:pr-0">
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="mt-0.5 text-[11px] text-slate-300">{label}</p>
    </div>
  )
}

function Loading() {
  return (
    <div className="space-y-3">
      <div className="h-32 animate-pulse rounded-2xl bg-white/60" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/60" />
      ))}
    </div>
  )
}
