import { useEffect, useState } from 'react'
import { getProfile, saveProfile } from '../db/matches.js'
import { loadSampleData, clearAllData } from '../db/seed.js'
import { useSeasonMatches } from '../hooks/useSeasonMatches.js'
import { seasonSummary } from '../lib/stats.js'
import SeasonSelect from '../components/SeasonSelect.jsx'
import { TextField } from '../components/form/Field.jsx'

export default function Profile() {
  const { matches, seasons, season, chooseSeason } = useSeasonMatches()
  const [name, setName] = useState('')
  const [savedName, setSavedName] = useState('')
  const [shareNote, setShareNote] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getProfile().then((p) => {
      setName(p.name)
      setSavedName(p.name)
    })
  }, [])

  async function handleSave() {
    const saved = await saveProfile({ name })
    setSavedName(saved.name)
  }

  const s = seasonSummary(matches)
  const seasonLabel = season || 'All seasons'
  const summaryText = buildSummary(savedName, seasonLabel, s)

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({ text: summaryText })
        return
      }
      await navigator.clipboard.writeText(summaryText)
      setShareNote('Copied to clipboard')
      setTimeout(() => setShareNote(''), 2000)
    } catch {
      // User dismissed the share sheet — nothing to do.
    }
  }

  const dirty = name.trim() !== savedName

  async function handleLoadSample() {
    if (matches.length && !window.confirm('Add a sample 2026 season to your data?')) return
    setBusy(true)
    await loadSampleData()
    window.location.reload()
  }

  async function handleClear() {
    if (!window.confirm('Delete ALL matches and reset your profile? This cannot be undone.')) return
    setBusy(true)
    await clearAllData()
    window.location.reload()
  }

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-ink">Profile</h1>
      </header>

      <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60">
        <TextField
          label="Player name"
          value={name}
          onChange={setName}
          placeholder="Your name"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty}
          className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] disabled:opacity-40"
        >
          Save name
        </button>
      </section>

      <div className="mt-6 mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Shareable summary
        </h2>
      </div>

      <SeasonSelect seasons={seasons} value={season} onChange={chooseSeason} />

      <section className="rounded-2xl bg-ink p-5 text-white shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-300">
          {seasonLabel}
        </p>
        <p className="mt-0.5 text-lg font-bold">
          {savedName || 'Your name'}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-y-4 text-center">
          <Stat value={s.matchesPlayed} label="Matches" />
          <Stat value={s.batting.totalRuns} label="Runs" />
          <Stat value={s.batting.average} label="Bat avg" />
          <Stat value={s.bowling.wickets} label="Wickets" />
          <Stat value={s.bowling.best} label="Best" />
          <Stat value={s.fielding.dismissals} label="Fielding" />
        </div>
      </section>

      <button
        type="button"
        onClick={handleShare}
        className="mt-3 w-full rounded-xl bg-white py-3 text-base font-semibold text-ink shadow-sm ring-1 ring-slate-200 transition active:scale-[0.99]"
      >
        Share summary
      </button>
      {shareNote && (
        <p className="mt-2 text-center text-sm text-slate-500">{shareNote}</p>
      )}

      <div className="mt-8 mb-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Data
        </h2>
      </div>
      <section className="space-y-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60">
        <button
          type="button"
          onClick={handleLoadSample}
          disabled={busy}
          className="w-full rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-ink transition active:scale-[0.99] disabled:opacity-50"
        >
          Load sample season
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={busy}
          className="w-full rounded-xl py-2.5 text-sm font-semibold text-red-600 transition active:scale-[0.99] disabled:opacity-50"
        >
          Clear all data
        </button>
        <p className="px-1 pt-1 text-xs text-slate-400">
          Everything is stored only on this device, in your browser.
        </p>
      </section>
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="text-xl font-bold tabular-nums">{value}</p>
      <p className="mt-0.5 text-[11px] text-slate-300">{label}</p>
    </div>
  )
}

function buildSummary(name, seasonLabel, s) {
  const who = name || 'My'
  const lines = [
    `${who} — ${seasonLabel}`,
    `${s.matchesPlayed} matches`,
    `Batting: ${s.batting.totalRuns} runs @ ${s.batting.average} (SR ${s.batting.strikeRate}), HS ${s.batting.highest}`,
    `Bowling: ${s.bowling.wickets} wkts @ ${s.bowling.average} (econ ${s.bowling.economy}), best ${s.bowling.best}`,
    `Fielding: ${s.fielding.dismissals} dismissals`,
  ]
  return lines.join('\n')
}
