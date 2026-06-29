import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useNav, ROUTE_MAP } from '../hooks/useNav'
import { useAuth } from '../context/AuthContext'
import { useAccessibility } from '../hooks/useAccessibility'


const SAMPLE_NOTIFICATIONS = [
  { id: 1, type: 'delivery', title: 'Đơn hàng đã giao thành công', body: 'Đơn #ORD-8492 (MacBook Pro 14") đã được giao.', time: '2 phút trước', unread: true },
  { id: 2, type: 'sale', title: 'Flash Sale sắp kết thúc!', body: 'Ưu đãi giảm đến 40% chỉ còn 3 giờ nữa.', time: '1 giờ trước', unread: true },
  { id: 3, type: 'gift', title: 'Điểm thưởng sắp hết hạn', body: '500 điểm của bạn hết hạn vào ngày 15/06.', time: '1 ngày trước', unread: false },
  { id: 4, type: 'payment', title: 'Thanh toán thành công', body: 'Đơn hàng #ORD-8491 đã được xác nhận.', time: '2 ngày trước', unread: false },
]

const TICKER_ITEMS = [
  { text: 'iPhone 15 Pro Max giảm 12% — chỉ hôm nay' },
  { text: 'Miễn phí vận chuyển toàn quốc đơn từ 500.000₫' },
  { text: 'Mua kèm tai nghe chính hãng — tiết kiệm đến 30%' },
  { text: 'Samsung Galaxy S24 Ultra mới về — trả góp 0%' },
]

function renderNotificationIcon(type) {
  switch (type) {
    case 'delivery':
      return <svg className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
    case 'sale':
      return <svg className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
    case 'gift':
      return <svg className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm0 0h4m-4 0H8m12 0a2 2 0 10-2-2v2m0 0h2m-4 0a2 2 0 102 2v-2m0 0h-2M8 8a2 2 0 112-2v2m0 0H8m2 0a2 2 0 11-2 2v-2m0 0h2" /></svg>;
    case 'payment':
      return <svg className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    default:
      return <svg className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
  }
}

const NAV_LINKS = [
  { label: 'Trang chủ', page: 'home' },
  { label: 'Sản phẩm', page: 'list' },
  { label: 'Khuyến mãi', page: 'home' },
]

function useDropdown(ref) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open, ref])
  return { open, setOpen }
}

function AnnouncementBar() {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => { setIdx(i => (i + 1) % TICKER_ITEMS.length); setVisible(true) }, 280)
    }, 4000)
    return () => clearInterval(t)
  }, [])

  const item = TICKER_ITEMS[idx]

  return (
    <div style={{ backgroundColor: 'var(--accent)', borderBottom: '1px solid var(--accent-d)' }}>
      <div className="max-w-screen-2xl mx-auto px-8 py-1.5 flex items-center justify-between relative">
        <div className="flex items-center gap-4 text-[11px]" style={{ color: 'rgba(255,255,255,0.8)' }}>
          <span>Hỗ trợ: <strong style={{ color: '#fff', fontWeight: 700 }}>1800-9999</strong></span>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
          <span>T2–T7 · 8:00–22:00</span>
        </div>

        <p
          className="text-[11px] font-semibold transition-opacity duration-300 text-center absolute left-1/2 -translate-x-1/2 text-white"
          style={{ opacity: visible ? 1 : 0 }}
        >
          <svg className="w-3 h-3 inline-block mr-1.5 align-middle text-white/95 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
          <span>{item.text}</span>
          <span
            className="ml-3 cursor-pointer underline underline-offset-2 transition-opacity"
            style={{ opacity: 0.85 }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.85'}
          >
            Xem ngay →
          </span>
        </p>

        <div className="flex items-center gap-4 text-[11px]" style={{ color: 'rgba(255,255,255,0.8)' }}>
          <span
            className="cursor-pointer transition-opacity"
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
          >
            Tra cứu đơn hàng
          </span>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
          <span
            className="cursor-pointer transition-opacity"
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
          >
            Cửa hàng gần nhất
          </span>
        </div>
      </div>
    </div>
  )
}

export default function StoreNavbar() {
  const onNavigate = useNav()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [bellRing, setBellRing] = useState(false)
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS)

  const bellRef = useRef(null)
  const userMenuRef = useRef(null)
  const bell = useDropdown(bellRef)
  const userMenu = useDropdown(userMenuRef)
  const [subPanel, setSubPanel] = useState(null)
  const { dark, setDark, font, setFont, noMotion, setNoMotion } = useAccessibility()

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (!userMenu.open) setSubPanel(null) }, [userMenu.open])

  const unreadCount = notifications.filter(n => n.unread).length

  const handleBell = () => {
    setBellRing(true)
    bell.setOpen(prev => !prev)
    if (userMenu.open) userMenu.setOpen(false)
  }

  const handleUserMenu = () => {
    userMenu.setOpen(prev => !prev)
    if (bell.open) bell.setOpen(false)
  }

  useEffect(() => {
    if (!bellRing) return
    const t = setTimeout(() => setBellRing(false), 600)
    return () => clearTimeout(t)
  }, [bellRing])

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n))

  const handleSearch = (e) => { e.preventDefault(); onNavigate('list') }

  const location = useLocation()
  const displayName = user?.name || 'Khách hàng'
  const initials = displayName.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()

  return (
    <header className="sticky top-0 z-50">
      <AnnouncementBar />

      {/* ── Main bar ── */}
      <div style={{ backgroundColor: 'var(--ink)', borderBottom: '1px solid var(--b1)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div className="max-w-screen-2xl mx-auto px-8 h-[72px] flex items-center gap-8">

          {/* Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 shrink-0 cursor-pointer select-none"
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                background: 'linear-gradient(135deg, #F97316, #EA580C)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path
                  d="M11 2.5L4.5 6.2v6.8c0 3.8 2.8 7.4 6.5 8.4 3.7-1 6.5-4.6 6.5-8.4V6.2L11 2.5z"
                  fill="rgba(255, 255, 255, 0.95)"
                />
                <path
                  d="M7.5 10.5h7M7.5 13.5h5"
                  stroke="#EA580C"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: '21px', fontWeight: 900, color: 'var(--t1)', letterSpacing: '-0.5px' }}>Tech</span>
              <span style={{ fontSize: '21px', fontWeight: 900, color: '#EA580C', letterSpacing: '-0.5px' }}>Store</span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex items-stretch h-full">
            {NAV_LINKS.map(({ label, page }) => {
              const active = location.pathname === ROUTE_MAP[page]
              return (
                <button
                  key={label}
                  onClick={() => onNavigate(page)}
                  className="relative flex items-center px-4 text-[13px] font-medium tracking-wide transition-colors h-full"
                  style={{ color: active ? 'var(--t1)' : 'var(--t3)', fontFamily: 'Be Vietnam Pro, sans-serif' }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--t2)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--t3)' }}
                >
                  {label}
                  {active && (
                    <span
                      className="absolute bottom-0 left-4 right-4 h-[2px]"
                      style={{ backgroundColor: 'var(--accent)' }}
                    />
                  )}
                </button>
              )
            })}
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative flex items-center">
              <svg
                className="absolute left-3.5 w-[16px] h-[16px] pointer-events-none transition-colors"
                style={{ color: searchFocused ? 'var(--accent)' : 'var(--t3)' }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Tìm điện thoại, máy tính, phụ kiện..."
                className="w-full pl-10 pr-20 py-2.5 text-[13px] transition-all"
                style={{
                  backgroundColor: 'var(--s2)',
                  border: `1px solid ${searchFocused ? 'var(--accent)' : 'var(--b1)'}`,
                  borderRadius: '3px',
                  color: 'var(--t1)',
                  outline: 'none',
                  fontFamily: 'Be Vietnam Pro, sans-serif',
                }}
              />
              <button
                type="submit"
                className="absolute right-0 top-0 bottom-0 px-5 text-white text-[12px] font-bold tracking-wide transition-colors"
                style={{ backgroundColor: 'var(--accent)', borderRadius: '0 3px 3px 0' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-d)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
              >
                Tìm
              </button>
            </div>
          </form>

          {/* Right controls */}
          <div className="flex items-center gap-5 shrink-0" style={{ color: 'var(--t3)' }}>

            {/* Cart */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative transition-colors"
              style={{ color: 'var(--t3)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--t1)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}
              aria-label="Giỏ hàng"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span
                className="absolute -top-1.5 -right-2 w-4 h-4 text-white text-[9px] font-bold flex items-center justify-center"
                style={{ backgroundColor: 'var(--accent)', borderRadius: '2px' }}
              >
                2
              </span>
            </button>

            {/* Bell */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={handleBell}
                className="relative transition-colors"
                style={{ color: bell.open ? 'var(--accent)' : 'var(--t3)' }}
                onMouseEnter={e => { if (!bell.open) e.currentTarget.style.color = 'var(--t1)' }}
                onMouseLeave={e => { if (!bell.open) e.currentTarget.style.color = 'var(--t3)' }}
                aria-label="Thông báo"
              >
                <svg
                  className={`w-5 h-5 origin-top ${bellRing ? 'bell-ring' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2 w-4 h-4 text-white text-[9px] font-bold flex items-center justify-center pointer-events-none"
                    style={{ backgroundColor: 'var(--accent)', borderRadius: '2px' }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {bell.open && (
                <div
                  className="notif-in absolute right-0 top-full mt-2 w-80 overflow-hidden"
                  style={{ backgroundColor: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
                >
                  <div
                    className="flex items-center justify-between px-4 py-2.5"
                    style={{ borderBottom: '1px solid var(--b1)' }}
                  >
                    <span className="text-[12px] font-bold" style={{ color: 'var(--t1)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                      Thông báo
                      {unreadCount > 0 && (
                        <span
                          className="ml-2 px-1.5 py-0.5 text-[9px] font-bold text-white"
                          style={{ backgroundColor: 'var(--accent)', borderRadius: '2px' }}
                        >
                          {unreadCount} mới
                        </span>
                      )}
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[11px] font-medium"
                        style={{ color: 'var(--accent)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-h)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'}
                      >
                        Đọc tất cả
                      </button>
                    )}
                  </div>

                  <ul className="max-h-72 overflow-y-auto" style={{ borderBottom: '1px solid var(--b1)' }}>
                    {notifications.map(n => (
                      <li
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className="flex gap-3 px-4 py-3 cursor-pointer transition-colors"
                        style={{
                          borderBottom: '1px solid var(--b1)',
                          backgroundColor: n.unread ? 'rgba(232,66,10,0.05)' : 'transparent',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--s1)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = n.unread ? 'rgba(232,66,10,0.05)' : 'transparent'}
                      >
                        {renderNotificationIcon(n.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] leading-snug font-semibold" style={{ color: n.unread ? 'var(--t1)' : 'var(--t2)' }}>
                            {n.title}
                          </p>
                          <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: 'var(--t3)' }}>{n.body}</p>
                          <p className="text-[10px] mt-1" style={{ color: 'var(--t3)' }}>{n.time}</p>
                        </div>
                        {n.unread && (
                          <span className="w-1.5 h-1.5 mt-1.5 shrink-0 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
                        )}
                      </li>
                    ))}
                  </ul>

                  <div className="px-4 py-2.5 text-center">
                    <button
                      className="text-[11px] font-medium"
                      style={{ color: 'var(--accent)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-h)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'}
                    >
                      Xem tất cả thông báo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User avatar or Login/Register Button */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={handleUserMenu}
                  className="w-8 h-8 flex items-center justify-center text-white text-[12px] font-bold transition-all"
                  style={{
                    backgroundColor: userMenu.open ? 'var(--accent)' : 'var(--s3)',
                    border: `1px solid ${userMenu.open ? 'var(--accent)' : 'var(--b2)'}`,
                    borderRadius: '6px',
                  }}
                  aria-label="Tài khoản"
                >
                  {initials}
                </button>

                {userMenu.open && (
                  <div
                    className="notif-in absolute right-0 top-full mt-2 w-72 overflow-hidden"
                    style={{ backgroundColor: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
                  >
                    {/* User header */}
                    <div className="px-4 pt-4 pb-3.5" style={{ borderBottom: '1px solid var(--b1)', backgroundColor: 'var(--s2)' }}>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 flex items-center justify-center text-white font-bold text-[13px] shrink-0"
                          style={{ backgroundColor: 'var(--accent)', borderRadius: '3px' }}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold truncate" style={{ color: 'var(--t1)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>{displayName}</p>
                          {user.email && (
                            <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--t3)' }}>{user.email}</p>
                          )}
                        </div>
                      </div>
                      <div
                        className="mt-3 flex items-center justify-between px-3 py-1.5"
                        style={{ backgroundColor: 'var(--b1)', borderRadius: '3px' }}
                      >
                        <span className="text-[11px] font-medium" style={{ color: 'var(--t2)' }}>
                          <span style={{ color: 'var(--accent)' }}>★</span> Thành viên Bạc
                        </span>
                        <span className="text-[11px] font-bold" style={{ color: 'var(--accent)' }}>1.250 điểm</span>
                      </div>
                    </div>

                    {subPanel === null ? (
                      <>
                        <div className="p-2" style={{ borderBottom: '1px solid var(--b1)' }}>
                          <NavItem onClick={() => { onNavigate('userProfile'); userMenu.setOpen(false) }} icon={<UserIcon />} label="Trang cá nhân" sub="Xem và chỉnh sửa thông tin" />
                          <NavItem onClick={() => { onNavigate('customerOrders'); userMenu.setOpen(false) }} icon={<OrderIcon />} label="Đơn hàng của tôi" badge="2" />
                          <NavItem icon={<HeartIcon />} label="Sản phẩm yêu thích" />
                          <NavItem icon={<CouponIcon />} label="Mã giảm giá của tôi" badge="5" />
                        </div>
                        <div className="p-2" style={{ borderBottom: '1px solid var(--b1)' }}>
                          <NavItem onClick={() => setSubPanel('display')} icon={<DisplayIcon />} label="Màn hình & trợ năng" arrow />
                        </div>
                        <div className="p-2">
                          <NavItem onClick={() => { userMenu.setOpen(false); onNavigate('login') }} icon={<LogoutIcon />} label="Đăng xuất" danger />
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className="flex items-center gap-3 px-3 py-2.5"
                          style={{ borderBottom: '1px solid var(--b1)' }}
                        >
                          <button
                            onClick={() => setSubPanel(null)}
                            className="w-6 h-6 flex items-center justify-center transition-colors"
                            style={{ backgroundColor: 'var(--s2)', borderRadius: '3px' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--s3)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--s2)'}
                          >
                            <svg className="w-3 h-3" style={{ color: 'var(--t2)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <span className="text-[13px] font-bold" style={{ color: 'var(--t1)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Màn hình & trợ năng</span>
                        </div>

                        <div className="p-4 space-y-1">
                          {/* Dark mode */}
                          <div className="flex items-center justify-between gap-3 py-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: 'var(--accent-dim)', borderRadius: '3px' }}>
                                <svg className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-[12px] font-semibold" style={{ color: 'var(--t1)' }}>Chế độ tối</p>
                                <p className="text-[10px] mt-0.5" style={{ color: 'var(--t3)' }}>Bảo vệ mắt ban đêm</p>
                              </div>
                            </div>
                            <Toggle on={dark} onChange={setDark} />
                          </div>

                          <div style={{ height: '1px', backgroundColor: 'var(--b1)', margin: '2px 0' }} />

                          {/* Font size */}
                          <div className="py-2">
                            <div className="flex items-center gap-2.5 mb-3">
                              <div className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: 'var(--accent-dim)', borderRadius: '3px' }}>
                                <svg className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-[12px] font-semibold" style={{ color: 'var(--t1)' }}>Cỡ chữ</p>
                                <p className="text-[10px] mt-0.5" style={{ color: 'var(--t3)' }}>Điều chỉnh độ lớn văn bản</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {[{ val: 'sm', label: 'Nhỏ', sz: 'text-xs' }, { val: 'md', label: 'Vừa', sz: 'text-sm' }, { val: 'lg', label: 'Lớn', sz: 'text-base' }].map(({ val, label, sz }) => (
                                <button
                                  key={val}
                                  onClick={() => setFont(val)}
                                  className={`flex-1 flex flex-col items-center py-2 transition-all ${sz}`}
                                  style={
                                    font === val
                                      ? { backgroundColor: 'var(--accent)', borderRadius: '3px', border: '1px solid var(--accent)', color: 'white' }
                                      : { backgroundColor: 'var(--s2)', borderRadius: '3px', border: '1px solid var(--b2)', color: 'var(--t2)' }
                                  }
                                >
                                  <span className="font-bold">Aa</span>
                                  <span className="text-[10px] mt-0.5 font-medium">{label}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div style={{ height: '1px', backgroundColor: 'var(--b1)', margin: '2px 0' }} />

                          {/* Reduce motion */}
                          <div className="flex items-center justify-between gap-3 py-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: 'var(--accent-dim)', borderRadius: '3px' }}>
                                <svg className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-[12px] font-semibold" style={{ color: 'var(--t1)' }}>Giảm chuyển động</p>
                                <p className="text-[10px] mt-0.5" style={{ color: 'var(--t3)' }}>Tắt hiệu ứng animation</p>
                              </div>
                            </div>
                            <Toggle on={noMotion} onChange={setNoMotion} />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-1.5 text-[12px] font-bold text-white transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-h) 100%)',
                  borderRadius: '6px',
                  border: '1px solid var(--accent)',
                  boxShadow: '0 2px 8px rgba(232, 66, 10, 0.2)',
                  cursor: 'pointer',
                  fontFamily: 'Be Vietnam Pro, sans-serif'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(232, 66, 10, 0.35)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(232, 66, 10, 0.2)'
                }}
              >
                Đăng ký / Đăng nhập
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

/* ── Sub-components ── */

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative w-10 h-5 transition-colors duration-200 shrink-0"
      style={{ backgroundColor: on ? 'var(--accent)' : 'var(--b2)', borderRadius: '10px' }}
      aria-pressed={on}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`}
        style={{ borderRadius: '8px' }}
      />
    </button>
  )
}

function NavItem({ icon, label, sub, badge, arrow, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-2.5 py-2 transition-colors text-left group"
      style={{ borderRadius: '3px' }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = danger ? 'rgba(239,68,68,0.08)' : 'var(--s2)'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}

    >
      <span
        className="w-6 h-6 flex items-center justify-center shrink-0"
        style={{ color: danger ? 'var(--err)' : 'var(--t3)' }}
      >
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[12px] font-medium leading-tight" style={{ color: danger ? 'var(--err)' : 'var(--t2)' }}>
          {label}
        </span>
        {sub && <span className="block text-[10px] mt-0.5" style={{ color: 'var(--t3)' }}>{sub}</span>}
      </span>
      {badge && (
        <span
          className="text-white text-[9px] font-bold px-1.5 py-0.5 min-w-[16px] text-center"
          style={{ backgroundColor: 'var(--accent)', borderRadius: '2px' }}
        >
          {badge}
        </span>
      )}
      {arrow && (
        <svg className="w-3 h-3 shrink-0" style={{ color: 'var(--t3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  )
}

const UserIcon    = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
const OrderIcon   = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
const HeartIcon   = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
const CouponIcon  = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>
const DisplayIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
const LogoutIcon  = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
