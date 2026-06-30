import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase.js'

const AuthContext = createContext({ user: null, profile: null, role: null, loading: true })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }

    let alive = true

    async function loadProfile(u) {
      if (!u) {
        setProfile(null)
        setUser(null)
        return
      }
      setUser(u)
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, role, display_name, avatar_url')
          .eq('id', u.id)
          .maybeSingle()
        if (alive) setProfile(data || { id: u.id, role: 'member' })
      } catch {
        if (alive) setProfile({ id: u.id, role: 'member' })
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return
      loadProfile(data?.session?.user || null).finally(() => { if (alive) setLoading(false) })
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      loadProfile(session?.user || null).finally(() => { if (alive) setLoading(false) })
    })

    return () => {
      alive = false
      sub?.subscription?.unsubscribe()
    }
  }, [])

  const value = {
    user,
    profile,
    role: profile?.role || null,
    isAdmin: profile?.role === 'admin',
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}