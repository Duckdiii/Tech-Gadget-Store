import { useMemo, useState } from 'react'
import { apiFetch } from '../services/api'
import { getToken, setToken, clearToken } from '../utils/authToken'
import { AuthContext } from './authContextObject'

const USER_KEY = 'tech_store_user'

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
    if (token) setToken(token)
  }

  const logout = () => {
    const token = getToken()
    if (token) {
      apiFetch('/api/auth/logout', { method: 'POST' }).catch(err => console.error('Logout error:', err))
    }
    setUser(null)
    localStorage.removeItem(USER_KEY)
    clearToken()
  }

  const value = useMemo(() => ({ user, login, logout }), [user])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
