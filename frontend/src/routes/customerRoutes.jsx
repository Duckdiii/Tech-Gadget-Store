import React from 'react'
import { HomePage, ProductsPage, ProductDetailPage, CartPage, CheckoutPage, InvoicePage } from '../features/customer-shop'
import { CustomerOrdersPage, OrderHistoryPage } from '../features/customer-orders'
import { UserProfilePage, AddressModalPage, PaymentMethodsPage, AddCardModalPage } from '../features/customer-profile'

export const customerRoutes = [
  { path: '/', element: <HomePage /> },
  { path: '/shop', element: <ProductsPage /> },
  { path: '/product', element: <ProductDetailPage /> },
  { path: '/cart', element: <CartPage /> },
  { path: '/checkout', element: <CheckoutPage /> },
  { path: '/invoice', element: <InvoicePage /> },
  { path: '/orders', element: <OrderHistoryPage /> },
  { path: '/my-orders', element: <CustomerOrdersPage /> },
  { path: '/profile', element: <UserProfilePage /> },
  { path: '/profile/address', element: <AddressModalPage /> },
  { path: '/profile/payment', element: <PaymentMethodsPage /> },
  { path: '/profile/payment/card', element: <AddCardModalPage /> },
]
