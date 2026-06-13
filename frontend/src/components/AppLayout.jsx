import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth, ROLE_PAGES, ROLE_LANDING } from '../context/AuthContext'
import CustomerSidebar from './CustomerSidebar'
import InvoiceSidebar from './InvoiceSidebar'
import OrderHistorySidebar from './OrderHistorySidebar'
import WarehouseSidebar from './WarehouseSidebar'
import InventoryOpsSidebar from './InventoryOpsSidebar'
import RetailSidebar from './RetailSidebar'
import TechStoreAdminSidebar from './TechStoreAdminSidebar'
import StaffSidebar from './StaffSidebar'
import NullSidebar from './NullSidebar'
import UserProfileSidebar from './UserProfileSidebar'
import PaymentSidebar from './PaymentSidebar'

const SIDEBAR_MAP = {
  customer:        CustomerSidebar,
  invoice:         InvoiceSidebar,
  orderHistory:    OrderHistorySidebar,
  warehouse:       WarehouseSidebar,
  inventoryOps:    InventoryOpsSidebar,
  retail:          RetailSidebar,
  techAdmin:       TechStoreAdminSidebar,
  staffPanel:      StaffSidebar,
  none:            NullSidebar,
  userProfile:     UserProfileSidebar,
  payment:         PaymentSidebar,
}

const PATH_SIDEBAR = {
  customer: {
    '/shop':                'none',
    '/product':             'none',
    '/cart':                'none',
    '/checkout':            'none',
    '/invoice':             'invoice',
    '/orders':              'orderHistory',
    '/profile':             'none',
    '/my-orders':           'none',
    '/profile/address':     'none',
    '/profile/payment':     'payment',
    '/profile/payment/card':'none',
  },
  manager: {
    '/dashboard':         'techAdmin',
    '/staff-management':  'techAdmin',
    '/recover':           'techAdmin',
    '/customers':         'techAdmin',
    '/customers/detail':  'techAdmin',
    '/promotions':        'techAdmin',
    '/config':            'techAdmin',
    '/accounts':          'techAdmin',
    '/revenue':           'techAdmin',
    '/orders':            'techAdmin',
    '/invoice':           'techAdmin',
    '/inventory':         'techAdmin',
    '/import':            'techAdmin',
  },
  staff: {
    '/staff/dash':    'staffPanel',
    '/staff/import':  'staffPanel',
    '/staff/export':  'staffPanel',
    '/staff/history': 'staffPanel',
    '/staff/orders':  'staffPanel',
    '/staff/profile': 'staffPanel',
  },
}

function getSidebarKey(user, pathname) {
  if (!user) return 'none'
  return PATH_SIDEBAR[user.role]?.[pathname] ?? 'none'
}

export function ProtectedLayout() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />

  const sidebarKey = getSidebarKey(user, location.pathname)
  const SidebarComponent = SIDEBAR_MAP[sidebarKey]
  const allowedPages = ROLE_PAGES[user.role]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarComponent allowedPages={allowedPages} />
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  )
}

export function PublicLayout() {
  const { user } = useAuth()
  if (user) return <Navigate to={ROLE_LANDING[user.role]} replace />
  return <Outlet />
}
