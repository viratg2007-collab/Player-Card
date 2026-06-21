import { useEffect, useState } from 'react'
import { getProfile, saveProfile } from '../db/matches.js'
import { useSeasonMatches } from '../hooks/useSeasonMatches.js'
import { seasonSummary } from '../lib/stats.js'
import SeasonSelect from '../components/SeasonSelect.jsx'
import SeasonManager from '../components/SeasonManager.jsx'
import SeasonComparison from '../components/SeasonComparison.jsx'
import DataTools from '../components/DataTools.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import ShareSheet from '../components/ShareSheet.jsx'
import StatCardModal from '../components/StatCardModal.jsx'
import { TextField, SelectField } from '../components/form/Field.jsx'
import { BATTING_STYLES, BOWLING_ARMS, BOWLER_TYPES, playerStyleLine } from '../constants.js'

const SELECT = (list, placeholder) => [{ value: '', label: placeholder }, ...list]

export default function Profile() {
  const { allMatches, matches, seasons, season, chooseSeason } = useSeasonMatches()
  const emptyForm = { name: '', battingStyle: '', bowlingArm: '', bowlerType: '' }
  const [form, setForm] = useState(emptyForm)
  const [saved, setSaved] = useState(emptyForm)
  const [currentSeason, setCurrentSeason] = useState('')
  const [shareOpen, setShareOpen] = useState(false)
  const [imageOpen, setImageOpen] = useState(false)

  useEffect(() => {
    getProfile().then((p) => {
      const f = {
        name: p.name,
        battingStyle: p.battingStyle,
        bowlingArm: p.bowlingArm,
        bowlerType: p.bowlerType,
      }
      setForm(f)
      setSaved(f)
      setCurrentSeason(p.currentSeason)
    })
  }, [])

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  async function handleSave() {
    const rec = await saveProfile(form)
    setSaved({
      name: rec.name,
      battingStyle: rec.battingStyle,
      bowlingArm: rec.bowlingArm,
      bowlerType: rec.bowlerType,
    })
  }

  const s = seasonSummary(matches)
  const seasonLabel = season || 'All seasons'
  const styleLine = playerStyleLine(saved)
  const summaryText = buildSummary(saved.name, seasonLabel, s, styleLine)
  const savedName = saved.name

  const bowls = form.bowlingArm && form.bowlingArm !== 'none'
  const dirty =
    form.name.trim() !== saved.name ||
    form.battingStyle !== saved.battingStyle ||
    form.bowlingArm !== saved.bowlingArm ||
    form.bowlerType !== saved.bowlerType

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-content">Profile</h1>
      </header>

      <section className="space-y-3 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line/60">
        <TextField
          label="Player name"
          value={form.name}
          onChange={(v) => setField('name', v)}
          placeholder="Your name"
        />
        <SelectField
          label="Batting"
          value={form.battingStyle}
          onChange={(v) => setField('battingStyle', v)}
          options={SELECT(BATTING_STYLES, 'Select…')}
        />
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Bowling arm"
            value={form.bowlingArm}
            onChange={(v) => setField('bowlingArm', v)}
            options={SELECT(BOWLING_ARMS, 'Select…')}
          />
          {bowls && (
            <SelectField
              label="Bowler type"
              value={form.bowlerType}
              onChange={(v) => setField('bowlerType', v)}
              options={SELECT(BOWLER_TYPES, 'Select…')}
            />
          )}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty}
          className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] disabled:opacity-40"
        >
          Save profile
        </button>
      </section>

      <div className="mt-8 mb-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Appearance
        </h2>
      </div>
      <ThemeToggle />

      <div className="mt-8 mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
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
        {styleLine && <p className="mt-0.5 text-xs text-slate-300">{styleLine}</p>}

        <div className="mt-4 grid grid-cols-3 gap-y-4 text-center">
          <Stat value={s.matchesPlayed} label="Matches" />
          <Stat value={s.batting.totalRuns} label="Runs" />
          <Stat value={s.batting.average} label="Bat avg" />
          <Stat value={s.bowling.wickets} label="Wickets" />
          <Stat value={s.bowling.best} label="Best" />
          <Stat value={s.fielding.dismissals} label="Fielding" />
        </div>
      </section>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="rounded-xl bg-surface py-3 text-sm font-semibold text-content shadow-sm ring-1 ring-line transition active:scale-[0.99]"
        >
          Share text
        </button>
        <button
          type="button"
          onClick={() => setImageOpen(true)}
          className="rounded-xl bg-accent py-3 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99]"
        >
          Share as image
        </button>
      </div>

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        text={summaryText}
        subject={`${savedName || 'My'} cricket stats — ${seasonLabel}`}
      />
      <StatCardModal
        open={imageOpen}
        onClose={() => setImageOpen(false)}
        data={buildStatCardData(savedName, seasonLabel, s, summaryText, styleLine)}
        fileName="player-card.png"
      />

      <div className="mt-8 mb-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Seasons
        </h2>
      </div>
      <SeasonManager seasons={seasons} currentSeason={currentSeason} />

      <div className="mt-4">
        <SeasonComparison matches={allMatches} />
      </div>

      <div className="mt-8 mb-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Data
        </h2>
      </div>
      <DataTools hasData={allMatches.length > 0} />
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

function buildStatCardData(name, seasonLabel, s, shareText, styleLine) {
  return {
    name: name || 'Cricketer',
    seasonLabel,
    styleLine,
    shareText,
    matches: s.matchesPlayed,
    runs: s.batting.totalRuns,
    battingAverage: s.batting.average,
    strikeRate: s.batting.strikeRate,
    highest: s.batting.highest,
    inningsCount: s.batting.inningsCount,
    fifties: s.batting.fifties,
    hundreds: s.batting.hundreds,
    wickets: s.bowling.wickets,
    bowlingAverage: s.bowling.average,
    economy: s.bowling.economy,
    best: s.bowling.best,
    catches: s.fielding.catches,
    runOuts: s.fielding.runOuts,
    stumpings: s.fielding.stumpings,
  }
}

function buildSummary(name, seasonLabel, s, styleLine) {
  const who = name || 'My'
  const lines = [
    `${who} — ${seasonLabel}`,
    ...(styleLine ? [styleLine] : []),
    `${s.matchesPlayed} matches`,
    `Batting: ${s.batting.totalRuns} runs @ ${s.batting.average} (SR ${s.batting.strikeRate}), HS ${s.batting.highest}`,
    `Bowling: ${s.bowling.wickets} wkts @ ${s.bowling.average} (econ ${s.bowling.economy}), best ${s.bowling.best}`,
    `Fielding: ${s.fielding.dismissals} dismissals`,
  ]
  return lines.join('\n')
}
