import { useRef, useState } from 'react'
import { getAllMatches, importMatches } from '../db/matches.js'
import { loadSampleData, clearAllData } from '../db/seed.js'
import { toCSV, fromCSV } from '../lib/csv.js'

// Data management: load/clear sample data and export/import matches as CSV.
export default function DataTools({ hasData }) {
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const fileRef = useRef(null)

  async function handleLoadSample() {
    if (hasData && !window.confirm('Add a sample 2026 season to your data?')) return
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

  async function handleExport() {
    const all = await getAllMatches()
    if (all.length === 0) {
      setNote('No matches to export')
      setTimeout(() => setNote(''), 2000)
      return
    }
    const csv = toCSV(all)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `player-card-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return
    try {
      const text = await file.text()
      const inputs = fromCSV(text)
      if (inputs.length === 0) {
        setNote('No rows found in that file')
        setTimeout(() => setNote(''), 3000)
        return
      }
      if (!window.confirm(`Import ${inputs.length} match${inputs.length === 1 ? '' : 'es'} from this file?`)) return
      setBusy(true)
      await importMatches(inputs)
      window.location.reload()
    } catch (err) {
      setNote(err.message || 'Could not read that file')
      setTimeout(() => setNote(''), 4000)
    }
  }

  return (
    <section className="space-y-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleExport}
          disabled={busy}
          className="rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-ink transition active:scale-[0.99] disabled:opacity-50"
        >
          Export CSV
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-ink transition active:scale-[0.99] disabled:opacity-50"
        >
          Import CSV
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleImportFile}
        className="hidden"
      />

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

      {note && <p className="text-center text-xs text-slate-500">{note}</p>}
      <p className="px-1 pt-1 text-xs text-slate-400">
        Everything is stored only on this device, in your browser.
      </p>
    </section>
  )
}
