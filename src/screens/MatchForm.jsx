import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMatch, saveMatch, deleteMatch, getAllMatches } from '../db/matches.js'
import { FORMATS, DISMISSALS } from '../constants.js'
import {
  TextField,
  NumberField,
  SelectField,
  ToggleField,
} from '../components/form/Field.jsx'

const today = () => new Date().toISOString().slice(0, 10)

// Dismissal choices the user can pick while batting (we set "dnb" automatically
// when they toggle batting off, so it's not offered here).
const BATTED_DISMISSALS = DISMISSALS.filter((d) => d.value !== 'dnb')

function blankMatch(defaultSeason) {
  return {
    season: defaultSeason || 'Season 1',
    date: today(),
    opposition: '',
    venue: '',
    format: 'T20',
    customOvers: '',
    batting: { didBat: true, runs: '', balls: '', howOut: 'notout', fours: '', sixes: '' },
    bowling: { didBowl: false, overs: '', maidens: '', runsConceded: '', wickets: '' },
    fielding: { catches: '', runOuts: '', stumpings: '' },
  }
}

export default function MatchForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      if (isEdit) {
        const existing = await getMatch(id)
        if (active) setForm(existing ? toFormState(existing) : blankMatch())
      } else {
        // New match: default season to the most recently used one.
        const all = await getAllMatches()
        const lastSeason = all[0]?.season
        if (active) setForm(blankMatch(lastSeason))
      }
    }
    load()
    return () => {
      active = false
    }
  }, [id, isEdit])

  if (!form) return <div className="h-64 animate-pulse rounded-2xl bg-white/60" />

  const set = (path, value) =>
    setForm((f) => {
      const next = structuredClone(f)
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]]
      obj[keys[keys.length - 1]] = value
      return next
    })

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const saved = await saveMatch(form)
    navigate(isEdit ? `/match/${saved.id}` : '/history')
  }

  async function handleDelete() {
    if (!window.confirm('Delete this match? This cannot be undone.')) return
    await deleteMatch(id)
    navigate('/history')
  }

  return (
    <form onSubmit={handleSubmit} className="pb-4">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">
          {isEdit ? 'Edit match' : 'Add match'}
        </h1>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-slate-500"
        >
          Cancel
        </button>
      </header>

      <div className="space-y-5">
        {/* Match details */}
        <Card>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Date"
              type="date"
              value={form.date}
              onChange={(v) => set('date', v)}
            />
            <TextField
              label="Season"
              value={form.season}
              onChange={(v) => set('season', v)}
              placeholder="e.g. 2026"
            />
          </div>
          <TextField
            label="Opposition"
            value={form.opposition}
            onChange={(v) => set('opposition', v)}
            placeholder="Team name"
          />
          <TextField
            label="Venue (optional)"
            value={form.venue}
            onChange={(v) => set('venue', v)}
            placeholder="Ground"
          />
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Format"
              value={form.format}
              onChange={(v) => set('format', v)}
              options={FORMATS}
            />
            {form.format === 'Other' && (
              <NumberField
                label="Overs per side"
                value={form.customOvers}
                onChange={(v) => set('customOvers', v)}
                min={1}
              />
            )}
          </div>
        </Card>

        {/* Batting */}
        <Card>
          <ToggleField
            label="Did you bat?"
            value={form.batting.didBat}
            onChange={(v) => set('batting.didBat', v)}
          />
          {form.batting.didBat && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="Runs"
                  value={form.batting.runs}
                  onChange={(v) => set('batting.runs', v)}
                />
                <NumberField
                  label="Balls faced"
                  value={form.batting.balls}
                  onChange={(v) => set('batting.balls', v)}
                />
              </div>
              <SelectField
                label="How out"
                value={form.batting.howOut}
                onChange={(v) => set('batting.howOut', v)}
                options={BATTED_DISMISSALS}
              />
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="Fours"
                  value={form.batting.fours}
                  onChange={(v) => set('batting.fours', v)}
                />
                <NumberField
                  label="Sixes"
                  value={form.batting.sixes}
                  onChange={(v) => set('batting.sixes', v)}
                />
              </div>
            </div>
          )}
        </Card>

        {/* Bowling */}
        <Card>
          <ToggleField
            label="Did you bowl?"
            value={form.bowling.didBowl}
            onChange={(v) => set('bowling.didBowl', v)}
          />
          {form.bowling.didBowl && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="Overs (e.g. 3.4)"
                  value={form.bowling.overs}
                  onChange={(v) => set('bowling.overs', v)}
                  step="0.1"
                />
                <NumberField
                  label="Maidens"
                  value={form.bowling.maidens}
                  onChange={(v) => set('bowling.maidens', v)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="Runs conceded"
                  value={form.bowling.runsConceded}
                  onChange={(v) => set('bowling.runsConceded', v)}
                />
                <NumberField
                  label="Wickets"
                  value={form.bowling.wickets}
                  onChange={(v) => set('bowling.wickets', v)}
                />
              </div>
            </div>
          )}
        </Card>

        {/* Fielding */}
        <Card>
          <h2 className="mb-3 text-base font-semibold text-ink">Fielding</h2>
          <div className="grid grid-cols-3 gap-3">
            <NumberField
              label="Catches"
              value={form.fielding.catches}
              onChange={(v) => set('fielding.catches', v)}
            />
            <NumberField
              label="Run-outs"
              value={form.fielding.runOuts}
              onChange={(v) => set('fielding.runOuts', v)}
            />
            <NumberField
              label="Stumpings"
              value={form.fielding.stumpings}
              onChange={(v) => set('fielding.stumpings', v)}
            />
          </div>
        </Card>
      </div>

      <div className="mt-6 space-y-3">
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-accent py-3 text-base font-semibold text-white shadow-sm transition active:scale-[0.99] disabled:opacity-60"
        >
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save match'}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            className="w-full rounded-xl py-3 text-base font-semibold text-red-600"
          >
            Delete match
          </button>
        )}
      </div>
    </form>
  )
}

function Card({ children }) {
  return (
    <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60">
      {children}
    </section>
  )
}

// Convert a stored record (numbers) into editable form state (strings for empty
// numeric inputs so the user sees blank fields, not zeros).
function toFormState(m) {
  const s = (n) => (n === 0 ? '' : String(n))
  return {
    id: m.id,
    createdAt: m.createdAt,
    season: m.season,
    date: m.date,
    opposition: m.opposition,
    venue: m.venue,
    format: m.format,
    customOvers: m.customOvers == null ? '' : String(m.customOvers),
    batting: {
      didBat: m.batting.didBat,
      runs: s(m.batting.runs),
      balls: s(m.batting.balls),
      howOut: m.batting.howOut === 'dnb' ? 'notout' : m.batting.howOut,
      fours: s(m.batting.fours),
      sixes: s(m.batting.sixes),
    },
    bowling: {
      didBowl: m.bowling.didBowl,
      overs: m.bowling.overs === 0 ? '' : String(m.bowling.overs),
      maidens: s(m.bowling.maidens),
      runsConceded: s(m.bowling.runsConceded),
      wickets: s(m.bowling.wickets),
    },
    fielding: {
      catches: s(m.fielding.catches),
      runOuts: s(m.fielding.runOuts),
      stumpings: s(m.fielding.stumpings),
    },
  }
}
