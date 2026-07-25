import {
  StaffDashboardPage, StaffOrderPage, StaffImportPage, StaffExportPage, StaffLogPage,
  StaffProfilePage, SupplyOrderPage,
} from './staffLazyPages'

export const staffRoutes = [
  { path: '/staff/dash', element: <StaffDashboardPage /> },
  { path: '/staff/orders', element: <StaffOrderPage /> },
  { path: '/staff/import', element: <StaffImportPage /> },
  { path: '/staff/export', element: <StaffExportPage /> },
  { path: '/staff/history', element: <StaffLogPage /> },
  { path: '/staff/profile', element: <StaffProfilePage /> },
  { path: '/staff/supply-orders', element: <SupplyOrderPage /> },
]
