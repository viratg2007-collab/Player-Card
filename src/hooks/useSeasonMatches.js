import { useCallback, useEffect, useMemo, useState } from 'react'
import { getAllMatches } from '../db/matches.js'
import { listSeasons } from '../lib/stats.js'

// Loads all matches from IndexedDB and exposes a season filter. The selected
// season defaults to the most recent one. `value === ''` means all seasons.
export function useSeasonMatches() {
  const [matches, setMatches] = useState(null) // null = still loading
  const [season, setSeason] = useState('')
  const [touched, setTouched] = useState(false)

  const reload = useCallback(async () => {
    const all = await getAllMatches()
    setMatches(all)
    return all
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const seasons = useMemo(() => (matches ? listSeasons(matches) : []), [matches])

  // Default to the most recent season once data arrives, unless the user has
  // already picked one.
  useEffect(() => {
    if (!touched && seasons.length > 0) {
      setSeason(seasons[0])
    }
  }, [seasons, touched])

  const chooseSeason = useCallback((s) => {
    setTouched(true)
    setSeason(s)
  }, [])

  const filtered = useMemo(() => {
    if (!matches) return []
    if (!season) return matches
    return matches.filter((m) => m.season === season)
  }, [matches, season])

  return {
    loading: matches === null,
    allMatches: matches || [],
    matches: filtered,
    seasons,
    season,
    chooseSeason,
    reload,
  }
}
