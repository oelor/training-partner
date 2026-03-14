'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api, { User, UserProfile, Subscription } from './api'

// Cookie helpers for middleware-based route protection
function setAuthCookie() {
  if (typeof document !== 'undefined') {
    document.cookie = 'tp_authenticated=1; path=/; max-age=604800; SameSite=Lax'
  }
}
function clearAuthCookie() {
  if (typeof document !== 'undefined') {
    document.cookie = 'tp_authenticated=; path=/; max-age=0'
  }
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  subscription: Subscription | null
  loading: boolean
  error: string | null
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, sport?: string, turnstileToken?: string) => Promise<void>
  googleLogin: (credential: string) => Promise<{ isNewUser: boolean }>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    subscription: null,
    loading: true,
    error: null,
  })

  const refreshUser = useCallback(async () => {
    if (!api.isLoggedIn()) {
      setState({ user: null, profile: null, subscription: null, loading: false, error: null })
      return
    }
    try {
      const data = await api.getMe()
      setAuthCookie()
      setState({
        user: data.user,
        profile: data.profile,
        subscription: data.subscription,
        loading: false,
        error: null,
      })
    } catch {
      api.logout()
      clearAuthCookie()
      setState({ user: null, profile: null, subscription: null, loading: false, error: null })
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = async (email: string, password: string) => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const data = await api.login({ email, password })
      setAuthCookie()
      setState({
        user: data.user,
        profile: null,
        subscription: null,
        loading: false,
        error: null,
      })
      await refreshUser()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setState(s => ({ ...s, loading: false, error: message }))
      throw err
    }
  }

  const register = async (name: string, email: string, password: string, sport?: string, turnstileToken?: string) => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const data = await api.register({ name, email, password, sport, turnstile_token: turnstileToken })
      setAuthCookie()
      setState({
        user: data.user,
        profile: null,
        subscription: null,
        loading: false,
        error: null,
      })
      await refreshUser()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      setState(s => ({ ...s, loading: false, error: message }))
      throw err
    }
  }

  const googleLogin = async (credential: string) => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const data = await api.googleAuth(credential)
      setAuthCookie()
      setState({
        user: data.user,
        profile: null,
        subscription: null,
        loading: false,
        error: null,
      })
      await refreshUser()
      return { isNewUser: data.isNewUser }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google login failed'
      setState(s => ({ ...s, loading: false, error: message }))
      throw err
    }
  }

  const logout = () => {
    api.logout()
    clearAuthCookie()
    setState({ user: null, profile: null, subscription: null, loading: false, error: null })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, googleLogin, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
