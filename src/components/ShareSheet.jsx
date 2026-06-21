import { useEffect, useState } from 'react'

// A bottom-sheet share menu offering explicit destinations (WhatsApp, X,
// Telegram, Email, Copy) plus the native share sheet as "More". Controlled via
// `open` / `onClose`; shares the given `text`.
export default function ShareSheet({ open, onClose, text, subject = 'My cricket stats' }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    setCopied(false)
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const enc = encodeURIComponent(text)
  const targets = [
    { key: 'whatsapp', label: 'WhatsApp', color: '#25D366', href: `https://wa.me/?text=${enc}`, Icon: WhatsApp },
    { key: 'x', label: 'X', color: '#0f172a', href: `https://twitter.com/intent/tweet?text=${enc}`, Icon: X },
    { key: 'telegram', label: 'Telegram', color: '#229ED9', href: `https://t.me/share/url?url=&text=${enc}`, Icon: Telegram },
    { key: 'email', label: 'Email', color: '#64748b', href: `mailto:?subject=${encodeURIComponent(subject)}&body=${enc}`, Icon: Mail },
  ]

  function openTarget(href) {
    window.open(href, '_blank', 'noopener,noreferrer')
    onClose()
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(onClose, 900)
    } catch {
      onClose()
    }
  }

  async function more() {
    try {
      if (navigator.share) await navigator.share({ text })
    } catch {
      /* dismissed */
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-black/50" aria-label="Close share menu" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-2xl bg-surface p-5 pb-8 shadow-xl">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
        <h3 className="mb-5 text-center text-sm font-semibold text-content">Share via</h3>

        <div className="grid grid-cols-4 gap-x-3 gap-y-5">
          {targets.map((t) => (
            <Item key={t.key} label={t.label} color={t.color} Icon={t.Icon} onClick={() => openTarget(t.href)} />
          ))}
          <Item label={copied ? 'Copied' : 'Copy'} color="#4f46e5" Icon={Copy} onClick={copy} />
          {typeof navigator !== 'undefined' && navigator.share && (
            <Item label="More" color="#475569" Icon={More} onClick={more} />
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-surface2 py-3 text-sm font-semibold text-content transition active:scale-[0.99]"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function Item({ label, color, Icon, onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-1.5">
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: color }}
      >
        <Icon />
      </span>
      <span className="text-[11px] text-muted">{label}</span>
    </button>
  )
}

/* --- brand / action glyphs (white on the coloured circle) --- */
function WhatsApp() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1l-.7.9c-.1.1-.3.2-.5.1a6.5 6.5 0 0 1-1.9-1.2 7.2 7.2 0 0 1-1.3-1.7c-.1-.2 0-.4.1-.5l.4-.4.2-.4a.5.5 0 0 0 0-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11 11 0 0 0 4.3 3.8c.6.3 1.1.4 1.5.5a3.4 3.4 0 0 0 1.6.1c.5-.1 1.4-.6 1.6-1.1s.2-1 .1-1.1-.2-.2-.4-.3z" />
    </svg>
  )
}
function X() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.2 2H21l-6.6 7.5L22 22h-6.8l-4.3-5.6L5.8 22H3l7-8L2 2h6.9l3.9 5.2L18.2 2zm-1.2 18h1.6L7.1 4H5.4l11.6 16z" />
    </svg>
  )
}
function Telegram() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.9 4.3 18.8 19c-.2 1-.9 1.3-1.7.8l-4.7-3.5-2.3 2.2c-.3.3-.5.5-.9.5l.3-4.6 8.4-7.6c.4-.3-.1-.5-.6-.2L7 11.5l-4.5-1.4c-1-.3-1-.9.2-1.4l17.5-6.7c.8-.3 1.5.2 1.2 1.3z" />
    </svg>
  )
}
function Mail() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}
function Copy() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  )
}
function More() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  )
}
