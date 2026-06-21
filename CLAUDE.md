# Cricket Performance Tracker

A mobile-first, single-user web app where an individual cricketer logs their own
match performances and watches their season stats build up. The user **is the
player** — not a club admin. No accounts, no login, no backend. Everything runs
client-side and persists in the browser via IndexedDB.

This file is the source of truth for the data model and the cricket stat
formulas. **If you change a formula, change it here too.** Getting cricket math
wrong is the most common failure mode — read the formulas before touching
`src/lib/stats.js`.

## Tech stack

- **React** + **Vite** (plain JavaScript, no TypeScript in v1)
- **Tailwind CSS** v3 for styling
- **idb** wrapper over **IndexedDB** for persistence (`src/db/matches.js`)
- **react-router-dom** for screen routing
- No backend, no server, no external APIs in v1. Fully offline-capable.

## Running

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build
```

## Data model

Stored in IndexedDB database `cricket-tracker`, version 1.

### `matches` store (keyPath `id`)

```js
{
  id: string,              // crypto.randomUUID()
  season: string,          // free-text label, e.g. "2026" or "Summer 2026"
  date: string,            // "YYYY-MM-DD"
  opposition: string,
  venue: string,           // optional, may be ""
  // format options: "T20" | "T10" | "40-over" | "50-over" | "60-over" | "Other"
  format: string,
  customOvers: number|null, // only meaningful when format === "Other"

  batting: {
    didBat: boolean,
    runs: number,
    balls: number,
    // dismissal: when didBat is false this is forced to "dnb"
    howOut: "bowled" | "caught" | "lbw" | "runout"
          | "stumped" | "notout" | "dnb",
    fours: number,
    sixes: number,
  },

  bowling: {
    didBowl: boolean,
    overs: number,          // CRICKET NOTATION, e.g. 3.4 = 3 overs 4 balls
    maidens: number,
    runsConceded: number,
    wickets: number,
  },

  fielding: { catches: number, runOuts: number, stumpings: number },

  createdAt: number,        // Date.now()
  updatedAt: number,
}
```

### `profile` store (keyPath `id`)

Single record with `id: "me"`:
`{ id: "me", name: string, currentSeason: string }`.
`currentSeason` is the label new matches default to (set in Profile → Seasons).

### Data utilities

- `renameSeason(from, to)` — rewrites a season label across all its matches.
- `importMatches(inputs)` — bulk-creates matches (fresh ids) from CSV.
- `src/lib/csv.js` — `toCSV` / `fromCSV` round-trip matches (flat columns in
  `CSV_COLUMNS`); used by Profile → Data export/import.
- `src/lib/matchSummary.js` — `matchSummary(match, name)` shareable text for one
  match.
- Stats helpers in `src/lib/stats.js`: `highlights` (personal bests),
  `statsByFormat`, `listSeasons`, `seasonSummary`.

## Season scoping

Every match carries a `season` label. The Dashboard, Match History and Profile
all filter by a selected season (with an "All seasons" option). Stat functions
receive an **already-filtered** array of matches — they do not know about
seasons. Keep season filtering in the UI / a single selector, never inside the
stat math.

## Cricket stat formulas (authoritative)

All implemented as pure functions in `src/lib/stats.js`. Overs conversion lives
in `src/lib/overs.js`.

### Overs <-> balls (cricket notation)

`3.4` means **3 overs and 4 balls**, NOT 3.4 overs. There are 6 balls per over.

- `oversToBalls(3.4)` = `3 * 6 + 4` = `22` balls
- `ballsToOvers(22)` = `"3.4"`
- decimal overs for rate math = `balls / 6` (e.g. 22/6 = 3.667)

The integer part is whole overs; the first decimal digit is balls (0–5).

### Batting

- **Times out** = count of innings where the player batted AND `howOut` is a real
  dismissal. `"notout"` and `"dnb"` do **NOT** count as a dismissal.
- **Batting average** = `totalRuns / timesOut`.
  - If `timesOut === 0` → display `"—"` (never Infinity / NaN). A batter with
    runs but no dismissals is effectively "not out" for averaging purposes.
- **Strike rate** = `(totalRuns / totalBalls) * 100`.
  - A **not-out innings still counts its balls and runs** toward strike rate.
  - If `totalBalls === 0` → `"—"`.
- **Innings** = matches where `didBat === true` and `howOut !== "dnb"`. (A
  not-out innings IS an innings.)
- **Highest score** = max runs in any innings. Display with `*` if that best
  score was a not-out innings (e.g. `"72*"`).
- **Fifties** = innings with runs in `50..99` (a not-out 50 still counts).
- **Hundreds** = innings with runs `>= 100`.
- **Total runs** = sum of runs across innings.

### Bowling

- **Bowling average** = `runsConceded / wickets`. If `wickets === 0` → `"—"`.
- **Economy rate** = `runsConceded / decimalOvers` where
  `decimalOvers = oversToBalls(overs) / 6`. If overs (balls) === 0 → `"—"`.
- **Best bowling figures** = the spell with the most wickets; ties broken by
  fewest runs conceded. Displayed as `"wickets/runs"`, e.g. `"4/27"`.
- **Total wickets** = sum of wickets. **Maidens** = sum of maidens.

### Fielding

- **Catches / run-outs / stumpings** = simple sums.
- **Total dismissals (fielding)** = catches + runOuts + stumpings.

### Per-format breakdown

`statsByFormat(matches)` groups matches by `format` and returns one row per
format (matches / runs / batting avg / wickets / bowling avg), most-played
first. Surfaced on the dashboard via `FormatBreakdown` (shown only when 2+
formats are present). Formats are limit-overs single-innings games — the data
model stores one batting and one bowling line per match, so **multi-innings
formats (Test/first-class) and balls-based formats (The Hundred) are out of
scope until the model supports a second innings per match.**

### Divide-by-zero rule

Any average / rate / figure with a zero denominator renders as `"—"`. Never show
`Infinity`, `NaN`, or crash.

## Roadmap / product direction

v1 is a **mobile-first web app** (this repo). The intended path is: ship the web
app, gain traction, then build a **native app for the App Store** later. Keep v1
decisions friendly to that future:

- All data lives client-side in IndexedDB with a clean data layer
  (`src/db/matches.js`) — easy to mirror into a native local store or sync
  backend later.
- Stat math is pure and UI-agnostic (`src/lib/`), so it can be reused or ported.
- HashRouter is used so the build runs as a plain static bundle (and inside a
  future native web-view shell) without server route config.
- No web-only/server dependencies that would block a native wrapper.

## Theming (light / dark)

Colors are split into two groups in `tailwind.config.js`:

- **Fixed brand colors** — `ink` (navy) and `accent` (indigo). The navy hero,
  active pills, and accent numbers use these and look right in both themes.
- **Semantic tokens** backed by CSS variables in `index.css` — `appbg`,
  `surface`, `surface2`, `content`, `muted`, `line`. These flip between light
  and dark via the `.dark` class on `<html>`.

**Always use the semantic tokens for surfaces/text** (`bg-surface`,
`text-content`, `text-muted`, `ring-line`, …) — never hard-code `bg-white` /
`text-slate-*` for themed UI, or dark mode breaks. `src/lib/theme.js` manages
the preference (`light` | `dark` | `system`, persisted in localStorage);
`initTheme()` runs in `main.jsx` before paint; `ThemeToggle` lives in Profile →
Appearance.

## PWA / installability

`public/manifest.webmanifest` + `public/sw.js` make the app installable and
offline-capable (cache-first shell, navigation fallback to `index.html`). The
service worker is registered only in production builds (`import.meta.env.PROD`)
so dev isn't affected — test it via `npm run build && npm run preview`. Bump the
`CACHE` constant in `sw.js` when shipping changes that must invalidate the
offline cache. Icons are currently SVG; PNG icons (192/512) are a future nicety
for the widest install support.

## Conventions

- Mobile-first. Bottom tab navigation (Dashboard / History / Add / Profile).
- Navy / slate palette (see `tailwind.config.js`): navy ink for surfaces/text,
  indigo accent for active state and headline numbers, generous whitespace.
- Keep components small and named for what they show (`StatCard`,
  `MatchListItem`, …). Pure stat logic stays out of components.
- The Add/Edit form is a single component (`MatchForm`) used for both create and
  edit. Batting and Bowling are collapsible sections with a one-tap Yes/No
  toggle so a bat-only or bowl-only match is fast to log.
- Numbers are stored as numbers, not strings. Empty optional text is `""`.
