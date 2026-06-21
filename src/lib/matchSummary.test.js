import { describe, it, expect } from 'vitest'
import { matchSummary } from './matchSummary.js'

const base = {
  opposition: 'Riverside CC',
  date: '2026-04-12',
  format: '50-over',
  customOvers: null,
  batting: { didBat: false, runs: 0, balls: 0, howOut: 'dnb', fours: 0, sixes: 0 },
  bowling: { didBowl: false, overs: 0, maidens: 0, runsConceded: 0, wickets: 0 },
  fielding: { catches: 0, runOuts: 0, stumpings: 0 },
}

describe('matchSummary', () => {
  it('includes a header with opposition, format and date', () => {
    const out = matchSummary(base)
    expect(out).toContain('vs Riverside CC')
    expect(out).toContain('50-over')
  })

  it('summarises a not-out innings with a star and no dismissal text', () => {
    const out = matchSummary({
      ...base,
      batting: { didBat: true, runs: 52, balls: 61, howOut: 'notout', fours: 5, sixes: 0 },
    })
    expect(out).toContain('Batting: 52* (61b, SR 85.2)')
    expect(out).not.toContain('not out,')
  })

  it('includes the dismissal for an out innings', () => {
    const out = matchSummary({
      ...base,
      batting: { didBat: true, runs: 30, balls: 24, howOut: 'bowled', fours: 3, sixes: 0 },
    })
    expect(out).toContain('Batting: 30 (24b, SR 125.0), bowled')
  })

  it('summarises a bowling spell with overs and economy', () => {
    const out = matchSummary({
      ...base,
      bowling: { didBowl: true, overs: 3.4, maidens: 1, runsConceded: 22, wickets: 4 },
    })
    expect(out).toContain('Bowling: 4/22 (3.4 ov, econ 6.00)')
  })

  it('omits a discipline the player did not take part in', () => {
    const out = matchSummary(base)
    expect(out).not.toContain('Batting')
    expect(out).not.toContain('Bowling')
    expect(out).not.toContain('Fielding')
  })

  it('lists fielding contributions compactly', () => {
    const out = matchSummary({
      ...base,
      fielding: { catches: 2, runOuts: 1, stumpings: 0 },
    })
    expect(out).toContain('Fielding: 2 ct, 1 ro')
  })

  it('prefixes the player name when provided', () => {
    const out = matchSummary(base, 'Alex Carter')
    expect(out.startsWith('Alex Carter — vs Riverside CC')).toBe(true)
  })
})
