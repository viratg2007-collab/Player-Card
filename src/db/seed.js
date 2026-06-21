// Demo data: one realistic season so the app can be explored without manually
// logging matches. Deliberately varied — includes a not-out fifty, a bowl-only
// game, a fielding-only game, and a divide-by-zero-safe wicketless spell.

import { saveMatch, saveProfile, getAllMatches, deleteMatch } from './matches.js'

const SEASON = '2026'

const SAMPLE_MATCHES = [
  {
    season: SEASON, date: '2026-04-12', opposition: 'Riverside CC', venue: 'The Oval', format: '50-over',
    batting: { didBat: true, runs: 64, balls: 78, howOut: 'caught', fours: 7, sixes: 1 },
    bowling: { didBowl: true, overs: 6.0, maidens: 1, runsConceded: 31, wickets: 2 },
    fielding: { catches: 1, runOuts: 0, stumpings: 0 },
  },
  {
    season: SEASON, date: '2026-04-26', opposition: 'Hollowfield', venue: 'Hollow Park', format: 'T20',
    batting: { didBat: true, runs: 18, balls: 12, howOut: 'bowled', fours: 2, sixes: 1 },
    bowling: { didBowl: true, overs: 4.0, maidens: 0, runsConceded: 28, wickets: 1 },
    fielding: { catches: 0, runOuts: 1, stumpings: 0 },
  },
  {
    season: SEASON, date: '2026-05-09', opposition: 'St. Andrews', venue: '', format: '40-over',
    // Not-out fifty — showcases correct averaging (counts runs, not a dismissal).
    batting: { didBat: true, runs: 52, balls: 61, howOut: 'notout', fours: 5, sixes: 0 },
    bowling: { didBowl: false, overs: 0, maidens: 0, runsConceded: 0, wickets: 0 },
    fielding: { catches: 2, runOuts: 0, stumpings: 0 },
  },
  {
    season: SEASON, date: '2026-05-23', opposition: 'Marlowe XI', venue: 'Marlowe Green', format: 'T20',
    // Bowl-only match (toggled batting off).
    batting: { didBat: false, runs: 0, balls: 0, howOut: 'dnb', fours: 0, sixes: 0 },
    bowling: { didBowl: true, overs: 3.4, maidens: 1, runsConceded: 22, wickets: 4 },
    fielding: { catches: 0, runOuts: 0, stumpings: 0 },
  },
  {
    season: SEASON, date: '2026-06-06', opposition: 'Eastcote', venue: 'Eastcote Rec', format: '50-over',
    batting: { didBat: true, runs: 7, balls: 15, howOut: 'lbw', fours: 1, sixes: 0 },
    bowling: { didBowl: true, overs: 5.0, maidens: 0, runsConceded: 34, wickets: 0 },
    fielding: { catches: 1, runOuts: 0, stumpings: 0 },
  },
  {
    season: SEASON, date: '2026-06-20', opposition: 'Westbrook', venue: 'Westbrook Park', format: '40-over',
    batting: { didBat: true, runs: 103, balls: 96, howOut: 'caught', fours: 11, sixes: 3 },
    bowling: { didBowl: true, overs: 2.0, maidens: 0, runsConceded: 18, wickets: 1 },
    fielding: { catches: 0, runOuts: 0, stumpings: 1 },
  },
]

export async function loadSampleData() {
  await saveProfile({ name: 'Alex Carter' })
  for (const m of SAMPLE_MATCHES) {
    await saveMatch(m)
  }
}

export async function clearAllData() {
  const all = await getAllMatches()
  for (const m of all) {
    await deleteMatch(m.id)
  }
  await saveProfile({ name: '' })
}
