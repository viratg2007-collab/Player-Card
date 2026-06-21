// Renders a shareable 1080x1920 (Instagram Story) stat card to a PNG Blob using
// the Canvas API. `data` is a flat object of pre-formatted stat strings/numbers
// (see buildStatCardData in Profile).

const W = 1080
const H = 1920
const PAD = 80

const COL = {
  bgTop: '#0f172a',
  bgBottom: '#020617',
  surface: '#1e293b',
  white: '#f8fafc',
  muted: '#94a3b8',
  label: '#64748b',
  accent: '#818cf8',
}

const FONT = 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif'

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

function roundRect(ctx, x, y, w, h, r) {
  if (ctx.roundRect) {
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, r)
    return
  }
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export async function generateStatCard(data) {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // Background gradient
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, COL.bgTop)
  g.addColorStop(1, COL.bgBottom)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'

  // Header: logo + wordmark
  const logo = await loadImage('/icon-512.png')
  if (logo) ctx.drawImage(logo, PAD, 110, 92, 92)
  setLetterSpacing(ctx, '6px')
  ctx.fillStyle = COL.muted
  ctx.font = `600 34px ${FONT}`
  ctx.fillText('PLAYER CARD', PAD + 116, 172)
  setLetterSpacing(ctx, '0px')

  // Name + season
  ctx.fillStyle = COL.white
  ctx.font = `800 78px ${FONT}`
  ctx.fillText(clip(ctx, data.name || 'Cricketer', W - PAD * 2), PAD, 322)
  ctx.fillStyle = COL.muted
  ctx.font = `400 40px ${FONT}`
  ctx.fillText(data.seasonLabel || '', PAD, 380)

  const cw = W - PAD * 2
  let y = 440

  const tile = (x, w, value, label, accent) => {
    ctx.fillStyle = COL.surface
    roundRect(ctx, x, y, w, 168, 26)
    ctx.fill()
    ctx.fillStyle = accent ? COL.accent : COL.white
    ctx.font = `800 60px ${FONT}`
    ctx.fillText(clip(ctx, String(value), w - 56), x + 30, y + 92)
    ctx.fillStyle = COL.muted
    ctx.font = `500 28px ${FONT}`
    ctx.fillText(label, x + 30, y + 134)
  }

  const row = (items) => {
    const gap = 24
    const tw = (cw - gap * (items.length - 1)) / items.length
    items.forEach((it, i) => tile(PAD + i * (tw + gap), tw, it.v, it.l, it.accent))
    y += 168 + 24
  }

  const heading = (text) => {
    y += 22
    setLetterSpacing(ctx, '3px')
    ctx.fillStyle = COL.label
    ctx.font = `600 27px ${FONT}`
    ctx.fillText(text.toUpperCase(), PAD, y)
    setLetterSpacing(ctx, '0px')
    y += 28
  }

  // Overview
  row([
    { v: data.matches, l: 'Matches' },
    { v: data.runs, l: 'Runs', accent: true },
    { v: data.wickets, l: 'Wickets', accent: true },
  ])

  heading('Batting')
  row([
    { v: data.battingAverage, l: 'Average' },
    { v: data.strikeRate, l: 'Strike rate' },
    { v: data.highest, l: 'High score' },
  ])
  row([
    { v: data.inningsCount, l: 'Innings' },
    { v: data.fifties, l: 'Fifties' },
    { v: data.hundreds, l: 'Hundreds' },
  ])

  heading('Bowling')
  row([
    { v: data.bowlingAverage, l: 'Average' },
    { v: data.economy, l: 'Economy' },
    { v: data.best, l: 'Best' },
  ])

  heading('Fielding')
  row([
    { v: data.catches, l: 'Catches' },
    { v: data.runOuts, l: 'Run-outs' },
    { v: data.stumpings, l: 'Stumpings' },
  ])

  // Footer
  ctx.textAlign = 'center'
  setLetterSpacing(ctx, '2px')
  ctx.fillStyle = COL.label
  ctx.font = `500 30px ${FONT}`
  ctx.fillText('TRACKED WITH PLAYER CARD', W / 2, H - 96)
  setLetterSpacing(ctx, '0px')
  ctx.textAlign = 'left'

  return await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'))
}

// Per-match story card: highlights a single performance (e.g. "103 vs
// Westbrook"). Shows only the disciplines the player took part in.
export async function generateMatchCard(d) {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, COL.bgTop)
  g.addColorStop(1, COL.bgBottom)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'

  const logo = await loadImage('/icon-512.png')
  if (logo) ctx.drawImage(logo, PAD, 110, 92, 92)
  setLetterSpacing(ctx, '6px')
  ctx.fillStyle = COL.muted
  ctx.font = `600 34px ${FONT}`
  ctx.fillText('PLAYER CARD', PAD + 116, 172)
  setLetterSpacing(ctx, '0px')

  const cw = W - PAD * 2
  ctx.fillStyle = COL.white
  ctx.font = `800 76px ${FONT}`
  ctx.fillText(clip(ctx, `vs ${d.opposition || 'Match'}`, cw), PAD, 322)
  ctx.fillStyle = COL.muted
  ctx.font = `400 38px ${FONT}`
  ctx.fillText(clip(ctx, d.subtitle || '', cw), PAD, 378)

  let y = 452

  const heading = (text) => {
    y += 22
    setLetterSpacing(ctx, '3px')
    ctx.fillStyle = COL.label
    ctx.font = `600 27px ${FONT}`
    ctx.fillText(text.toUpperCase(), PAD, y)
    setLetterSpacing(ctx, '0px')
    y += 28
  }

  const hero = (big, lines, h = 230) => {
    ctx.fillStyle = COL.surface
    roundRect(ctx, PAD, y, cw, h, 26)
    ctx.fill()
    ctx.textBaseline = 'middle'
    ctx.fillStyle = COL.accent
    ctx.font = `800 130px ${FONT}`
    ctx.fillText(clip(ctx, big, cw * 0.5), PAD + 44, y + h / 2)
    ctx.textAlign = 'right'
    const lh = 56
    let ly = y + h / 2 - ((lines.length - 1) * lh) / 2
    for (const ln of lines) {
      ctx.fillStyle = ln.muted ? COL.muted : COL.white
      ctx.font = `${ln.muted ? '500' : '700'} 42px ${FONT}`
      ctx.fillText(clip(ctx, ln.t, cw * 0.5), W - PAD - 44, ly)
      ly += lh
    }
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    y += h + 24
  }

  const row = (items) => {
    const gap = 24
    const tw = (cw - gap * (items.length - 1)) / items.length
    items.forEach((it, i) => {
      const x = PAD + i * (tw + gap)
      ctx.fillStyle = COL.surface
      roundRect(ctx, x, y, tw, 168, 26)
      ctx.fill()
      ctx.fillStyle = COL.white
      ctx.font = `800 60px ${FONT}`
      ctx.fillText(clip(ctx, String(it.v), tw - 56), x + 30, y + 92)
      ctx.fillStyle = COL.muted
      ctx.font = `500 28px ${FONT}`
      ctx.fillText(it.l, x + 30, y + 134)
    })
    y += 168 + 24
  }

  if (d.didBat) {
    heading('Batting')
    hero(d.score, [
      { t: `${d.balls} balls`, muted: true },
      { t: `SR ${d.sr}`, muted: false },
      { t: d.howOut, muted: true },
    ])
    row([
      { v: d.fours, l: 'Fours' },
      { v: d.sixes, l: 'Sixes' },
      { v: d.sr, l: 'Strike rate' },
    ])
  }

  if (d.didBowl) {
    heading('Bowling')
    hero(d.figures, [
      { t: `${d.overs} overs`, muted: true },
      { t: `Econ ${d.economy}`, muted: false },
    ])
    row([
      { v: d.overs, l: 'Overs' },
      { v: d.maidens, l: 'Maidens' },
      { v: d.economy, l: 'Economy' },
    ])
  }

  if (d.fieldingTotal > 0) {
    heading('Fielding')
    row([
      { v: d.catches, l: 'Catches' },
      { v: d.runOuts, l: 'Run-outs' },
      { v: d.stumpings, l: 'Stumpings' },
    ])
  }

  ctx.textAlign = 'center'
  setLetterSpacing(ctx, '2px')
  ctx.fillStyle = COL.label
  ctx.font = `500 30px ${FONT}`
  ctx.fillText('TRACKED WITH PLAYER CARD', W / 2, H - 96)
  setLetterSpacing(ctx, '0px')
  ctx.textAlign = 'left'

  return await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'))
}

function setLetterSpacing(ctx, value) {
  try {
    ctx.letterSpacing = value
  } catch {
    /* not supported — ignore */
  }
}

// Truncate text with an ellipsis to fit a max pixel width.
function clip(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text
  let t = text
  while (t.length > 1 && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1)
  return t + '…'
}
