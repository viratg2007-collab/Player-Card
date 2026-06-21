import { useEffect, useState } from 'react'
import { generateStatCard } from '../lib/statCard.js'

// Generates a shareable stat-card image, previews it, and offers Share (as a
// file — surfaces Instagram/Stories on mobile) and Download. Pass a different
// `generator` (e.g. generateMatchCard) to change what's drawn.
export default function StatCardModal({
  open,
  onClose,
  data,
  generator = generateStatCard,
  fileName = 'player-card.png',
}) {
  const [url, setUrl] = useState('')
  const [blob, setBlob] = useState(null)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!open) return
    let revoked = false
    let objectUrl = ''
    setUrl('')
    setBlob(null)
    setNote('')
    generator(data).then((b) => {
      if (revoked || !b) return
      objectUrl = URL.createObjectURL(b)
      setBlob(b)
      setUrl(objectUrl)
    })
    return () => {
      revoked = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const file = blob ? new File([blob], fileName, { type: 'image/png' }) : null
  const canShareFile = !!(file && navigator.canShare && navigator.canShare({ files: [file] }))

  async function share() {
    if (!file) return
    setBusy(true)
    try {
      await navigator.share({ files: [file], text: data.shareText || '' })
    } catch {
      /* dismissed */
    }
    setBusy(false)
  }

  function download() {
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    setNote('Saved — post it to your Instagram story')
    setTimeout(() => setNote(''), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-black/60" aria-label="Close" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-2xl bg-surface p-5 pb-8 shadow-xl">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
        <h3 className="mb-4 text-center text-sm font-semibold text-content">Your stat card</h3>

        <div className="mx-auto mb-4 flex aspect-[9/16] max-h-[52vh] items-center justify-center overflow-hidden rounded-2xl bg-ink ring-1 ring-line">
          {url ? (
            <img src={url} alt="Stat card preview" className="h-full w-full object-contain" />
          ) : (
            <span className="text-sm text-muted">Generating…</span>
          )}
        </div>

        <div className="space-y-2">
          {canShareFile && (
            <button
              type="button"
              onClick={share}
              disabled={busy || !file}
              className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] disabled:opacity-50"
            >
              Share image
            </button>
          )}
          <button
            type="button"
            onClick={download}
            disabled={!url}
            className="w-full rounded-xl bg-surface2 py-3 text-sm font-semibold text-content transition active:scale-[0.99] disabled:opacity-50"
          >
            Download image
          </button>
          {note && <p className="text-center text-xs text-muted">{note}</p>}
          {!canShareFile && (
            <p className="px-2 text-center text-[11px] text-muted">
              On a phone, “Share image” lets you post straight to Instagram. On desktop, download and upload it.
            </p>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl py-3 text-sm font-semibold text-muted"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
