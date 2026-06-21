import { useEffect, useState } from 'react'
import { isCloudEnabled } from '../lib/cloud/supabase.js'
import { useSession, signIn, signUp, signOut } from '../lib/cloud/auth.js'
import {
  getMyProfile,
  isUsernameTaken,
  upsertProfile,
  publishMatches,
  searchProfiles,
  getFollowingIds,
  getFollowing,
  follow,
  unfollow,
  getPlayer,
} from '../lib/cloud/api.js'
import { getAllMatches, getProfile } from '../db/matches.js'
import { seasonSummary } from '../lib/stats.js'
import { playerStyleLine } from '../constants.js'
import StatCard from '../components/StatCard.jsx'
import MatchListItem from '../components/MatchListItem.jsx'
import { TextField } from '../components/form/Field.jsx'

export default function Friends() {
  const { session, loading } = useSession()
  const [profile, setProfile] = useState(undefined) // undefined=unknown, null=none

  useEffect(() => {
    if (!session) {
      setProfile(undefined)
      return
    }
    getMyProfile(session.user.id).then(setProfile).catch(() => setProfile(null))
  }, [session])

  if (!isCloudEnabled) return <NotConfigured />
  if (loading) return <Spinner />
  if (!session) return <AuthPanel />
  if (profile === undefined) return <Spinner />
  if (!profile?.username) {
    return <HandleSetup userId={session.user.id} onDone={setProfile} />
  }
  return <Social me={profile} userId={session.user.id} />
}

function Header({ title, action }) {
  return (
    <header className="mb-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-content">{title}</h1>
      {action}
    </header>
  )
}

function NotConfigured() {
  return (
    <div>
      <Header title="Friends" />
      <div className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-line/60">
        <p className="text-sm text-content">Cloud features aren’t set up yet.</p>
        <p className="mt-2 text-sm text-muted">
          Friends need accounts and a backend. Follow <code>SOCIAL.md</code> to create a free
          Supabase project and add its keys, then this tab lets you find and follow players.
        </p>
      </div>
    </div>
  )
}

function Spinner() {
  return <div className="mt-10 h-40 animate-pulse rounded-2xl bg-surface/60" />
}

function AuthPanel() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  async function submit() {
    setBusy(true)
    setError('')
    setInfo('')
    const fn = mode === 'signin' ? signIn : signUp
    const { error } = await fn(email.trim(), password)
    setBusy(false)
    if (error) return setError(error.message)
    if (mode === 'signup') setInfo('Account created. If email confirmation is on, check your inbox, then sign in.')
  }

  return (
    <div>
      <Header title="Friends" />
      <div className="space-y-3 rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-line/60">
        <p className="text-sm text-muted">
          {mode === 'signin' ? 'Sign in to find and follow players.' : 'Create an account to get started.'}
        </p>
        <TextField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        <TextField label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {info && <p className="text-sm text-muted">{info}</p>}
        <button
          type="button"
          onClick={submit}
          disabled={busy || !email || !password}
          className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] disabled:opacity-50"
        >
          {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="w-full text-center text-sm font-medium text-accent"
        >
          {mode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}

function HandleSetup({ userId, onDone }) {
  const [username, setUsername] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const valid = /^[a-z0-9_]{3,20}$/.test(username)

  async function save() {
    setBusy(true)
    setError('')
    try {
      if (await isUsernameTaken(username)) {
        setBusy(false)
        return setError('That username is taken.')
      }
      const local = await getProfile()
      await upsertProfile(userId, { ...local, username })
      onDone({ id: userId, username, name: local.name })
    } catch (e) {
      setBusy(false)
      setError(e.message || 'Could not save username.')
    }
  }

  return (
    <div>
      <Header title="Choose a username" />
      <div className="space-y-3 rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-line/60">
        <p className="text-sm text-muted">This is how friends find and follow you.</p>
        <TextField
          label="Username"
          value={username}
          onChange={(v) => setUsername(v.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
          placeholder="e.g. alex_carter"
        />
        <p className="text-xs text-muted">3–20 characters: lowercase letters, numbers, underscores.</p>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="button"
          onClick={save}
          disabled={busy || !valid}
          className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] disabled:opacity-50"
        >
          {busy ? 'Saving…' : 'Continue'}
        </button>
      </div>
    </div>
  )
}

function Social({ me, userId }) {
  const [viewing, setViewing] = useState(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [followingIds, setFollowingIds] = useState([])
  const [following, setFollowing] = useState([])
  const [syncNote, setSyncNote] = useState('')

  async function refreshFollowing() {
    setFollowingIds(await getFollowingIds(userId))
    setFollowing(await getFollowing(userId))
  }

  useEffect(() => {
    refreshFollowing().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function runSearch() {
    if (query.trim().length < 2) return setResults([])
    setResults(await searchProfiles(query.trim(), userId))
  }

  async function toggleFollow(target) {
    if (followingIds.includes(target.id)) await unfollow(userId, target.id)
    else await follow(userId, target.id)
    await refreshFollowing()
  }

  async function syncMine() {
    setSyncNote('Syncing…')
    try {
      const [local, matches] = await Promise.all([getProfile(), getAllMatches()])
      await upsertProfile(userId, { ...local, username: me.username })
      await publishMatches(userId, matches)
      setSyncNote(`Synced ${matches.length} matches`)
    } catch (e) {
      setSyncNote(e.message || 'Sync failed')
    }
    setTimeout(() => setSyncNote(''), 2500)
  }

  if (viewing) return <PlayerView userId={viewing} onBack={() => setViewing(null)} />

  return (
    <div>
      <Header
        title="Friends"
        action={
          <button type="button" onClick={() => signOut()} className="text-sm font-medium text-muted">
            Sign out
          </button>
        }
      />

      <div className="mb-4 flex items-center justify-between rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line/60">
        <div className="min-w-0">
          <p className="truncate font-semibold text-content">@{me.username}</p>
          <p className="text-xs text-muted">Publish your stats so friends can see them</p>
        </div>
        <button
          type="button"
          onClick={syncMine}
          className="shrink-0 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white active:scale-[0.99]"
        >
          Sync
        </button>
      </div>
      {syncNote && <p className="-mt-2 mb-3 text-center text-xs text-muted">{syncNote}</p>}

      <div className="mb-2 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runSearch()}
          placeholder="Search @username"
          className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-content outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        <button type="button" onClick={runSearch} className="rounded-xl bg-surface2 px-4 text-sm font-semibold text-content">
          Search
        </button>
      </div>

      {results.length > 0 && (
        <div className="mb-5 space-y-2">
          {results.map((p) => (
            <PlayerRow
              key={p.id}
              p={p}
              following={followingIds.includes(p.id)}
              onToggle={() => toggleFollow(p)}
              onOpen={() => setViewing(p.id)}
            />
          ))}
        </div>
      )}

      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Following</h2>
      {following.length === 0 ? (
        <p className="rounded-xl bg-surface px-4 py-3 text-sm text-muted ring-1 ring-line/60">
          You’re not following anyone yet. Search for a username above.
        </p>
      ) : (
        <div className="space-y-2">
          {following.map((p) => (
            <PlayerRow key={p.id} p={p} following onToggle={() => toggleFollow(p)} onOpen={() => setViewing(p.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function PlayerRow({ p, following, onToggle, onOpen }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 shadow-sm ring-1 ring-line/60">
      <button type="button" onClick={onOpen} className="min-w-0 text-left">
        <p className="truncate font-semibold text-content">@{p.username}</p>
        <p className="truncate text-xs text-muted">{p.name || '—'}</p>
      </button>
      <button
        type="button"
        onClick={onToggle}
        className={
          'shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold ' +
          (following ? 'bg-surface2 text-content' : 'bg-accent text-white')
        }
      >
        {following ? 'Following' : 'Follow'}
      </button>
    </div>
  )
}

function PlayerView({ userId, onBack }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    getPlayer(userId).then(setData).catch(() => setData({ profile: null, matches: [] }))
  }, [userId])

  if (!data) return <Spinner />
  const { profile, matches } = data
  const s = seasonSummary(matches)
  const style = profile ? playerStyleLine({ battingStyle: profile.batting_style, bowlingArm: profile.bowling_arm, bowlerType: profile.bowler_type }) : ''
  const recent = [...matches].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5)

  return (
    <div>
      <button type="button" onClick={onBack} className="mb-4 text-sm font-medium text-muted">
        ‹ Back
      </button>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-content">@{profile?.username}</h1>
        <p className="text-sm text-muted">{profile?.name || '—'}{style ? ` · ${style}` : ''}</p>
      </div>

      <div className="space-y-3">
        <StatCard
          title="Batting"
          accent
          stats={[
            { label: 'Runs', value: s.batting.totalRuns },
            { label: 'Average', value: s.batting.average },
            { label: 'Strike rate', value: s.batting.strikeRate },
            { label: 'Innings', value: s.batting.inningsCount },
            { label: 'High score', value: s.batting.highest },
            { label: '50s / 100s', value: `${s.batting.fifties}/${s.batting.hundreds}` },
          ]}
        />
        <StatCard
          title="Bowling"
          stats={[
            { label: 'Wickets', value: s.bowling.wickets },
            { label: 'Average', value: s.bowling.average },
            { label: 'Economy', value: s.bowling.economy },
            { label: 'Best', value: s.bowling.best },
          ]}
        />
      </div>

      <h2 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-muted">Recent matches</h2>
      {recent.length === 0 ? (
        <p className="rounded-xl bg-surface px-4 py-3 text-sm text-muted ring-1 ring-line/60">No matches published yet.</p>
      ) : (
        <div className="space-y-2">
          {recent.map((m) => (
            <MatchListItem key={m.id} match={m} readOnly />
          ))}
        </div>
      )}
    </div>
  )
}
