// IndexedDB data layer via idb. Single user, no auth. Two stores: "matches"
// keyed by id, and "profile" holding one record (id: "me").

import { openDB } from 'idb'

const DB_NAME = 'cricket-tracker'
const DB_VERSION = 1
const MATCHES = 'matches'
const PROFILE = 'profile'

let dbPromise

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(MATCHES)) {
          const store = db.createObjectStore(MATCHES, { keyPath: 'id' })
          store.createIndex('byDate', 'date')
          store.createIndex('bySeason', 'season')
        }
        if (!db.objectStoreNames.contains(PROFILE)) {
          db.createObjectStore(PROFILE, { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

// Build a clean record with sane numeric defaults from a form payload.
function normalizeMatch(input) {
  const num = (v) => Number(v) || 0
  const didBat = !!input.batting?.didBat
  const didBowl = !!input.bowling?.didBowl
  return {
    id: input.id || crypto.randomUUID(),
    season: (input.season || '').trim() || 'Season 1',
    date: input.date,
    opposition: (input.opposition || '').trim(),
    venue: (input.venue || '').trim(),
    format: input.format || 'T20',
    customOvers: input.format === 'Other' ? num(input.customOvers) : null,
    batting: {
      didBat,
      runs: didBat ? num(input.batting.runs) : 0,
      balls: didBat ? num(input.batting.balls) : 0,
      howOut: didBat ? input.batting.howOut || 'notout' : 'dnb',
      fours: didBat ? num(input.batting.fours) : 0,
      sixes: didBat ? num(input.batting.sixes) : 0,
    },
    bowling: {
      didBowl,
      overs: didBowl ? Number(input.bowling.overs) || 0 : 0,
      maidens: didBowl ? num(input.bowling.maidens) : 0,
      runsConceded: didBowl ? num(input.bowling.runsConceded) : 0,
      wickets: didBowl ? num(input.bowling.wickets) : 0,
    },
    fielding: {
      catches: num(input.fielding?.catches),
      runOuts: num(input.fielding?.runOuts),
      stumpings: num(input.fielding?.stumpings),
    },
    createdAt: input.createdAt || Date.now(),
    updatedAt: Date.now(),
  }
}

export async function getAllMatches() {
  const db = await getDB()
  const all = await db.getAll(MATCHES)
  // Most recent match first.
  return all.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1
    return b.createdAt - a.createdAt
  })
}

export async function getMatch(id) {
  const db = await getDB()
  return db.get(MATCHES, id)
}

export async function saveMatch(input) {
  const db = await getDB()
  const record = normalizeMatch(input)
  await db.put(MATCHES, record)
  return record
}

export async function deleteMatch(id) {
  const db = await getDB()
  await db.delete(MATCHES, id)
}

export async function getProfile() {
  const db = await getDB()
  const profile = await db.get(PROFILE, 'me')
  return {
    id: 'me',
    name: '',
    currentSeason: '',
    battingStyle: '',
    bowlingArm: '',
    bowlerType: '',
    ...profile,
  }
}

export async function saveProfile(profile) {
  const db = await getDB()
  const existing = (await db.get(PROFILE, 'me')) || {}
  const pick = (key) => (profile[key] ?? existing[key] ?? '')
  const record = {
    id: 'me',
    name: pick('name').trim(),
    currentSeason: pick('currentSeason').trim(),
    battingStyle: pick('battingStyle'),
    bowlingArm: pick('bowlingArm'),
    bowlerType: pick('bowlerType'),
  }
  await db.put(PROFILE, record)
  return record
}

// Rename a season label across every match that uses it.
export async function renameSeason(from, to) {
  const target = (to || '').trim()
  if (!target || from === target) return 0
  const db = await getDB()
  const all = await db.getAll(MATCHES)
  const tx = db.transaction(MATCHES, 'readwrite')
  let changed = 0
  for (const m of all) {
    if (m.season === from) {
      await tx.store.put({ ...m, season: target, updatedAt: Date.now() })
      changed++
    }
  }
  await tx.done
  return changed
}

// Bulk import match inputs (e.g. from CSV). Each gets a fresh id via saveMatch's
// normalization. Returns the number imported.
export async function importMatches(inputs) {
  let count = 0
  for (const input of inputs) {
    await saveMatch({ ...input, id: undefined })
    count++
  }
  return count
}
