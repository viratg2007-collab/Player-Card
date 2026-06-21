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
