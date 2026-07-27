import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useNav } from '../hooks/useNav'
import { apiFetch } from '../config/apiClient'

const NAV_GROUPS = [
  {
    items: [
      {
        id: 'managerDashboard',
        path: '/dashboard',
        label: 'Dashboard',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        ),
      },
      {
        id: 'revenueReport',
        path: '/revenue',
        label: 'Doanh thu',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Quản lý',
    items: [
      {
        id: 'customerManagement',
        path: '/customers',
        label: 'Khách hàng',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
      {
        id: 'orderHistory',
        path: '/orders',
        label: 'Đơn hàng',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
      },
      {
        id: 'productManagement',
        path: '/products-management',
        label: 'Sản phẩm',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L3.53 10.53a2.25 2.25 0 00-.03.418v6.302c0 1.242 1.008 2.25 2.25 2.25h12.5c1.242 0 2.25-1.008 2.25-2.25v-6.302c0-.142-.01-.283-.03-.418L19.238 5.338a2.25 2.25 0 00-2.15-1.588H15M9 3.75V3a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0115 3v.75M9 3.75h6M3.5 10.5h17" />
          </svg>
        ),
      },
      {
        id: 'brandCategoryManagement',
        path: '/brands-categories',
        label: 'Thương hiệu & Danh mục',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        ),
      },
      {
        id: 'bundleServiceManagement',
        path: '/bundle-services',
        label: 'Dịch vụ đi kèm',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        ),
      },
      {
        id: 'membershipManagement',
        path: '/memberships',
        label: 'Hạng thành viên',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ),
      },
      {
        id: 'inventory',
        path: '/inventory',
        label: 'Kho hàng',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        ),
      },
      {
        id: 'promotionSettings',
        path: '/promotions',
        label: 'Khuyến mãi',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        ),
      },
      {
        id: 'supplierManagement',
        path: '/suppliers',
        label: 'Nhà cung cấp',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7l3-4h12l3 4M3 7v12a1 1 0 001 1h16a1 1 0 001-1V7M3 7h18M9 12h6" />
          </svg>
        ),
      },
      {
        id: 'supplyOrders',
        path: '/supply-orders',
        label: 'Đơn nhập hàng',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Nhân sự',
    items: [
      {
        id: 'staffManagement',
        path: '/staff-management',
        label: 'Danh sách nhân viên',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
      },
      {
        id: 'accountManagement',
        path: '/accounts',
        label: 'Tài khoản',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      {
        id: 'systemConfig',
        path: '/config',
        label: 'Cấu hình',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
      {
        id: 'recoverRestore',
        path: '/recover',
        label: 'Phục hồi dữ liệu',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ),
      },
    ],
  },
]

export default function TechStoreAdminSidebar() {
  const onNavigate = useNav()
  const { pathname } = useLocation()
  const [notifications, setNotifications] = useState([])
  const [openNotifications, setOpenNotifications] = useState(false)
  const [storeName, setStoreName] = useState('')

  useEffect(() => {
    apiFetch('/api/notifications')
      .then(setNotifications)
      .catch(() => {})
  }, [])

  useEffect(() => {
    apiFetch('/api/manager/store-settings')
      .then((dto) => setStoreName(dto.storeName || ''))
      .catch(() => {})
  }, [])

  const unreadCount = notifications.filter(n => !n.readAt).length

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, readAt: n.readAt || new Date().toISOString() })))
    apiFetch('/api/notifications/read-all', { method: 'PATCH' }).catch(() => {})
  }

  return (
    <aside className="w-64 min-h-dvh bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-[#E8420A] flex items-center justify-center shrink-0">
          <span className="text-white font-black text-sm tracking-tight">TS</span>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">TechStore Admin</p>
          <p className="text-xs text-gray-500">{storeName || 'Electronics Retail'}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-3 overflow-y-auto space-y-4">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group?.id ?? group?.code ?? group?.name ?? gi}>
            {group.label && (
              <p className="px-3 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{group.label}</p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.path || pathname.startsWith(item.path + '/')
                return (
                  <button aria-label="Thao tác" type="button"
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-orange-50 text-[#C4350A] border-l-4 border-[#E8420A] pl-2'
                        : 'text-gray-600 hover:bg-gray-100 border-l-4 border-transparent'
                    }`}
                  >
                    <span className={isActive ? 'text-[#E8420A]' : 'text-gray-400'}>{item.icon}</span>
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Notifications Section */}
      <div className="px-3 border-t border-gray-100 pt-3">
        <button aria-label="Thao tác" type="button"
          onClick={() => setOpenNotifications(prev => !prev)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded text-sm font-medium text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="relative">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </span>
            <span>Thông báo ({unreadCount})</span>
          </div>
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${openNotifications ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openNotifications && (
          <div className="mt-2 bg-gray-50 border border-gray-100 rounded p-2 max-h-48 overflow-y-auto space-y-1.5 text-xs text-gray-600">
            {notifications.length === 0 ? (
              <p className="text-gray-400 text-center py-2">Không có thông báo mới</p>
            ) : (
              <>
                <button aria-label="Thao tác" type="button"
                  onClick={markAllRead}
                  className="w-full text-right text-[10px] font-bold text-orange-600 hover:text-orange-700 cursor-pointer mb-1"
                >
                  Đánh dấu đã đọc tất cả
                </button>
                {notifications.slice(0, 5).map(n => (
                  <div key={n.id} className={`p-2 rounded border ${!n.readAt ? 'bg-white border-orange-100 font-semibold' : 'border-gray-100'}`}>
                    <p className="text-gray-900 text-[11px]">{n.title}</p>
                    <p className="text-gray-500 mt-0.5 text-[10px] leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="px-3 border-t border-gray-100 pt-3 pb-5">
        <button aria-label="Thao tác" type="button"
          onClick={() => onNavigate('login')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors border-l-4 border-transparent"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
