import { useState, useEffect, useRef } from 'react'
import { useNav } from '../hooks/useNav'
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

function ChevronRight() {
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

export default function StoreNavbar() {
  const onNavigate = useNav()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
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

  const displayName = user?.name || 'Khách hàng'
  const initials = displayName.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">

      <div className="max-w-screen-2xl mx-auto px-10 h-28 flex items-center gap-12">

        {/* Logo */}
        <img
          src={logo}
          alt="TechStore"
          onClick={() => onNavigate('home')}
          className="h-24 w-auto shrink-0 cursor-pointer select-none"
        />

        {/* Nav links */}
        <nav className="flex items-center gap-8 text-[15px] font-medium">
          <span onClick={() => onNavigate('list')} className="text-blue-600 underline decoration-blue-600 decoration-2 underline-offset-4 cursor-pointer leading-5">
            Categories
          </span>
          <span className="text-gray-600 hover:text-gray-900 cursor-pointer leading-5">Deals</span>
          <span className="text-gray-600 hover:text-gray-900 cursor-pointer leading-5">Support</span>
        </nav>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 mx-4 max-w-2xl">
          <div className="relative flex items-center">
            <svg className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products, brands..."
              className="w-full pl-12 pr-28 py-3 text-[15px] border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent focus:bg-white transition-all"
            />
            <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 px-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
              Search
            </button>
          </div>
        </form>

        {/* Right icons */}
        <div className="flex items-center gap-6 text-gray-600">

          {/* Cart */}
          <button className="relative hover:text-gray-900" onClick={() => onNavigate('cart')}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">2</span>
          </button>

          {/* Bell */}
          <div className="relative" ref={bell.ref}>
            <button onClick={handleBell} className={`relative transition-colors hover:text-gray-900 ${bell.open ? 'text-blue-600' : ''}`}>
              <svg className={`w-6 h-6 origin-top ${bellRing ? 'bell-ring' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center pointer-events-none">
                  {unreadCount}
                </span>
              )}
            </button>

            {bell.open && (
              <div className="notif-in absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-900">
                    Thông báo
                    {unreadCount > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded-full">{unreadCount} mới</span>
                    )}
                  </span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Đọc tất cả</button>
                  )}
                </div>
                <ul className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                  {notifications.map(n => (
                    <li key={n.id} onClick={() => markRead(n.id)} className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 ${n.unread ? 'bg-blue-50/40' : ''}`}>
                      <span className="text-xl shrink-0 mt-0.5">{n.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] leading-snug ${n.unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>{n.title}</p>
                        <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                        <p className="text-[11px] text-gray-400 mt-1">{n.time}</p>
                      </div>
                      {n.unread && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />}
                    </li>
                  ))}
                </ul>
                <div className="border-t border-gray-100 px-4 py-2.5 text-center">
                  <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Xem tất cả thông báo</button>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenu.ref}>
            <button
              onClick={handleUserMenu}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold transition-all ring-2 ring-offset-1 ${userMenu.open ? 'bg-blue-600 ring-blue-400' : 'bg-gray-800 ring-transparent hover:ring-gray-300'}`}
            >
              {user ? initials : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </button>

            {userMenu.open && (
              <div className="notif-in absolute right-0 top-full mt-3 w-72 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">

                {/* ── User header (gradient) ── */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-4 pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/25 flex items-center justify-center text-white font-bold text-base ring-2 ring-white/30 shrink-0">
                      {user ? initials : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-bold text-white leading-tight truncate">{displayName}</p>
                      {user?.email && <p className="text-[12px] text-blue-100 mt-0.5 truncate">{user.email}</p>}
                    </div>
                  </div>
                  {user && (
                    <div className="mt-3 flex items-center justify-between bg-white/15 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-yellow-300">★</span>
                        <span className="text-white text-[12px] font-medium">Thành viên Bạc</span>
                      </div>
                      <span className="text-blue-100 text-[12px] font-semibold">1,250 điểm</span>
                    </div>
                  )}
                </div>

                {subPanel === null ? (
                  <>
                    {/* ── Quick links ── */}
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

                    {/* ── Settings ── */}
                    <div className="p-2 border-b border-gray-100">
                      <NavItem
                        onClick={() => setSubPanel('display')}
                        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
                        label="Màn hình & trợ năng"
                        arrow
                      />
                    </div>

                    {/* ── Logout ── */}
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
                    {/* ── Display & Accessibility Panel ── */}
                    <div className="flex items-center gap-3 px-3 py-3 border-b border-gray-100">
                      <button
                        onClick={() => setSubPanel(null)}
                        className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <span className="font-bold text-[14px] text-gray-800">Màn hình & trợ năng</span>
                    </div>

                    <div className="p-4 space-y-1">
                      {/* Dark mode */}
                      <div className="flex items-center justify-between gap-3 py-2.5 px-1">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <div className="py-2.5 px-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                              className={`flex-1 flex flex-col items-center py-2.5 rounded-xl border-2 transition-all ${
                                font === val
                                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                                  : 'border-gray-100 bg-gray-50 hover:border-blue-200 text-gray-500'
                              }`}
                            >
                              <span className={`font-bold ${sz}`}>Aa</span>
                              <span className="text-[10px] mt-1 font-medium">{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="h-px bg-gray-100 mx-1" />

                      {/* Reduce motion */}
                      <div className="flex items-center justify-between gap-3 py-2.5 px-1">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </header>
  )
}

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${on ? 'bg-blue-500' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

function NavItem({ icon, label, sub, badge, arrow, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left group ${danger ? 'hover:bg-red-50' : 'hover:bg-blue-50'}`}
    >
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
        danger
          ? 'bg-red-50 text-red-500 group-hover:bg-red-100'
          : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
      }`}>{icon}</span>
      <span className="flex-1 min-w-0">
        <span className={`block text-[13px] font-medium leading-tight ${danger ? 'text-red-600' : 'text-gray-700 group-hover:text-blue-700'}`}>{label}</span>
        {sub && <span className="block text-[11px] text-gray-400 mt-0.5">{sub}</span>}
      </span>
      {badge && <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{badge}</span>}
      {arrow && <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
    </button>
  )
}

function MenuItem({ icon, label, sub, hasArrow, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-left"
    >
      <span className="w-9 h-9 rounded-full bg-[#3a3b3c] flex items-center justify-center shrink-0">
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[13px] font-medium text-white leading-tight">{label}</span>
        {sub && <span className="block text-[11px] text-gray-400 mt-0.5">{sub}</span>}
      </span>
      {hasArrow && <ChevronRight />}
    </button>
  )
}
