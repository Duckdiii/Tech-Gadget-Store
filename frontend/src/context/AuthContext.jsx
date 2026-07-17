import { useMemo, useState } from 'react'
import { apiFetch } from '../services/api'
import { getToken, setToken, clearToken, getPersistedUser, setPersistedUser, clearPersistedUser } from '../utils/authToken'
import { AuthContext } from './authContextObject'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getPersistedUser)

  const login = (userData, token) => {
    setUser(userData)
    setPersistedUser(userData)
    if (token) setToken(token)
  }

  const logout = () => {
    const token = getToken()
    if (token) {
      apiFetch('/api/auth/logout', { method: 'POST' }).catch(err => console.error('Logout error:', err))
    }
    setUser(null)
    clearPersistedUser()
    clearToken()
  }

  const value = useMemo(() => ({ user, login, logout }), [user])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
