import { describe, it, expect } from 'vitest'
import {
  battingStats,
  bowlingStats,
  fieldingStats,
  seasonSummary,
  listSeasons,
} from './stats.js'
import { EM_DASH } from '../constants.js'

// Helpers to build minimal match records for each discipline.
const bat = (b) => ({
  batting: { didBat: true, runs: 0, balls: 0, howOut: 'notout', fours: 0, sixes: 0, ...b },
})
const bowl = (b) => ({
  bowling: { didBowl: true, overs: 0, maidens: 0, runsConceded: 0, wickets: 0, ...b },
})
const field = (f) => ({ fielding: { catches: 0, runOuts: 0, stumpings: 0, ...f } })

describe('battingStats — the not-out case', () => {
  // 50* off 40 balls, then 30 bowled off 20 balls.
  const matches = [
    bat({ runs: 50, balls: 40, howOut: 'notout' }),
    bat({ runs: 30, balls: 20, howOut: 'bowled' }),
  ]
  const s = battingStats(matches)

  it('counts a not-out 50 toward total runs', () => {
    expect(s.totalRuns).toBe(80)
  })

  it('counts a not-out innings as an innings', () => {
    expect(s.inningsCount).toBe(2)
  })

  it('does NOT count a not-out as a dismissal', () => {
    expect(s.timesOut).toBe(1)
  })

  it('averages runs by dismissals, not innings (80/1 = 80)', () => {
    expect(s.average).toBe('80')
  })

  it('counts not-out balls and runs toward strike rate', () => {
    // 80 runs / 60 balls * 100 = 133.3
    expect(s.strikeRate).toBe('133.3')
  })

  it('counts a not-out 50 as a fifty', () => {
    expect(s.fifties).toBe(1)
    expect(s.hundreds).toBe(0)
  })

  it('marks a not-out high score with a star', () => {
    expect(s.highest).toBe('50*')
  })
})

describe('battingStats — edge cases', () => {
  it('shows — for average when never dismissed', () => {
    const s = battingStats([bat({ runs: 25, balls: 30, howOut: 'notout' })])
    expect(s.average).toBe(EM_DASH)
    expect(s.strikeRate).toBe('83.3')
  })

  it('shows — for strike rate and average with no innings', () => {
    const s = battingStats([])
    expect(s.strikeRate).toBe(EM_DASH)
    expect(s.average).toBe(EM_DASH)
    expect(s.highest).toBe(EM_DASH)
    expect(s.inningsCount).toBe(0)
  })

  it('excludes did-not-bat matches from innings', () => {
    const s = battingStats([
      bat({ runs: 40, balls: 30, howOut: 'caught' }),
      { batting: { didBat: false, howOut: 'dnb' } },
    ])
    expect(s.inningsCount).toBe(1)
    expect(s.timesOut).toBe(1)
  })

  it('counts hundreds and does not double-count as fifties', () => {
    const s = battingStats([bat({ runs: 120, balls: 90, howOut: 'lbw' })])
    expect(s.hundreds).toBe(1)
    expect(s.fifties).toBe(0)
  })

  it('an out high score has no star', () => {
    const s = battingStats([bat({ runs: 72, balls: 55, howOut: 'caught' })])
    expect(s.highest).toBe('72')
  })
})

describe('bowlingStats', () => {
  const matches = [
    bowl({ overs: 3.4, maidens: 1, runsConceded: 22, wickets: 4 }),
    bowl({ overs: 4.0, maidens: 0, runsConceded: 27, wickets: 4 }),
    bowl({ overs: 2.0, maidens: 0, runsConceded: 15, wickets: 2 }),
  ]
  const s = bowlingStats(matches)

  it('sums overs across spells in cricket notation (58 balls = 9.4)', () => {
    expect(s.oversBowled).toBe('9.4')
  })

  it('totals wickets and runs', () => {
    expect(s.wickets).toBe(10)
    expect(s.runsConceded).toBe(64)
    expect(s.maidens).toBe(1)
  })

  it('averages runs per wicket (64/10)', () => {
    expect(s.average).toBe('6.4')
  })

  it('computes economy from decimal overs (64 / (58/6))', () => {
    expect(s.economy).toBe('6.62')
  })

  it('picks best figures by most wickets, fewest runs tiebreak', () => {
    expect(s.best).toBe('4/22')
  })

  it('shows — for average with no wickets', () => {
    const z = bowlingStats([bowl({ overs: 4, runsConceded: 30, wickets: 0 })])
    expect(z.average).toBe(EM_DASH)
    expect(z.economy).toBe('7.5')
  })

  it('shows — for economy with no overs bowled', () => {
    const z = bowlingStats([])
    expect(z.economy).toBe(EM_DASH)
    expect(z.best).toBe(EM_DASH)
  })
})

describe('fieldingStats', () => {
  it('sums catches, run-outs, stumpings and total dismissals', () => {
    const s = fieldingStats([
      field({ catches: 2, runOuts: 1 }),
      field({ catches: 1, stumpings: 1 }),
    ])
    expect(s.catches).toBe(3)
    expect(s.runOuts).toBe(1)
    expect(s.stumpings).toBe(1)
    expect(s.dismissals).toBe(5)
  })
})

describe('listSeasons', () => {
  it('lists unique seasons, most recent first by latest match date', () => {
    const matches = [
      { season: '2025', date: '2025-06-01' },
      { season: '2026', date: '2026-05-10' },
      { season: '2025', date: '2025-07-15' },
    ]
    expect(listSeasons(matches)).toEqual(['2026', '2025'])
  })
})

describe('seasonSummary', () => {
  it('bundles batting, bowling, fielding and match count', () => {
    const s = seasonSummary([
      { ...bat({ runs: 40, balls: 30, howOut: 'caught' }), ...bowl({ overs: 4, runsConceded: 20, wickets: 2 }), ...field({ catches: 1 }) },
    ])
    expect(s.matchesPlayed).toBe(1)
    expect(s.batting.totalRuns).toBe(40)
    expect(s.bowling.wickets).toBe(2)
    expect(s.fielding.catches).toBe(1)
  })
})
