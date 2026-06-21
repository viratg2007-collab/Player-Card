import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getMatch, getAllMatches, getProfile } from '../db/matches.js'
import { dismissalLabel, EM_DASH } from '../constants.js'
import { ballsToOvers, oversToBalls, oversToDecimal } from '../lib/overs.js'
import { statsByFormat } from '../lib/stats.js'
import { matchSummary } from '../lib/matchSummary.js'

// Read-only view of a single match, reached by tapping a match in a list.
// Editing is one tap away via the Edit button.
export default function MatchDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [match, setMatch] = useState(null)
  const [missing, setMissing] = useState(false)
  const [allMatches, setAllMatches] = useState([])
  const [playerName, setPlayerName] = useState('')
  const [shareNote, setShareNote] = useState('')

  useEffect(() => {
    let active = true
    getMatch(id).then((m) => {
      if (!active) return
      if (m) setMatch(m)
      else setMissing(true)
    })
    getAllMatches().then((all) => active && setAllMatches(all))
    getProfile().then((p) => active && setPlayerName(p.name))
    return () => {
      active = false
    }
  }, [id])

  async function handleShare() {
    if (!match) return
    const text = matchSummary(match, playerName)
    try {
      if (navigator.share) {
        await navigator.share({ text })
        return
      }
      await navigator.clipboard.writeText(text)
      setShareNote('Copied to clipboard')
      setTimeout(() => setShareNote(''), 2000)
    } catch {
      // Share sheet dismissed — nothing to do.
    }
  }

  if (missing) {
    return (
      <div className="mt-16 text-center">
        <p className="text-content">That match could not be found.</p>
        <Link to="/history" className="mt-3 inline-block text-sm font-medium text-accent">
          Back to matches
        </Link>
      </div>
    )
  }

  if (!match) return <div className="h-64 animate-pulse rounded-2xl bg-surface/60" />

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

  // How the player has done across all matches in this format (context).
  const formatRow = statsByFormat(allMatches).find((r) => r.format === match.format)
  const showContext = formatRow && formatRow.matches >= 2

  return (
    <div>
      <header className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-muted"
        >
          ‹ Back
        </button>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleShare}
            className="text-sm font-semibold text-muted"
          >
            Share
          </button>
          <Link
            to={`/match/${id}/edit`}
            className="text-sm font-semibold text-accent"
          >
            Edit
          </Link>
        </div>
      </header>

      <div className="mb-5">
        <h1 className="text-2xl font-bold text-content">
          {match.opposition || 'Unknown opposition'}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {formatDate(match.date)} · {formatLabel(match)}
          {match.venue ? ` · ${match.venue}` : ''}
        </p>
        <span className="mt-2 inline-block rounded-full bg-surface2 px-2.5 py-0.5 text-xs font-medium text-muted">
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

        {/* Per-format context — how this match sits within the player's record */}
        {showContext && (
          <DetailCard title={`Your ${match.format} record`}>
            <Rows
              rows={[
                ['Matches', formatRow.matches],
                ['Runs', formatRow.runs],
                ['Batting avg', formatRow.battingAverage],
                ['Wickets', formatRow.wickets],
                ['Bowling avg', formatRow.bowlingAverage],
              ]}
            />
          </DetailCard>
        )}
      </div>

      {shareNote && (
        <p className="mt-4 text-center text-sm text-muted">{shareNote}</p>
      )}

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
    <section className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line/60">
      <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
        <span className={'h-2.5 w-2.5 rounded-full ' + (accent ? 'bg-accent' : 'bg-slate-300')} />
        {title}
      </h2>
      {children}
    </section>
  )
}

function Rows({ rows }) {
  return (
    <dl className="divide-y divide-line">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between py-2">
          <dt className="text-sm text-muted">{label}</dt>
          <dd className="text-sm font-semibold tabular-nums text-content">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function Muted({ children }) {
  return <p className="text-sm text-muted">{children}</p>
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
