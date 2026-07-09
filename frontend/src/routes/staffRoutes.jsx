import React from 'react'
import { StaffDashboardPage, StaffOrderPage } from '../features/staff-fulfillment'
import { StaffImportPage, StaffExportPage, StaffLogPage } from '../features/staff-inventory'
import { StaffProfilePage } from '../features/staff-profile'
import { SupplyOrderPage } from '../features/manager-inventory'

export const staffRoutes = [
  { path: '/staff/dash', element: <StaffDashboardPage /> },
  { path: '/staff/orders', element: <StaffOrderPage /> },
  { path: '/staff/import', element: <StaffImportPage /> },
  { path: '/staff/export', element: <StaffExportPage /> },
  { path: '/staff/history', element: <StaffLogPage /> },
  { path: '/staff/profile', element: <StaffProfilePage /> },
  { path: '/supply-orders', element: <SupplyOrderPage /> },
]
