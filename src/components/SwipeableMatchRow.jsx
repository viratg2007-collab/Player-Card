import { useRef, useState } from 'react'
import MatchListItem from './MatchListItem.jsx'

const ACTION_W = 80 // px — width of the revealed Delete action
const OPEN = -ACTION_W

// Wraps a match row with swipe-left-to-reveal-delete. Uses pointer events so it
// works with touch and mouse. A swipe (or an open row) suppresses the row's
// navigation so a drag never accidentally opens the match.
export default function SwipeableMatchRow({ match, onDelete }) {
  const [offset, setOffset] = useState(0)
  const [animating, setAnimating] = useState(false)
  const startX = useRef(0)
  const startOffset = useRef(0)
  const dragging = useRef(false)
  const moved = useRef(false)

  function onPointerDown(e) {
    dragging.current = true
    moved.current = false
    setAnimating(false)
    startX.current = e.clientX
    startOffset.current = offset
  }

  function onPointerMove(e) {
    if (!dragging.current) return
    const dx = e.clientX - startX.current
    if (Math.abs(dx) > 6) moved.current = true
    const next = Math.max(OPEN, Math.min(0, startOffset.current + dx))
    setOffset(next)
  }

  function endDrag() {
    if (!dragging.current) return
    dragging.current = false
    setAnimating(true)
    setOffset(offset < OPEN / 2 ? OPEN : 0)
  }

  function close() {
    setAnimating(true)
    setOffset(0)
  }

  // Intercept the tap before the inner <Link> navigates if this was a swipe or
  // the row is already open.
  function onClickCapture(e) {
    if (moved.current || offset !== 0) {
      e.preventDefault()
      e.stopPropagation()
      close()
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete the match vs ${match.opposition || 'this team'}?`)) {
      close()
      return
    }
    await onDelete(match.id)
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      <button
        type="button"
        onClick={handleDelete}
        className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-red-600 text-sm font-semibold text-white"
      >
        Delete
      </button>
      <div
        className="relative touch-pan-y"
        style={{
          transform: `translateX(${offset}px)`,
          transition: animating ? 'transform 0.2s ease' : 'none',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
      >
        <MatchListItem match={match} />
      </div>
    </div>
  )
}
