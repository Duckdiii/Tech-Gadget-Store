import { createContext, useContext, useMemo, useState } from 'react'
import { apiFetch } from '../services/api'

const AuthContext = createContext(null)

const TOKEN_KEY = 'tech_store_token'
const USER_KEY  = 'tech_store_user'

import { ROLE_PAGES, ROLE_LANDING } from '../config/constants'
export { ROLE_PAGES, ROLE_LANDING }

function loadPersistedUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadPersistedUser)

  const login = (userData, token) => {
    setUser(userData)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    if (token) localStorage.setItem(TOKEN_KEY, token)
  }

  const logout = () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      apiFetch('/api/auth/logout', { method: 'POST' }).catch(err => console.error('Logout error:', err))
    }
    setUser(null)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(TOKEN_KEY)
  }

  const value = useMemo(() => ({ user, login, logout }), [user])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}
