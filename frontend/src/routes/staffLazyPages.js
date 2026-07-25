import { lazy } from 'react'

// Split into a components-only module so eslint-plugin-react-refresh's Fast Refresh boundary
// check doesn't flag staffRoutes.jsx, which exports a plain route-config array alongside these.
export const StaffDashboardPage = lazy(() => import('../features/staff-fulfillment/pages/StaffDashboardPage'))
export const StaffOrderPage = lazy(() => import('../features/staff-fulfillment/pages/StaffOrderPage'))
export const StaffImportPage = lazy(() => import('../features/staff-inventory/pages/StaffImportPage'))
export const StaffExportPage = lazy(() => import('../features/staff-inventory/pages/StaffExportPage'))
export const StaffLogPage = lazy(() => import('../features/staff-inventory/pages/StaffLogPage'))
export const StaffProfilePage = lazy(() => import('../features/staff-profile/pages/StaffProfilePage'))
export const SupplyOrderPage = lazy(() => import('../features/manager-inventory/pages/SupplyOrderPage'))
