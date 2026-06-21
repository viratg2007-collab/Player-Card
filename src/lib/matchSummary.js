// Builds a shareable plain-text summary of a single match performance.
// Pure and string-only so it's easy to unit test and reuse.

import { dismissalLabel } from '../constants.js'
import { ballsToOvers, oversToBalls, oversToDecimal } from './overs.js'

function formatLabel(m) {
  return m.format === 'Other' && m.customOvers ? `${m.customOvers}-over` : m.format
}

function prettyDate(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function matchSummary(match, playerName = '') {
  const { batting, bowling, fielding } = match
  const lines = []

  const who = playerName ? `${playerName} — ` : ''
  lines.push(
    `${who}vs ${match.opposition || 'Unknown'} (${formatLabel(match)}, ${prettyDate(match.date)})`,
  )

  if (batting?.didBat) {
    const notOut = batting.howOut === 'notout'
    const sr =
      batting.balls > 0 ? ((batting.runs / batting.balls) * 100).toFixed(1) : '—'
    lines.push(
      `Batting: ${batting.runs}${notOut ? '*' : ''} (${batting.balls}b, SR ${sr})` +
        (notOut ? '' : `, ${dismissalLabel(batting.howOut).toLowerCase()}`),
    )
  }

  if (bowling?.didBowl) {
    const overs = ballsToOvers(oversToBalls(bowling.overs))
    const econ =
      oversToBalls(bowling.overs) > 0
        ? (bowling.runsConceded / oversToDecimal(bowling.overs)).toFixed(2)
        : '—'
    lines.push(
      `Bowling: ${bowling.wickets}/${bowling.runsConceded} (${overs} ov, econ ${econ})`,
    )
  }

  const fieldTotal =
    (fielding?.catches || 0) + (fielding?.runOuts || 0) + (fielding?.stumpings || 0)
  if (fieldTotal > 0) {
    const parts = []
    if (fielding.catches) parts.push(`${fielding.catches} ct`)
    if (fielding.runOuts) parts.push(`${fielding.runOuts} ro`)
    if (fielding.stumpings) parts.push(`${fielding.stumpings} st`)
    lines.push(`Fielding: ${parts.join(', ')}`)
  }

  return lines.join('\n')
}
