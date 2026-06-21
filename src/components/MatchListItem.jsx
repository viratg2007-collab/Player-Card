import { Link } from 'react-router-dom'
import { ballsToOvers, oversToBalls } from '../lib/overs.js'

// One row in a match list. Shows opposition, date, and a compact line of the
// player's batting / bowling contribution for that match.
export default function MatchListItem({ match }) {
  const { batting, bowling } = match

  const battedLine = batting.didBat
    ? `${batting.runs}${isNotOut(batting.howOut) ? '*' : ''} (${batting.balls})`
    : null
  const bowledLine = bowling.didBowl
    ? `${bowling.wickets}/${bowling.runsConceded} (${ballsToOvers(
        oversToBalls(bowling.overs),
      )})`
    : null

  return (
    <Link
      to={`/match/${match.id}`}
      className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/60 transition active:scale-[0.99]"
    >
      <div className="min-w-0">
        <p className="truncate font-semibold text-ink">
          {match.opposition || 'Unknown opposition'}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {formatDate(match.date)} · {match.format}
          {match.venue ? ` · ${match.venue}` : ''}
        </p>
      </div>
      <div className="ml-3 shrink-0 text-right">
        {battedLine && (
          <p className="text-sm font-semibold tabular-nums text-ink">
            {battedLine}
          </p>
        )}
        {bowledLine && (
          <p className="text-xs tabular-nums text-slate-500">{bowledLine}</p>
        )}
        {!battedLine && !bowledLine && (
          <p className="text-xs text-slate-400">Fielding only</p>
        )}
      </div>
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
