import { useLocation } from 'react-router-dom'
import { useNav, ROUTE_MAP } from '../hooks/useNav'

const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Trang chủ',
    target: 'list',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'products',
    label: 'Sản phẩm',
    target: 'list',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    id: 'cart',
    label: 'Giỏ hàng',
    target: 'cart',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 'orders',
    label: 'Đơn hàng',
    target: 'customerOrders',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    id: 'promotions',
    label: 'Khuyến mãi',
    target: 'promotionSettings',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
]

export default function CustomerSidebar({ allowedPages = null }) {
  const onNavigate = useNav()
  const location = useLocation()

  return (
    <aside
      className="w-60 min-h-screen flex flex-col shrink-0"
      style={{
        backgroundColor: 'var(--ink)',
        borderRight: '1px solid var(--b1)',
      }}
    >
      {/* Brand mark */}
      <div
        className="px-6 pt-7 pb-6"
        style={{ borderBottom: '1px solid var(--b1)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 flex items-center justify-center"
            style={{ backgroundColor: 'var(--accent)', borderRadius: '3px' }}
          >
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span
            className="text-[15px] font-bold tracking-tight"
            style={{ color: 'var(--t1)', fontFamily: 'Syne, sans-serif' }}
          >
            TechStore
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p
          className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.15em]"
          style={{ color: 'var(--t3)' }}
        >
          Khám phá
        </p>
        {NAV_ITEMS
          .filter(item => !item.target || allowedPages === null || allowedPages.has(item.target))
          .map(item => {
            const isActive = location.pathname === ROUTE_MAP[item.target]
            return (
              <button
                key={item.id}
                onClick={() => item.target && onNavigate(item.target)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-150 relative"
                style={{
                  borderRadius: '4px',
                  color: isActive ? 'var(--t1)' : 'var(--t2)',
                  backgroundColor: isActive ? 'var(--s2)' : 'transparent',
                  fontFamily: 'DM Sans, sans-serif',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--s1)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                {/* Active indicator */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5"
                    style={{ backgroundColor: 'var(--accent)', borderRadius: '0 2px 2px 0' }}
                  />
                )}
                <span style={{ color: isActive ? 'var(--accent)' : 'var(--t3)' }}>
                  {item.icon}
                </span>
                <span className="text-[13px] font-medium">{item.label}</span>
              </button>
            )
          })}
      </nav>

      {/* Bottom */}
      <div
        className="px-3 py-4 space-y-0.5"
        style={{ borderTop: '1px solid var(--b1)' }}
      >
        <button
          onClick={() => onNavigate('userProfile')}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-150"
          style={{ borderRadius: '4px', color: 'var(--t2)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--s1)'; e.currentTarget.style.color = 'var(--t1)' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--t2)' }}
        >
          <span style={{ color: 'var(--t3)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
          <span className="text-[13px] font-medium">Tài khoản</span>
        </button>

        <button
          onClick={() => onNavigate('login')}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-150"
          style={{ borderRadius: '4px', color: 'var(--err)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-[13px] font-medium">Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}
