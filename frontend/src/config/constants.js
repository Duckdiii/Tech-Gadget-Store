export const ROLES = {
  CUSTOMER: 'customer',
  MANAGER: 'manager',
  STAFF: 'staff',
}

export const ROLE_LANDING = {
  customer: '/',
  manager:  '/dashboard',
  staff:    '/staff/dash',
}

export const ROLE_PAGES = {
  customer: new Set([
    'home', 'list', 'detail', 'cart', 'checkout', 'invoice',
    'myOrders', 'userProfile', 'addressModal', 'paymentMethods', 'addCard',
  ]),
  manager: new Set([
    'home', 'managerDashboard', 'customerManagement', 'customerDetail', 'promotionSettings',
    'systemConfig', 'staffManagement', 'productManagement', 'brandCategoryManagement', 'bundleServiceManagement', 'membershipManagement', 'supplierManagement', 'supplyOrders', 'recoverRestore', 'revenueReport', 'accountManagement',
    'orderHistory', 'invoice', 'inventory', 'importStock',
  ]),
  staff: new Set([
    'home', 'staffDashboard', 'staffImport', 'staffExport', 'staffHistory', 'staffOrders', 'staffProfile', 'staffSupplyOrders',
  ]),
}
