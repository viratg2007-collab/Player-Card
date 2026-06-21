// CSV export/import for match records. Flattens the nested match shape into a
// flat row and back. Pure and string-only so it's easy to test; importing
// returns plain objects that saveMatch() will normalize (new ids assigned).

export const CSV_COLUMNS = [
  'season',
  'date',
  'opposition',
  'venue',
  'format',
  'customOvers',
  'didBat',
  'runs',
  'balls',
  'howOut',
  'fours',
  'sixes',
  'didBowl',
  'overs',
  'maidens',
  'runsConceded',
  'wickets',
  'catches',
  'runOuts',
  'stumpings',
]

function escapeCell(value) {
  const s = value == null ? '' : String(value)
  // Quote if the cell contains a comma, quote, or newline.
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

function matchToRow(m) {
  return [
    m.season,
    m.date,
    m.opposition,
    m.venue,
    m.format,
    m.customOvers ?? '',
    m.batting.didBat,
    m.batting.runs,
    m.batting.balls,
    m.batting.howOut,
    m.batting.fours,
    m.batting.sixes,
    m.bowling.didBowl,
    m.bowling.overs,
    m.bowling.maidens,
    m.bowling.runsConceded,
    m.bowling.wickets,
    m.fielding.catches,
    m.fielding.runOuts,
    m.fielding.stumpings,
  ]
}

export function toCSV(matches) {
  const lines = [CSV_COLUMNS.join(',')]
  for (const m of matches) {
    lines.push(matchToRow(m).map(escapeCell).join(','))
  }
  return lines.join('\n')
}

// Minimal RFC-4180-ish parser: handles quoted fields, escaped quotes, and
// commas/newlines inside quotes.
function parseLines(text) {
  const rows = []
  let row = []
  let cell = ''
  let inQuotes = false
  const s = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (inQuotes) {
      if (ch === '"') {
        if (s[i + 1] === '"') {
          cell += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cell += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(cell)
      cell = ''
    } else if (ch === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += ch
    }
  }
  // Flush trailing cell/row (unless the file ended on a clean newline).
  if (cell !== '' || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }
  return rows
}

const bool = (v) => String(v).trim().toLowerCase() === 'true'
const num = (v) => Number(v) || 0

// Parse CSV text into match-input objects ready for saveMatch(). Throws if the
// header doesn't contain the expected columns.
export function fromCSV(text) {
  const rows = parseLines(text).filter((r) => r.some((c) => c.trim() !== ''))
  if (rows.length === 0) return []

  const header = rows[0].map((h) => h.trim())
  const missing = CSV_COLUMNS.filter((c) => !header.includes(c))
  if (missing.length) {
    throw new Error(`CSV is missing columns: ${missing.join(', ')}`)
  }
  const idx = (name) => header.indexOf(name)

  return rows.slice(1).map((r) => {
    const get = (name) => r[idx(name)] ?? ''
    return {
      season: get('season'),
      date: get('date'),
      opposition: get('opposition'),
      venue: get('venue'),
      format: get('format'),
      customOvers: get('customOvers') === '' ? null : num(get('customOvers')),
      batting: {
        didBat: bool(get('didBat')),
        runs: num(get('runs')),
        balls: num(get('balls')),
        howOut: get('howOut') || 'notout',
        fours: num(get('fours')),
        sixes: num(get('sixes')),
      },
      bowling: {
        didBowl: bool(get('didBowl')),
        overs: Number(get('overs')) || 0,
        maidens: num(get('maidens')),
        runsConceded: num(get('runsConceded')),
        wickets: num(get('wickets')),
      },
      fielding: {
        catches: num(get('catches')),
        runOuts: num(get('runOuts')),
        stumpings: num(get('stumpings')),
      },
    }
  })
}
