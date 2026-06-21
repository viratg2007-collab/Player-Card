export const FORMATS = ['T20', 'T10', '40-over', '50-over', '60-over', 'Other']

// value: stored on the record, label: shown in the UI.
export const DISMISSALS = [
  { value: 'bowled', label: 'Bowled' },
  { value: 'caught', label: 'Caught' },
  { value: 'lbw', label: 'LBW' },
  { value: 'runout', label: 'Run out' },
  { value: 'stumped', label: 'Stumped' },
  { value: 'notout', label: 'Not out' },
  { value: 'dnb', label: 'Did not bat' },
]

// Dismissals that actually count as the batter being "out".
export const REAL_DISMISSALS = ['bowled', 'caught', 'lbw', 'runout', 'stumped']

export const EM_DASH = '—'

export function dismissalLabel(value) {
  return DISMISSALS.find((d) => d.value === value)?.label ?? value
}

// --- Player style (Profile) ---
export const BATTING_STYLES = [
  { value: 'right', label: 'Right-hand bat' },
  { value: 'left', label: 'Left-hand bat' },
]

export const BOWLING_ARMS = [
  { value: 'right', label: 'Right-arm' },
  { value: 'left', label: 'Left-arm' },
  { value: 'none', label: "Don't bowl" },
]

export const BOWLER_TYPES = [
  { value: 'fast', label: 'Fast' },
  { value: 'fast-medium', label: 'Fast-medium' },
  { value: 'medium', label: 'Medium' },
  { value: 'off-spin', label: 'Off spin' },
  { value: 'leg-spin', label: 'Leg spin' },
  { value: 'orthodox', label: 'Left-arm orthodox' },
  { value: 'wrist', label: 'Wrist spin' },
]

const labelOf = (list, v) => list.find((o) => o.value === v)?.label

// Build a readable style line, e.g. "Right-hand bat · Left-arm orthodox" or
// "Right-hand bat · Right-arm fast". Returns '' when nothing is set.
export function playerStyleLine(p = {}) {
  const parts = []
  const bat = labelOf(BATTING_STYLES, p.battingStyle)
  if (bat) parts.push(bat)

  if (p.bowlingArm && p.bowlingArm !== 'none') {
    const arm = labelOf(BOWLING_ARMS, p.bowlingArm) // "Right-arm" / "Left-arm"
    const type = labelOf(BOWLER_TYPES, p.bowlerType)
    if (!type) parts.push(arm)
    else if (type.startsWith('Left-arm')) parts.push(type) // already arm-specific
    else parts.push(`${arm} ${type.toLowerCase()}`)
  }
  return parts.join(' · ')
}
