import { Link } from 'react-router-dom'
import { ballsToOvers, oversToBalls } from '../lib/overs.js'

// One row in a match list. Shows opposition, date, and a compact line of the
// player's batting / bowling contribution for that match. `readOnly` renders a
// plain row (no navigation) — used for other players' matches.
export default function MatchListItem({ match, readOnly = false }) {
  const { batting, bowling } = match

  const battedLine = batting.didBat
    ? `${batting.runs}${isNotOut(batting.howOut) ? '*' : ''} (${batting.balls})`
    : null
  const bowledLine = bowling.didBowl
    ? `${bowling.wickets}/${bowling.runsConceded} (${ballsToOvers(
        oversToBalls(bowling.overs),
      )})`
    : null

  const className =
    'flex items-center justify-between rounded-xl bg-surface px-4 py-3 shadow-sm ring-1 ring-line/60 transition active:scale-[0.99]'

  const inner = (
    <>
      <div className="min-w-0">
        <p className="truncate font-semibold text-content">
          {match.opposition || 'Unknown opposition'}
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {formatDate(match.date)} · {match.format}
          {match.venue ? ` · ${match.venue}` : ''}
        </p>
      </div>
      <div className="ml-3 shrink-0 text-right">
        {battedLine && (
          <p className="text-sm font-semibold tabular-nums text-content">
            {battedLine}
          </p>
        )}
        {bowledLine && (
          <p className="text-xs tabular-nums text-muted">{bowledLine}</p>
        )}
        {!battedLine && !bowledLine && (
          <p className="text-xs text-muted">Fielding only</p>
        )}
      </div>
    </>
  )

  if (readOnly) return <div className={className}>{inner}</div>
  return (
    <Link to={`/match/${match.id}`} className={className}>
      {inner}
    </Link>
  )
}

function isNotOut(howOut) {
  return howOut === 'notout'
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
