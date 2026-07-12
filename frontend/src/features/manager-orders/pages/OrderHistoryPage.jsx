import { useState } from 'react'
import StoreNavbar from '../../../components/StoreNavbar'
import OrderListTab from '../components/OrderListTab'
import PaymentLogTab from '../components/PaymentLogTab'

const MAIN_TABS = [
  {
    id: 'orders',
    label: 'Đơn hàng',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    id: 'payments',
    label: 'Nhật ký thanh toán',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
]

export default function OrderHistoryPage() {
  const [activeTab, setActiveTab] = useState('orders')

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <StoreNavbar />

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-100 px-8">
        <div className="flex items-center gap-1">
          {MAIN_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap bg-transparent ${
                activeTab === tab.id
                  ? 'border-[#E8420A] text-[#E8420A]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-8 py-7">
        {activeTab === 'orders' && <OrderListTab />}
        {activeTab === 'payments' && <PaymentLogTab />}
      </div>
    </div>
  )
}
