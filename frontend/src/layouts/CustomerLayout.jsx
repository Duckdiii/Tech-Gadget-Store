import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import InvoiceSidebar from '../components/InvoiceSidebar'
import OrderHistorySidebar from '../components/OrderHistorySidebar'
import PaymentSidebar from '../components/PaymentSidebar'
import UserProfileSidebar from '../components/UserProfileSidebar'
import NullSidebar from '../components/NullSidebar'
import RouteFallback from '../components/RouteFallback'
import { ROLE_PAGES } from '../config/constants'

const SIDEBAR_MAP = {
  invoice:      InvoiceSidebar,
  orderHistory: OrderHistorySidebar,
  payment:      PaymentSidebar,
  userProfile:  UserProfileSidebar,
  none:         NullSidebar,
}

const PATH_SIDEBAR = {
  '/shop':                 'none',
  '/product':              'none',
  '/cart':                 'none',
  '/checkout':             'none',
  '/invoice':              'none',
  '/orders':               'orderHistory',
  '/profile':              'none',
  '/my-orders':            'none',
  '/profile/address':      'none',
  '/profile/payment':      'payment',
  '/profile/payment/card': 'none',
}

export default function CustomerLayout() {
  const location = useLocation()
  const sidebarKey = PATH_SIDEBAR[location.pathname] || 'none'
  const SidebarComponent = SIDEBAR_MAP[sidebarKey]
  const allowedPages = ROLE_PAGES.customer

  return (
    <div className="flex min-h-dvh bg-gray-50">
      <SidebarComponent allowedPages={allowedPages} />
      <div className="flex-1 flex flex-col">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  )
}
