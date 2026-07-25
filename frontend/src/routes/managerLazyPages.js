import { lazy } from 'react'

// Split into a components-only module so eslint-plugin-react-refresh's Fast Refresh boundary
// check doesn't flag managerRoutes.jsx, which exports a plain route-config array alongside these.
export const ManagerDashboardPage = lazy(() => import('../features/manager-analytics/pages/ManagerDashboardPage'))
export const RevenueReportPage = lazy(() => import('../features/manager-analytics/pages/RevenueReportPage'))
export const InventoryPage = lazy(() => import('../features/manager-inventory/pages/InventoryPage'))
export const ImportStockPage = lazy(() => import('../features/manager-inventory/pages/ImportStockPage'))
export const SupplierManagementPage = lazy(() => import('../features/manager-inventory/pages/SupplierManagementPage'))
export const SupplyOrderPage = lazy(() => import('../features/manager-inventory/pages/SupplyOrderPage'))
export const ProductManagementPage = lazy(() => import('../features/manager-inventory/pages/ProductManagementPage'))
export const CustomerManagementPage = lazy(() => import('../features/manager-users/pages/CustomerManagementPage'))
export const CustomerDetailPage = lazy(() => import('../features/manager-users/pages/CustomerDetailPage'))
export const StaffManagementPage = lazy(() => import('../features/manager-users/pages/StaffManagementPage'))
export const AccountManagementPage = lazy(() => import('../features/manager-users/pages/AccountManagementPage'))
export const SystemConfigPage = lazy(() => import('../features/manager-settings/pages/SystemConfigPage'))
export const RecoverRestorePage = lazy(() => import('../features/manager-settings/pages/RecoverRestorePage'))
export const PromotionSettingsPage = lazy(() => import('../features/manager-settings/pages/PromotionSettingsPage'))
export const BrandCategoryManagementPage = lazy(() => import('../features/manager-settings/pages/BrandCategoryManagementPage'))
export const BundleServiceManagementPage = lazy(() => import('../features/manager-settings/pages/BundleServiceManagementPage'))
export const MembershipManagementPage = lazy(() => import('../features/manager-settings/pages/MembershipManagementPage'))
export const OrderHistoryPage = lazy(() => import('../features/manager-orders/pages/OrderHistoryPage'))
