// Pure cricket stat calculations. These functions receive an array of match
// records that has ALREADY been filtered to the desired season — they know
// nothing about seasons. See CLAUDE.md for the authoritative formulas.

import { REAL_DISMISSALS, EM_DASH } from '../constants.js'
import { oversToBalls, oversToDecimal, ballsToOvers } from './overs.js'

// Format a number to at most `dp` decimals, trimming trailing zeros.
function fmt(n, dp = 2) {
  return Number(n.toFixed(dp)).toString()
}

const isRealDismissal = (howOut) => REAL_DISMISSALS.includes(howOut)

// A match counts as a batting innings if the player batted and it wasn't "dnb".
function battingInnings(matches) {
  return matches.filter((m) => m.batting?.didBat && m.batting.howOut !== 'dnb')
}

export function battingStats(matches) {
  const innings = battingInnings(matches)

  const totalRuns = innings.reduce((sum, m) => sum + (m.batting.runs || 0), 0)
  const totalBalls = innings.reduce((sum, m) => sum + (m.batting.balls || 0), 0)
  const timesOut = innings.filter((m) => isRealDismissal(m.batting.howOut)).length

  const fours = innings.reduce((sum, m) => sum + (m.batting.fours || 0), 0)
  const sixes = innings.reduce((sum, m) => sum + (m.batting.sixes || 0), 0)

  const fifties = innings.filter(
    (m) => m.batting.runs >= 50 && m.batting.runs < 100,
  ).length
  const hundreds = innings.filter((m) => m.batting.runs >= 100).length

  // Highest score, remembering whether the best knock was a not-out.
  let highest = 0
  let highestNotOut = false
  for (const m of innings) {
    if (m.batting.runs > highest) {
      highest = m.batting.runs
      highestNotOut = !isRealDismissal(m.batting.howOut)
    }
  }

  // Average: runs / dismissals. Not-outs add runs but not dismissals.
  const average = timesOut > 0 ? fmt(totalRuns / timesOut) : EM_DASH
  // Strike rate: not-out balls and runs still count.
  const strikeRate = totalBalls > 0 ? fmt((totalRuns / totalBalls) * 100, 1) : EM_DASH

  return {
    inningsCount: innings.length,
    totalRuns,
    totalBalls,
    timesOut,
    average,
    strikeRate,
    highest: innings.length ? `${highest}${highestNotOut ? '*' : ''}` : EM_DASH,
    highestRuns: highest,
    fifties,
    hundreds,
    fours,
    sixes,
  }
}

function bowlingSpells(matches) {
  return matches.filter((m) => m.bowling?.didBowl)
}

export function bowlingStats(matches) {
  const spells = bowlingSpells(matches)

  const totalBalls = spells.reduce((s, m) => s + oversToBalls(m.bowling.overs), 0)
  const runsConceded = spells.reduce((s, m) => s + (m.bowling.runsConceded || 0), 0)
  const wickets = spells.reduce((s, m) => s + (m.bowling.wickets || 0), 0)
  const maidens = spells.reduce((s, m) => s + (m.bowling.maidens || 0), 0)

  const decimalOvers = totalBalls / 6
  const average = wickets > 0 ? fmt(runsConceded / wickets) : EM_DASH
  const economy = totalBalls > 0 ? fmt(runsConceded / decimalOvers) : EM_DASH

  // Best figures: most wickets, fewest runs as tiebreaker.
  let best = null
  for (const m of spells) {
    const cand = { wickets: m.bowling.wickets || 0, runs: m.bowling.runsConceded || 0 }
    if (
      !best ||
      cand.wickets > best.wickets ||
      (cand.wickets === best.wickets && cand.runs < best.runs)
    ) {
      best = cand
    }
  }

  return {
    spellsCount: spells.length,
    oversBowled: ballsToOvers(totalBalls),
    runsConceded,
    wickets,
    maidens,
    average,
    economy,
    best: best ? `${best.wickets}/${best.runs}` : EM_DASH,
  }
}

export function fieldingStats(matches) {
  const catches = matches.reduce((s, m) => s + (m.fielding?.catches || 0), 0)
  const runOuts = matches.reduce((s, m) => s + (m.fielding?.runOuts || 0), 0)
  const stumpings = matches.reduce((s, m) => s + (m.fielding?.stumpings || 0), 0)
  return {
    catches,
    runOuts,
    stumpings,
    dismissals: catches + runOuts + stumpings,
  }
}

export function seasonSummary(matches) {
  return {
    matchesPlayed: matches.length,
    batting: battingStats(matches),
    bowling: bowlingStats(matches),
    fielding: fieldingStats(matches),
  }
}

// Personal bests across the given (already season-filtered) matches: the top
// knock, best bowling spell, and most sixes in an innings. Any of these may be
// null if the player has no qualifying performance.
export function highlights(matches) {
  let bestKnock = null
  let bestBowling = null
  let mostSixes = null

  for (const m of matches) {
    if (m.batting?.didBat && m.batting.howOut !== 'dnb') {
      const notOut = !REAL_DISMISSALS.includes(m.batting.howOut)
      const runs = m.batting.runs || 0
      if (!bestKnock || runs > bestKnock.runs) {
        bestKnock = { runs, notOut, opposition: m.opposition, date: m.date }
      }
      const sixes = m.batting.sixes || 0
      if (sixes > 0 && (!mostSixes || sixes > mostSixes.sixes)) {
        mostSixes = { sixes, opposition: m.opposition, date: m.date }
      }
    }
    if (m.bowling?.didBowl) {
      const wickets = m.bowling.wickets || 0
      const runs = m.bowling.runsConceded || 0
      if (
        !bestBowling ||
        wickets > bestBowling.wickets ||
        (wickets === bestBowling.wickets && runs < bestBowling.runs)
      ) {
        bestBowling = { wickets, runs, opposition: m.opposition, date: m.date }
      }
    }
  }

  return { bestKnock, bestBowling, mostSixes }
}

// Per-format breakdown: how the player performs in each format they've played.
// Returns one row per format present in `matches`, most-played first.
export function statsByFormat(matches) {
  const groups = new Map()
  for (const m of matches) {
    if (!groups.has(m.format)) groups.set(m.format, [])
    groups.get(m.format).push(m)
  }
  return [...groups.entries()]
    .map(([format, ms]) => {
      const bat = battingStats(ms)
      const bowl = bowlingStats(ms)
      return {
        format,
        matches: ms.length,
        runs: bat.totalRuns,
        battingAverage: bat.average,
        wickets: bowl.wickets,
        bowlingAverage: bowl.average,
      }
    })
    .sort((a, b) => b.matches - a.matches || b.runs - a.runs)
}

// Per-season breakdown for comparing seasons side by side. One row per season,
// most recent first.
export function statsBySeason(matches) {
  return listSeasons(matches).map((season) => {
    const ms = matches.filter((m) => m.season === season)
    const bat = battingStats(ms)
    const bowl = bowlingStats(ms)
    return {
      season,
      matches: ms.length,
      runs: bat.totalRuns,
      battingAverage: bat.average,
      highest: bat.highest,
      wickets: bowl.wickets,
      best: bowl.best,
    }
  })
}

// Unique season labels found across matches, most recent first (by latest match
// date within each season).
export function listSeasons(matches) {
  const latest = new Map()
  for (const m of matches) {
    const cur = latest.get(m.season)
    if (!cur || m.date > cur) latest.set(m.season, m.date)
  }
  return [...latest.entries()]
    .sort((a, b) => (a[1] < b[1] ? 1 : -1))
    .map(([season]) => season)
}

// Re-export so the helper lives next to oversToDecimal users if needed.
export { oversToDecimal }
