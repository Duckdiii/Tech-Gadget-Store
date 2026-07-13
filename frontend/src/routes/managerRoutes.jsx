import { ManagerDashboardPage, RevenueReportPage, RecommendationExperimentPage } from '../features/manager-analytics'
import { InventoryPage, ImportStockPage, SupplierManagementPage, SupplyOrderPage, ProductManagementPage } from '../features/manager-inventory'
import { CustomerManagementPage, CustomerDetailPage, StaffManagementPage, AccountManagementPage } from '../features/manager-users'
import { SystemConfigPage, RecoverRestorePage, PromotionSettingsPage, BrandCategoryManagementPage, BundleServiceManagementPage, MembershipManagementPage } from '../features/manager-settings'
import { OrderHistoryPage } from '../features/manager-orders'

export const managerRoutes = [
  { path: '/dashboard', element: <ManagerDashboardPage /> },
  { path: '/revenue', element: <RevenueReportPage /> },
  { path: '/recommendation-experiment', element: <RecommendationExperimentPage /> },
  { path: '/inventory', element: <InventoryPage /> },
  { path: '/import', element: <ImportStockPage /> },
  { path: '/suppliers', element: <SupplierManagementPage /> },
  { path: '/supply-orders', element: <SupplyOrderPage /> },
  { path: '/products-management', element: <ProductManagementPage /> },
  { path: '/customers', element: <CustomerManagementPage /> },
  { path: '/customers/detail', element: <CustomerDetailPage /> },
  { path: '/staff-management', element: <StaffManagementPage /> },
  { path: '/accounts', element: <AccountManagementPage /> },
  { path: '/config', element: <SystemConfigPage /> },
  { path: '/recover', element: <RecoverRestorePage /> },
  { path: '/promotions', element: <PromotionSettingsPage /> },
  { path: '/brands-categories', element: <BrandCategoryManagementPage /> },
  { path: '/bundle-services', element: <BundleServiceManagementPage /> },
  { path: '/memberships', element: <MembershipManagementPage /> },
  { path: '/orders', element: <OrderHistoryPage /> },
]
