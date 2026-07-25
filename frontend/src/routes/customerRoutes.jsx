import {
  HomePage, ProductsPage, ProductDetailPage, CartPage, CheckoutPage, InvoicePage,
  CustomerOrdersPage, UserProfilePage, AddressModalPage, PaymentMethodsPage, AddCardModalPage,
} from './customerLazyPages'

export const customerRoutes = [
  { path: '/', element: <HomePage /> },
  { path: '/shop', element: <ProductsPage /> },
  { path: '/product', element: <ProductDetailPage /> },
  { path: '/cart', element: <CartPage /> },
  { path: '/checkout', element: <CheckoutPage /> },
  { path: '/invoice', element: <InvoicePage /> },
  { path: '/my-orders', element: <CustomerOrdersPage /> },
  { path: '/profile', element: <UserProfilePage /> },
  { path: '/profile/address', element: <AddressModalPage /> },
  { path: '/profile/payment', element: <PaymentMethodsPage /> },
  { path: '/profile/payment/card', element: <AddCardModalPage /> },
]
