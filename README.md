# 🏏 Player Card — Cricket Performance Tracker

A mobile-first web app where an individual cricketer logs their own match
performances and watches their season stats build up. You're the **player**, not
a club admin — no accounts, no backend. Everything runs client-side and persists
in your browser.

> v1 is a web app. The plan: ship it, gain traction, then build a native App
> Store app. See [`CLAUDE.md`](./CLAUDE.md) for the full data model and roadmap.

## Features

- **Log a match** — batting, bowling, and fielding in one clean form, with
  one-tap "did you bat / bowl?" toggles so bat-only or bowl-only games are fast.
- **Season-scoped stats** — batting, bowling, and fielding cards that filter by
  season, with a runs-per-innings trend chart.
- **Cricket-correct math** — proper batting average (not-outs count runs but not
  dismissals), strike rate, economy with over-notation conversion (`3.4` = 3
  overs 4 balls), best bowling figures, and graceful divide-by-zero handling.
- **Match history** — full list, tap to view or edit.
- **Shareable profile** — your name and a season summary you can share or copy.
- **Offline & private** — data lives only on your device via IndexedDB.

## Tech stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/) (plain JavaScript)
- [Tailwind CSS](https://tailwindcss.com/) v3
- [idb](https://github.com/jakearchibald/idb) over IndexedDB for persistence
- [React Router](https://reactrouter.com/) (HashRouter — runs as a static bundle)
- [Vitest](https://vitest.dev/) for the stat-logic test suite

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
```

### Try it with sample data

Open the app → **Profile → Load sample season** to populate a demo 2026 season
(including a not-out fifty and a 4/22 bowling spell), then explore the **Stats**
tab.

## Scripts

| Command              | What it does                          |
| -------------------- | ------------------------------------- |
| `npm run dev`        | Start the Vite dev server             |
| `npm run build`      | Production build to `dist/`           |
| `npm run preview`    | Preview the production build          |
| `npm test`           | Run the Vitest suite once             |
| `npm run test:watch` | Run tests in watch mode               |

## Project structure

```
src/
  db/         IndexedDB data layer + sample-data seed
  lib/        Pure cricket stat math (stats.js, overs.js) + tests
  components/ Small, named UI pieces (StatCard, RunsTrend, BottomNav, …)
  screens/    Dashboard, MatchHistory, MatchForm, Profile
  hooks/      useSeasonMatches (load + season filter)
  constants.js
```

## Testing

The cricket formulas are the part most likely to be implemented wrong, so they
live in pure functions under `src/lib/` and are covered by 30 unit tests
(`npm test`). CI runs the suite and a production build on every push and PR.

---

Built with [Claude Code](https://claude.com/claude-code).
