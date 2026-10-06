/**
 * Authentication context: login, register, logout, user state.
 */
import React, { createContext, useContext, useState, useCallback } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback(async (email, password) => {
    const response = await authAPI.login({ email, password })
    const { access, refresh, user: userData } = response.data
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const register = useCallback(async (data) => {
    const response = await authAPI.register(data)
    const { access, refresh, user: userData } = response.data
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token')
    try {
      if (refresh) await authAPI.logout(refresh)
    } catch (_) {
      // ignore logout errors
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const updateUser = useCallback((userData) => {
    const updated = { ...user, ...userData }
    localStorage.setItem('user', JSON.stringify(updated))
    setUser(updated)
  }, [user])

  const isAuthenticated = !!user
  const isAdmin = user?.role === 'admin' || user?.is_staff

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
