import { useNavigate } from 'react-router-dom'
import { useAuth, ROLE_PAGES } from '../context/AuthContext'

export const ROUTE_MAP = {
  home:               '/',
  list:               '/shop',
  detail:             '/product',
  cart:               '/cart',
  checkout:           '/checkout',
  invoice:            '/invoice',
  myOrders:           '/my-orders',
  orderHistory:       '/orders',
  importStock:        '/import',
  inventory:          '/inventory',
  revenueReport:      '/revenue',
  managerDashboard:   '/dashboard',
  staffManagement:    '/staff-management',
  recoverRestore:     '/recover',
  customerManagement: '/customers',
  customerDetail:     '/customers/detail',
  promotionSettings:  '/promotions',
  systemConfig:       '/config',
  accountManagement:  '/accounts',
  staffDashboard:     '/staff/dash',
  staffImport:        '/staff/import',
  staffExport:        '/staff/export',
  staffHistory:       '/staff/history',
  staffOrders:        '/staff/orders',
  staffProfile:       '/staff/profile',
  login:              '/login',
  register:           '/register',
  forgotPassword:     '/forgot-password',
  emailSent:          '/email-sent',
  resetPassword:      '/reset-password',
  userProfile:        '/profile',
  addressModal:       '/profile/address',
  paymentMethods:     '/profile/payment',
  addCard:            '/profile/payment/card',
}

export function useNav() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (pageId, options = {}) => {
    if (pageId === 'login') {
      logout()
      navigate('/login')
      return
    }
    if (user && !ROLE_PAGES[user.role]?.has(pageId)) return
    const path = ROUTE_MAP[pageId]
    if (path) {
      if (options.search) {
        navigate(path + options.search, options.state ? { state: options.state } : undefined)
      } else {
        navigate(path, options)
      }
    }
  }
}
