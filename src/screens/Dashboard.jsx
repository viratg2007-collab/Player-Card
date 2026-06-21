import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSeasonMatches } from '../hooks/useSeasonMatches.js'
import { seasonSummary } from '../lib/stats.js'
import { loadSampleData } from '../db/seed.js'
import SeasonSelect from '../components/SeasonSelect.jsx'
import FilterPills from '../components/FilterPills.jsx'
import StatCard from '../components/StatCard.jsx'
import RunsTrend from '../components/RunsTrend.jsx'
import FormatBreakdown from '../components/FormatBreakdown.jsx'
import Highlights from '../components/Highlights.jsx'
import MatchListItem from '../components/MatchListItem.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function Dashboard() {
  const { loading, matches, seasons, season, chooseSeason } = useSeasonMatches()
  const [format, setFormat] = useState('')

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

  const filtered = format ? matches.filter((m) => m.format === format) : matches
  const s = seasonSummary(filtered)
  const recent = filtered.slice(0, 4)
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
      <FilterPills options={formats} value={format} onChange={setFormat} allLabel="All formats" />

      <div className="space-y-3">
        <Highlights matches={filtered} />

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

        <RunsTrend matches={filtered} />

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

        <FormatBreakdown matches={filtered} />
      </div>

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Recent matches
          </h2>
          <Link to="/history" className="text-sm font-medium text-accent">
            See all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="rounded-xl bg-surface px-4 py-3 text-sm text-muted ring-1 ring-line/60">
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
      <div className="h-32 animate-pulse rounded-2xl bg-surface/60" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-surface/60" />
      ))}
    </div>
  )
}
