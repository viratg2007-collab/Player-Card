import { createClient } from '@supabase/supabase-js'

// The cloud (accounts + Friends) features are optional. They activate only when
// Supabase env vars are present; otherwise the app stays fully local.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isCloudEnabled = Boolean(url && anonKey)

export const supabase = isCloudEnabled
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null
