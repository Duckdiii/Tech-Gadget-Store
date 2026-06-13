import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const login  = (userData) => setUser(userData)
  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
