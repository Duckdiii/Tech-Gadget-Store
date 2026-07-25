import { lazy } from 'react'

// Split into a components-only module so eslint-plugin-react-refresh's Fast Refresh boundary
// check doesn't flag customerRoutes.jsx, which exports a plain route-config array alongside these.
export const HomePage = lazy(() => import('../features/customer-shop/pages/HomePage'))
export const ProductsPage = lazy(() => import('../features/customer-shop/pages/ProductsPage'))
export const ProductDetailPage = lazy(() => import('../features/customer-shop/pages/ProductDetailPage'))
export const CartPage = lazy(() => import('../features/customer-shop/pages/CartPage'))
export const CheckoutPage = lazy(() => import('../features/customer-shop/pages/CheckoutPage'))
export const InvoicePage = lazy(() => import('../features/customer-shop/pages/InvoicePage'))
export const CustomerOrdersPage = lazy(() => import('../features/customer-orders/pages/CustomerOrdersPage'))
export const UserProfilePage = lazy(() => import('../features/customer-profile/pages/UserProfilePage'))
export const AddressModalPage = lazy(() => import('../features/customer-profile/pages/AddressModalPage'))
export const PaymentMethodsPage = lazy(() => import('../features/customer-profile/pages/PaymentMethodsPage'))
export const AddCardModalPage = lazy(() => import('../features/customer-profile/pages/AddCardModalPage'))
