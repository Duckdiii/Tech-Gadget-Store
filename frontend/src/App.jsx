import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedLayout, PublicLayout } from './components/AppLayout'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import InvoicePage from './pages/InvoicePage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import ImportStockPage from './pages/ImportStockPage'
import InventoryPage from './pages/InventoryPage'
import RevenueReportPage from './pages/RevenueReportPage'
import ManagerDashboardPage from './pages/ManagerDashboardPage'
import StaffManagementPage from './pages/StaffManagementPage'
import RecoverRestorePage from './pages/RecoverRestorePage'
import CustomerManagementPage from './pages/CustomerManagementPage'
import CustomerDetailPage from './pages/CustomerDetailPage'
import PromotionSettingsPage from './pages/PromotionSettingsPage'
import SystemConfigPage from './pages/SystemConfigPage'
import AccountManagementPage from './pages/AccountManagementPage'
import StaffDashboardPage from './pages/StaffDashboardPage'
import StaffImportPage from './pages/StaffImportPage'
import StaffExportPage from './pages/StaffExportPage'
import StaffLogPage from './pages/StaffLogPage'
import StaffOrderPage from './pages/StaffOrderPage'
import StaffProfilePage from './pages/StaffProfilePage'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import EmailSentPage from './pages/EmailSentPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import UserProfilePage from './pages/UserProfilePage'
import CustomerOrdersPage from './pages/CustomerOrdersPage'
import AddressModalPage from './pages/AddressModalPage'
import PaymentMethodsPage from './pages/PaymentMethodsPage'
import AddCardModalPage from './pages/AddCardModalPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route element={<PublicLayout />}>
            <Route path="/login"          element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/email-sent"     element={<EmailSentPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          <Route element={<ProtectedLayout />}>
            <Route path="/shop"                element={<ProductsPage />} />
            <Route path="/product"             element={<ProductDetailPage />} />
            <Route path="/cart"                element={<CartPage />} />
            <Route path="/checkout"            element={<CheckoutPage />} />
            <Route path="/invoice"             element={<InvoicePage />} />
            <Route path="/orders"              element={<OrderHistoryPage />} />
            <Route path="/import"              element={<ImportStockPage />} />
            <Route path="/inventory"           element={<InventoryPage />} />
            <Route path="/revenue"             element={<RevenueReportPage />} />
            <Route path="/dashboard"            element={<ManagerDashboardPage />} />
            <Route path="/staff-management"    element={<StaffManagementPage />} />
            <Route path="/recover"             element={<RecoverRestorePage />} />
            <Route path="/customers"           element={<CustomerManagementPage />} />
            <Route path="/customers/detail"    element={<CustomerDetailPage />} />
            <Route path="/promotions"          element={<PromotionSettingsPage />} />
            <Route path="/config"              element={<SystemConfigPage />} />
            <Route path="/accounts"            element={<AccountManagementPage />} />
            <Route path="/staff/dash"          element={<StaffDashboardPage />} />
            <Route path="/staff/import"        element={<StaffImportPage />} />
            <Route path="/staff/export"        element={<StaffExportPage />} />
            <Route path="/staff/history"       element={<StaffLogPage />} />
            <Route path="/staff/orders"        element={<StaffOrderPage />} />
            <Route path="/staff/profile"       element={<StaffProfilePage />} />
            <Route path="/my-orders"           element={<CustomerOrdersPage />} />
            <Route path="/profile"             element={<UserProfilePage />} />
            <Route path="/profile/address"     element={<AddressModalPage />} />
            <Route path="/profile/payment"     element={<PaymentMethodsPage />} />
            <Route path="/profile/payment/card" element={<AddCardModalPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
