import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { api } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const me = await api.auth.me()
      // Mirror the original layout guard: backfill a referral code on first load.
      if (!me.referral_code) {
        const code = `REF${(me.id || '').slice(-6).toUpperCase() || Math.random().toString(36).slice(2, 8).toUpperCase()}`
        const updated = await api.auth.updateMe({ referral_code: code })
        setUser(updated)
      } else {
        setUser(me)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
      refresh,
      login: async (email, password) => {
        const u = await api.auth.login(email, password)
        setUser(u)
        return u
      },
      register: api.auth.register,
      verifyOtp: async (payload) => {
        const u = await api.auth.verifyOtp(payload)
        setUser(u)
        return u
      },
      logout: async () => {
        await api.auth.logout()
        setUser(null)
      },
    }),
    [user, loading, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    const from = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?from_url=${from}`} replace />
  }

  return children
}

export function RequireAdmin({ children }) {
  const { user } = useAuth()
  if (user && user.role !== 'admin') return <Navigate to="/NotFound" replace />
  return children
}
