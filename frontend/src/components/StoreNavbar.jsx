import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useNav, ROUTE_MAP } from '../hooks/useNav'
import { useAuth } from '../context/AuthContext'
import { useAccessibility } from '../hooks/useAccessibility'
import logo from '../assets/logo.png'

const SAMPLE_NOTIFICATIONS = [
  {
    id: 1,
    emoji: '📦',
    title: 'Đơn hàng đã giao thành công',
    body: 'Đơn hàng #ORD-8492 (MacBook Pro 14") đã được giao.',
    time: '2 phút trước',
    unread: true,
  },
  {
    id: 2,
    emoji: '🔥',
    title: 'Flash Sale sắp kết thúc!',
    body: 'Ưu đãi giảm đến 40% chỉ còn 3 giờ nữa.',
    time: '1 giờ trước',
    unread: true,
  },
  {
    id: 3,
    emoji: '🎁',
    title: 'Điểm thưởng sắp hết hạn',
    body: '500 điểm của bạn hết hạn vào ngày 15/06.',
    time: '1 ngày trước',
    unread: false,
  },
  {
    id: 4,
    emoji: '✅',
    title: 'Thanh toán thành công',
    body: 'Đơn hàng #ORD-8491 đã được xác nhận.',
    time: '2 ngày trước',
    unread: false,
  },
]

const TICKER_ITEMS = [
  { text: 'iPhone 15 Pro Max giảm 12% — chỉ hôm nay', icon: '⚡' },
  { text: 'Miễn phí vận chuyển toàn quốc đơn từ 500.000₫', icon: '🚚' },
  { text: 'Mua kèm tai nghe chính hãng — tiết kiệm đến 30%', icon: '🎧' },
  { text: 'Samsung Galaxy S24 Ultra mới về — trả góp 0%', icon: '📱' },
]

const NAV_LINKS = [
  { label: 'Trang chủ', page: 'home' },
  { label: 'Danh mục sản phẩm', page: 'list' },
  { label: 'Khuyến mãi', page: 'home' },
]

/* ── Hooks ── */
function useDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])
  return { open, setOpen, ref }
}

/* ── Announcement ticker ── */
function AnnouncementBar() {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % TICKER_ITEMS.length)
        setVisible(true)
      }, 280)
    }, 4000)
    return () => clearInterval(t)
  }, [])

  const item = TICKER_ITEMS[idx]

  return (
    <div style={{ backgroundColor: 'var(--ink)' }} className="border-b border-white/[0.06]">
      <div className="max-w-screen-2xl mx-auto px-8 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-4 text-[11px] text-white/70">
          <span>Hỗ trợ: <strong className="text-white font-semibold">1800-9999</strong></span>
          <span className="opacity-40">|</span>
          <span>T2–T7 · 8:00–22:00</span>
        </div>

        <p
          className="text-[12px] font-medium transition-opacity duration-300 text-center absolute left-1/2 -translate-x-1/2"
          style={{ opacity: visible ? 1 : 0 }}
        >
          <span className="mr-1.5">{item.icon}</span>
          <span className="text-white">{item.text}</span>
          <span
            className="ml-3 cursor-pointer hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            Xem ngay →
          </span>
        </p>

        <div className="flex items-center gap-4 text-[11px] text-white/70">
          <span className="cursor-pointer hover:text-white transition-colors">Tra cứu đơn hàng</span>
          <span className="opacity-40">|</span>
          <span className="cursor-pointer hover:text-white transition-colors">Cửa hàng gần nhất</span>
        </div>
      </div>
    </div>
  )
}

/* ── Main navbar ── */
export default function StoreNavbar() {
  const onNavigate = useNav()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [bellRing, setBellRing] = useState(false)
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS)

  const bell = useDropdown()
  const userMenu = useDropdown()
  const [subPanel, setSubPanel] = useState(null)
  const { dark, setDark, font, setFont, noMotion, setNoMotion } = useAccessibility()

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

  const handleSearch = (e) => {
    e.preventDefault()
    onNavigate('list')
  }

  const location = useLocation()
  const displayName = user?.name || 'Khách hàng'
  const initials = displayName.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()

  return (
    <header className="sticky top-0 z-50">
      <AnnouncementBar />

      {/* ── Main bar ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-screen-2xl mx-auto px-8 h-[80px] flex items-center gap-8">

          {/* Logo */}
          <img
            src={logo}
            alt="TechStore"
            onClick={() => onNavigate('home')}
            className="h-14 w-auto shrink-0 cursor-pointer select-none"
          />

          {/* Nav links */}
          <nav className="flex items-stretch h-full">
            {NAV_LINKS.map(({ label, page }) => {
              const active = location.pathname === ROUTE_MAP[page]
              return (
                <button
                  key={label}
                  onClick={() => onNavigate(page)}
                  className="relative flex items-center px-4 text-[15px] font-medium transition-colors h-full"
                  style={{ color: active ? 'var(--accent)' : '#6b7280' }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--ink)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#6b7280' }}
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
                className="absolute left-4 w-[18px] h-[18px] pointer-events-none transition-colors"
                style={{ color: searchFocused ? 'var(--accent)' : '#9ca3af' }}
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
                className="w-full pl-11 pr-24 py-3 text-[15px] text-gray-800 placeholder-gray-400 bg-gray-50 transition-all"
                style={{
                  border: `1px solid ${searchFocused ? 'var(--accent)' : '#e5e7eb'}`,
                  borderRadius: '4px',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                className="absolute right-0 top-0 bottom-0 px-6 text-white text-[14px] font-semibold transition-colors"
                style={{ backgroundColor: 'var(--accent)', borderRadius: '0 4px 4px 0' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-d)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
              >
                Tìm
              </button>
            </div>
          </form>

          {/* Right controls */}
          <div className="flex items-center gap-6 text-gray-500 shrink-0">

            {/* Cart */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative transition-colors hover:text-gray-900"
              aria-label="Giỏ hàng"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span
                className="absolute -top-1.5 -right-2 w-5 h-5 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                2
              </span>
            </button>

            {/* Bell */}
            <div className="relative" ref={bell.ref}>
              <button
                onClick={handleBell}
                className="relative transition-colors hover:text-gray-900"
                style={bell.open ? { color: 'var(--accent)' } : {}}
                aria-label="Thông báo"
              >
                <svg
                  className={`w-6 h-6 origin-top ${bellRing ? 'bell-ring' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2 w-5 h-5 text-white text-[9px] font-bold rounded-full flex items-center justify-center pointer-events-none"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {bell.open && (
                <div
                  className="notif-in absolute right-0 top-full mt-2 w-80 bg-white shadow-lg border border-gray-100 overflow-hidden"
                  style={{ borderRadius: '6px' }}
                >
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                    <span className="text-[13px] font-bold text-gray-900">
                      Thông báo
                      {unreadCount > 0 && (
                        <span
                          className="ml-2 px-1.5 py-0.5 text-[10px] font-bold text-white"
                          style={{ backgroundColor: 'var(--accent)', borderRadius: '3px' }}
                        >
                          {unreadCount} mới
                        </span>
                      )}
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[12px] font-medium hover:underline"
                        style={{ color: 'var(--accent)' }}
                      >
                        Đọc tất cả
                      </button>
                    )}
                  </div>

                  <ul className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                    {notifications.map(n => (
                      <li
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className="flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                        style={n.unread ? { backgroundColor: 'rgba(232,66,10,0.04)' } : {}}
                      >
                        <span className="text-xl shrink-0 mt-0.5">{n.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[13px] leading-snug ${n.unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {n.title}
                          </p>
                          <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                          <p className="text-[11px] text-gray-400 mt-1">{n.time}</p>
                        </div>
                        {n.unread && (
                          <span
                            className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                            style={{ backgroundColor: 'var(--accent)' }}
                          />
                        )}
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-gray-100 px-4 py-2.5 text-center">
                    <button
                      className="text-[12px] font-medium hover:underline"
                      style={{ color: 'var(--accent)' }}
                    >
                      Xem tất cả thông báo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User avatar */}
            <div className="relative" ref={userMenu.ref}>
              <button
                onClick={handleUserMenu}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[14px] font-bold transition-all"
                style={{
                  backgroundColor: userMenu.open ? 'var(--accent)' : 'var(--ink)',
                  outline: userMenu.open ? '2px solid var(--accent)' : '2px solid transparent',
                  outlineOffset: '2px',
                }}
                aria-label="Tài khoản"
              >
                {user ? initials : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </button>

              {userMenu.open && (
                <div
                  className="notif-in absolute right-0 top-full mt-2 w-72 bg-white border border-gray-100 shadow-lg overflow-hidden"
                  style={{ borderRadius: '6px' }}
                >
                  {/* Dark header — replaces blue-to-indigo gradient */}
                  <div className="px-4 pt-4 pb-3.5" style={{ backgroundColor: 'var(--ink)' }}>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-[14px] shrink-0"
                        style={{
                          backgroundColor: 'var(--accent)',
                          boxShadow: '0 0 0 3px rgba(232,66,10,0.25)',
                        }}
                      >
                        {user ? initials : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold text-white leading-tight truncate">{displayName}</p>
                        {user?.email && (
                          <p className="text-[12px] mt-0.5 truncate" style={{ color: '#4a5268' }}>{user.email}</p>
                        )}
                      </div>
                    </div>
                    {user && (
                      <div
                        className="mt-3 flex items-center justify-between px-3 py-2"
                        style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '4px' }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span style={{ color: 'var(--accent)' }}>★</span>
                          <span className="text-white text-[12px] font-medium">Thành viên Bạc</span>
                        </div>
                        <span className="text-[12px] font-semibold" style={{ color: 'var(--accent)' }}>
                          1.250 điểm
                        </span>
                      </div>
                    )}
                  </div>

                  {subPanel === null ? (
                    <>
                      <div className="p-2 border-b border-gray-100">
                        <NavItem
                          onClick={() => { onNavigate('userProfile'); userMenu.setOpen(false) }}
                          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                          label="Trang cá nhân"
                          sub="Xem và chỉnh sửa thông tin"
                        />
                        <NavItem
                          onClick={() => { onNavigate('userProfile'); userMenu.setOpen(false) }}
                          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                          label="Đơn hàng của tôi"
                          badge="2"
                        />
                        <NavItem
                          onClick={() => { onNavigate('userProfile'); userMenu.setOpen(false) }}
                          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
                          label="Danh sách yêu thích"
                        />
                        <NavItem
                          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>}
                          label="Mã giảm giá của tôi"
                          badge="5"
                        />
                      </div>

                      <div className="p-2 border-b border-gray-100">
                        <NavItem
                          onClick={() => setSubPanel('display')}
                          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
                          label="Màn hình & trợ năng"
                          arrow
                        />
                      </div>

                      <div className="p-2">
                        <NavItem
                          onClick={() => { userMenu.setOpen(false); onNavigate('login') }}
                          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>}
                          label="Đăng xuất"
                          danger
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-100">
                        <button
                          onClick={() => setSubPanel(null)}
                          className="w-7 h-7 bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
                          style={{ borderRadius: '4px' }}
                        >
                          <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <span className="font-bold text-[14px] text-gray-800">Màn hình & trợ năng</span>
                      </div>

                      <div className="p-4 space-y-1">
                        {/* Dark mode */}
                        <div className="flex items-center justify-between gap-3 py-2 px-1">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-7 h-7 flex items-center justify-center shrink-0"
                              style={{ backgroundColor: 'rgba(232,66,10,0.08)', borderRadius: '4px' }}
                            >
                              <svg className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-gray-800 leading-tight">Chế độ tối</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">Bảo vệ mắt ban đêm</p>
                            </div>
                          </div>
                          <Toggle on={dark} onChange={setDark} />
                        </div>

                        <div className="h-px bg-gray-100 mx-1" />

                        {/* Font size */}
                        <div className="py-2 px-1">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div
                              className="w-7 h-7 flex items-center justify-center shrink-0"
                              style={{ backgroundColor: 'rgba(232,66,10,0.08)', borderRadius: '4px' }}
                            >
                              <svg className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-gray-800 leading-tight">Cỡ chữ</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">Điều chỉnh độ lớn văn bản</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {[
                              { val: 'sm', label: 'Nhỏ', sz: 'text-xs' },
                              { val: 'md', label: 'Vừa', sz: 'text-sm' },
                              { val: 'lg', label: 'Lớn', sz: 'text-base' },
                            ].map(({ val, label, sz }) => (
                              <button
                                key={val}
                                onClick={() => setFont(val)}
                                className={`flex-1 flex flex-col items-center py-2 border transition-all ${font === val ? 'text-white' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}
                                style={
                                  font === val
                                    ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', borderRadius: '4px' }
                                    : { borderRadius: '4px' }
                                }
                              >
                                <span className={`font-bold ${sz}`}>Aa</span>
                                <span className="text-[10px] mt-1 font-medium">{label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="h-px bg-gray-100 mx-1" />

                        {/* Reduce motion */}
                        <div className="flex items-center justify-between gap-3 py-2 px-1">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-7 h-7 flex items-center justify-center shrink-0"
                              style={{ backgroundColor: 'rgba(232,66,10,0.08)', borderRadius: '4px' }}
                            >
                              <svg className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-gray-800 leading-tight">Giảm chuyển động</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">Tắt hiệu ứng animation</p>
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
      className="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0"
      style={{ backgroundColor: on ? 'var(--accent)' : '#e5e7eb' }}
      aria-pressed={on}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  )
}

function NavItem({ icon, label, sub, badge, arrow, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 transition-colors text-left group ${danger ? 'hover:bg-red-50' : 'hover:bg-gray-50'}`}
      style={{ borderRadius: '4px' }}
    >
      <span
        className={`w-7 h-7 flex items-center justify-center shrink-0 transition-colors ${danger ? 'text-red-400' : 'text-gray-400 group-hover:text-gray-700'}`}
      >
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className={`block text-[13px] font-medium leading-tight ${danger ? 'text-red-600' : 'text-gray-700'}`}>
          {label}
        </span>
        {sub && <span className="block text-[11px] text-gray-400 mt-0.5">{sub}</span>}
      </span>
      {badge && (
        <span
          className="text-white text-[10px] font-bold px-1.5 py-0.5 min-w-[18px] text-center"
          style={{ backgroundColor: 'var(--accent)', borderRadius: '3px' }}
        >
          {badge}
        </span>
      )}
      {arrow && (
        <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  )
}
