import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getMatch } from '../db/matches.js'
import { dismissalLabel, EM_DASH } from '../constants.js'
import { ballsToOvers, oversToBalls, oversToDecimal } from '../lib/overs.js'

// Read-only view of a single match, reached by tapping a match in a list.
// Editing is one tap away via the Edit button.
export default function MatchDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [match, setMatch] = useState(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let active = true
    getMatch(id).then((m) => {
      if (!active) return
      if (m) setMatch(m)
      else setMissing(true)
    })
    return () => {
      active = false
    }
  }, [id])

  if (missing) {
    return (
      <div className="mt-16 text-center">
        <p className="text-ink">That match could not be found.</p>
        <Link to="/history" className="mt-3 inline-block text-sm font-medium text-accent">
          Back to matches
        </Link>
      </div>
    )
  }

  if (!match) return <div className="h-64 animate-pulse rounded-2xl bg-white/60" />

  const { batting, bowling, fielding } = match
  const notOut = batting.howOut === 'notout'
  const sr =
    batting.didBat && batting.balls > 0
      ? ((batting.runs / batting.balls) * 100).toFixed(1)
      : EM_DASH
  const econ =
    bowling.didBowl && oversToBalls(bowling.overs) > 0
      ? (bowling.runsConceded / oversToDecimal(bowling.overs)).toFixed(2)
      : EM_DASH
  const fieldingTotal =
    (fielding.catches || 0) + (fielding.runOuts || 0) + (fielding.stumpings || 0)

  return (
    <div>
      <header className="mb-4 flex items-start justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-slate-500"
        >
          ‹ Back
        </button>
        <Link
          to={`/match/${id}/edit`}
          className="text-sm font-semibold text-accent"
        >
          Edit
        </Link>
      </header>

      <div className="mb-5">
        <h1 className="text-2xl font-bold text-ink">
          {match.opposition || 'Unknown opposition'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {formatDate(match.date)} · {formatLabel(match)}
          {match.venue ? ` · ${match.venue}` : ''}
        </p>
        <span className="mt-2 inline-block rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          {match.season}
        </span>
      </div>

      <div className="space-y-3">
        {/* Batting */}
        <DetailCard title="Batting" accent>
          {batting.didBat ? (
            <Rows
              rows={[
                ['Score', `${batting.runs}${notOut ? '*' : ''}`],
                ['Balls', batting.balls],
                ['How out', dismissalLabel(batting.howOut)],
                ['Strike rate', sr],
                ['Fours / Sixes', `${batting.fours} / ${batting.sixes}`],
              ]}
            />
          ) : (
            <Muted>Did not bat</Muted>
          )}
        </DetailCard>

        {/* Bowling */}
        <DetailCard title="Bowling">
          {bowling.didBowl ? (
            <Rows
              rows={[
                ['Figures', `${bowling.wickets}/${bowling.runsConceded}`],
                ['Overs', ballsToOvers(oversToBalls(bowling.overs))],
                ['Maidens', bowling.maidens],
                ['Economy', econ],
              ]}
            />
          ) : (
            <Muted>Did not bowl</Muted>
          )}
        </DetailCard>

        {/* Fielding */}
        <DetailCard title="Fielding">
          {fieldingTotal > 0 ? (
            <Rows
              rows={[
                ['Catches', fielding.catches],
                ['Run-outs', fielding.runOuts],
                ['Stumpings', fielding.stumpings],
              ]}
            />
          ) : (
            <Muted>No fielding dismissals</Muted>
          )}
        </DetailCard>
      </div>

      <Link
        to={`/match/${id}/edit`}
        className="mt-6 block w-full rounded-xl bg-accent py-3 text-center text-base font-semibold text-white shadow-sm active:scale-[0.99]"
      >
        Edit match
      </Link>
    </div>
  )
}

function DetailCard({ title, accent = false, children }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60">
      <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <span className={'h-2.5 w-2.5 rounded-full ' + (accent ? 'bg-accent' : 'bg-slate-300')} />
        {title}
      </h2>
      {children}
    </section>
  )
}

function Rows({ rows }) {
  return (
    <dl className="divide-y divide-slate-100">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between py-2">
          <dt className="text-sm text-slate-500">{label}</dt>
          <dd className="text-sm font-semibold tabular-nums text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function Muted({ children }) {
  return <p className="text-sm text-slate-400">{children}</p>
}

function formatLabel(m) {
  return m.format === 'Other' && m.customOvers
    ? `${m.customOvers}-over`
    : m.format
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
