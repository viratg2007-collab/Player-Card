import { describe, it, expect } from 'vitest'
import { toCSV, fromCSV, CSV_COLUMNS } from './csv.js'

const sample = {
  id: 'x',
  season: '2026',
  date: '2026-05-09',
  opposition: 'St. Andrews, Old Boys',
  venue: '',
  format: '40-over',
  customOvers: null,
  batting: { didBat: true, runs: 52, balls: 61, howOut: 'notout', fours: 5, sixes: 0 },
  bowling: { didBowl: false, overs: 0, maidens: 0, runsConceded: 0, wickets: 0 },
  fielding: { catches: 2, runOuts: 0, stumpings: 0 },
}

describe('toCSV', () => {
  it('starts with the header row', () => {
    expect(toCSV([]).trim()).toBe(CSV_COLUMNS.join(','))
  })

  it('quotes fields containing commas', () => {
    const csv = toCSV([sample])
    expect(csv).toContain('"St. Andrews, Old Boys"')
  })
})

describe('fromCSV', () => {
  it('round-trips a match (export then import)', () => {
    const [parsed] = fromCSV(toCSV([sample]))
    expect(parsed.season).toBe('2026')
    expect(parsed.opposition).toBe('St. Andrews, Old Boys')
    expect(parsed.batting.runs).toBe(52)
    expect(parsed.batting.didBat).toBe(true)
    expect(parsed.bowling.didBowl).toBe(false)
    expect(parsed.fielding.catches).toBe(2)
    expect(parsed.customOvers).toBeNull()
  })

  it('coerces numbers and booleans from strings', () => {
    const [parsed] = fromCSV(toCSV([sample]))
    expect(typeof parsed.batting.runs).toBe('number')
    expect(typeof parsed.batting.didBat).toBe('boolean')
  })

  it('ignores blank lines', () => {
    const csv = toCSV([sample]) + '\n\n'
    expect(fromCSV(csv)).toHaveLength(1)
  })

  it('throws when required columns are missing', () => {
    expect(() => fromCSV('foo,bar\n1,2')).toThrow(/missing columns/i)
  })
})
