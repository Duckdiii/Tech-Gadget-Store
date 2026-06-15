import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const TOKEN_KEY = 'tech_store_token'
const USER_KEY  = 'tech_store_user'

export const ROLE_PAGES = {
  customer: new Set([
    'home', 'list', 'detail', 'cart', 'checkout', 'invoice',
    'myOrders', 'userProfile', 'addressModal', 'paymentMethods', 'addCard',
  ]),
  manager: new Set([
    'home', 'managerDashboard', 'customerManagement', 'customerDetail', 'promotionSettings',
    'systemConfig', 'staffManagement', 'recoverRestore', 'revenueReport', 'accountManagement',
    'orderHistory', 'invoice', 'inventory', 'importStock',
  ]),
  staff: new Set([
    'home', 'staffDashboard', 'staffImport', 'staffExport', 'staffHistory', 'staffOrders', 'staffProfile',
  ]),
}

export const ROLE_LANDING = {
  customer: '/',
  manager:  '/dashboard',
  staff:    '/staff/dash',
}

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
