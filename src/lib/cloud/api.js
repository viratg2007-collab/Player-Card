import { supabase } from './supabase.js'

// --- profiles ---

export async function getMyProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function isUsernameTaken(username) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .ilike('username', username)
    .maybeSingle()
  if (error) throw error
  return !!data
}

// Create or update the signed-in user's public profile.
export async function upsertProfile(userId, profile) {
  const row = {
    id: userId,
    username: profile.username,
    name: profile.name || '',
    batting_style: profile.battingStyle || '',
    bowling_arm: profile.bowlingArm || '',
    bowler_type: profile.bowlerType || '',
  }
  const { error } = await supabase.from('profiles').upsert(row)
  if (error) throw error
}

// --- matches (publish local -> cloud) ---

function matchToRow(userId, m) {
  return {
    id: m.id,
    user_id: userId,
    season: m.season,
    date: m.date,
    opposition: m.opposition,
    venue: m.venue,
    format: m.format,
    custom_overs: m.customOvers,
    batting: m.batting,
    bowling: m.bowling,
    fielding: m.fielding,
    created_at: m.createdAt,
    updated_at: m.updatedAt,
  }
}

function rowToMatch(r) {
  return {
    id: r.id,
    season: r.season,
    date: r.date,
    opposition: r.opposition,
    venue: r.venue,
    format: r.format,
    customOvers: r.custom_overs,
    batting: r.batting,
    bowling: r.bowling,
    fielding: r.fielding,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

export async function publishMatches(userId, matches) {
  if (matches.length === 0) return
  const rows = matches.map((m) => matchToRow(userId, m))
  const { error } = await supabase.from('matches').upsert(rows)
  if (error) throw error
}

// --- social graph ---

export async function searchProfiles(query, excludeId) {
  let q = supabase.from('profiles').select('*').ilike('username', `%${query}%`).limit(20)
  if (excludeId) q = q.neq('id', excludeId)
  const { data, error } = await q
  if (error) throw error
  return data || []
}

export async function getFollowingIds(userId) {
  const { data, error } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)
  if (error) throw error
  return (data || []).map((r) => r.following_id)
}

export async function getFollowing(userId) {
  const { data, error } = await supabase
    .from('follows')
    .select('following_id, profiles!follows_following_id_fkey(*)')
    .eq('follower_id', userId)
  if (error) throw error
  return (data || []).map((r) => r.profiles).filter(Boolean)
}

export async function follow(userId, targetId) {
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: userId, following_id: targetId })
  if (error) throw error
}

export async function unfollow(userId, targetId) {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', userId)
    .eq('following_id', targetId)
  if (error) throw error
}

// A followed player's profile plus their matches (mapped to the local shape so
// the existing stat functions work on them).
export async function getPlayer(userId) {
  const [{ data: profile, error: pErr }, { data: matchRows, error: mErr }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('matches').select('*').eq('user_id', userId),
  ])
  if (pErr) throw pErr
  if (mErr) throw mErr
  return { profile, matches: (matchRows || []).map(rowToMatch) }
}
