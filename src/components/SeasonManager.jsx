import { useState } from 'react'
import { renameSeason, saveProfile } from '../db/matches.js'
import { TextField, SelectField } from './form/Field.jsx'

// Manage seasons: set the current season new matches default to, and rename an
// existing season across all its matches. Renaming touches many screens, so we
// reload afterwards to refresh every derived list.
export default function SeasonManager({ seasons, currentSeason }) {
  const [current, setCurrent] = useState(currentSeason || '')
  const [currentNote, setCurrentNote] = useState('')

  const [from, setFrom] = useState(seasons[0] || '')
  const [to, setTo] = useState('')
  const [busy, setBusy] = useState(false)

  async function saveCurrent() {
    await saveProfile({ currentSeason: current })
    setCurrentNote('Saved')
    setTimeout(() => setCurrentNote(''), 2000)
  }

  async function handleRename() {
    if (!from || !to.trim() || from === to.trim()) return
    setBusy(true)
    await renameSeason(from, to)
    window.location.reload()
  }

  return (
    <section className="space-y-4 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line/60">
      <div className="space-y-2">
        <TextField
          label="Current season (new matches default to this)"
          value={current}
          onChange={setCurrent}
          placeholder="e.g. 2026"
        />
        <button
          type="button"
          onClick={saveCurrent}
          className="w-full rounded-xl bg-surface2 py-2.5 text-sm font-semibold text-content transition active:scale-[0.99]"
        >
          Set current season
        </button>
        {currentNote && (
          <p className="text-center text-xs text-muted">{currentNote}</p>
        )}
      </div>

      {seasons.length > 0 && (
        <div className="space-y-2 border-t border-line pt-4">
          <p className="text-sm font-medium text-muted">Rename a season</p>
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="From" value={from} onChange={setFrom} options={seasons} />
            <TextField label="To" value={to} onChange={setTo} placeholder="New name" />
          </div>
          <button
            type="button"
            onClick={handleRename}
            disabled={busy || !to.trim() || from === to.trim()}
            className="w-full rounded-xl bg-surface2 py-2.5 text-sm font-semibold text-content transition active:scale-[0.99] disabled:opacity-40"
          >
            Rename season
          </button>
        </div>
      )}
    </section>
  )
}
