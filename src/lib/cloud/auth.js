import { useEffect, useState } from 'react'
import { supabase, isCloudEnabled } from './supabase.js'

// Subscribe to the Supabase auth session. Returns { session, loading }.
export function useSession() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isCloudEnabled)

  useEffect(() => {
    if (!isCloudEnabled) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  return { session, loading }
}

export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const signUp = (email, password) => supabase.auth.signUp({ email, password })

export const signOut = () => supabase.auth.signOut()
