import { useLocation } from 'react-router-dom'
import { useNav } from '../hooks/useNav'

const NAV_GROUPS = [
  {
    items: [
      {
        id: 'staffDashboard', path: '/staff/dash', label: 'Tổng quan',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
      },
    ],
  },
  {
    label: 'Kho hàng',
    items: [
      {
        id: 'staffImport', path: '/staff/import', label: 'Nhập kho',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
      },
      {
        id: 'staffExport', path: '/staff/export', label: 'Xuất kho',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
      },
      {
        id: 'staffHistory', path: '/staff/history', label: 'Lịch sử phiếu',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
      },
    ],
  },
  {
    label: 'Hỗ trợ',
    items: [
      {
        id: 'staffOrders', path: '/staff/orders', label: 'Đơn hàng',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
      },
    ],
  },
  {
    label: 'Tài khoản',
    items: [
      {
        id: 'staffProfile', path: '/staff/profile', label: 'Thông tin cá nhân',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
      },
    ],
  },
]

export default function StaffSidebar() {
  const onNavigate = useNav()
  const { pathname } = useLocation()

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-teal-600 flex items-center justify-center shrink-0">
          <span className="text-white font-black text-sm tracking-tight">TS</span>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">TechStore</p>
          <p className="text-xs text-teal-600 font-semibold">Nhân viên kho</p>
        </div>
      </div>

      {/* Staff card */}
      <div className="mx-3 mb-3 bg-teal-50 rounded px-3 py-2.5 flex items-center gap-2.5">
        <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">LD</div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-gray-800 truncate">Lê Hoàng Dũng</p>
          <p className="text-[11px] text-teal-600 font-medium">Quản lý kho</p>
        </div>
        <span className="w-2 h-2 bg-green-400 rounded-full shrink-0" title="Đang hoạt động" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-3 overflow-y-auto space-y-4">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <p className="px-3 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{group.label}</p>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const isActive = pathname === item.path
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-600 pl-2'
                        : 'text-gray-600 hover:bg-gray-100 border-l-4 border-transparent'
                    }`}
                  >
                    <span className={isActive ? 'text-teal-600' : 'text-gray-400'}>{item.icon}</span>
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 border-t border-gray-100 pt-3 pb-5">
        <button
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
