import { useState, useEffect, useRef } from 'react'
import { apiFetch } from '../services/api'
import { useAccessibility } from '../hooks/useAccessibility'

function Toggle({ on, onChange, label }) {
  return (
    <button type="button"
      onClick={() => onChange(!on)}
      className="relative w-10 h-5 transition-colors duration-200 shrink-0 border-none cursor-pointer"
      style={{ backgroundColor: on ? 'var(--accent)' : 'var(--b2)', borderRadius: '10px' }}
      aria-pressed={on}
      aria-label={label}
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
    <button type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-2.5 py-2 transition-colors text-left group border-none cursor-pointer bg-transparent"
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

const getMembershipTierLabel = (tier) => {
  switch (tier) {
    case 'STANDARD': return 'Thành viên Đồng'
    case 'SILVER':   return 'Thành viên Bạc'
    case 'GOLD':     return 'Thành viên Vàng'
    case 'PLATINUM': return 'Thành viên Bạch Kim'
    default:         return 'Thành viên Đồng'
  }
}

export default function UserMenuDropdown({ user, onNavigate }) {
  const [open, setOpen] = useState(false)
  const [subPanel, setSubPanel] = useState(null)
  const [membership, setMembership] = useState(null)
  const [ordersCount, setOrdersCount] = useState(0)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [couponsCount, setCouponsCount] = useState(0)

  const dropdownRef = useRef(null)
  const { dark, setDark, font, setFont, noMotion, setNoMotion } = useAccessibility()

  useEffect(() => {
    if (!open) {
      setSubPanel(null)
      return
    }
    const handle = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      setMembership(null)
      setOrdersCount(0)
      setFavoritesCount(0)
      setCouponsCount(0)
      return
    }

    apiFetch('/api/customer/membership')
      .then(data => setMembership(data))
      .catch(err => console.error('Error fetching membership:', err))

    apiFetch('/api/customer/orders')
      .then(data => setOrdersCount(data?.items?.length ?? 0))
      .catch(err => console.error('Error fetching orders:', err))

    const fetchFavoritesCount = () => {
      apiFetch('/api/customer/favorites?page=0&size=1')
        .then(data => setFavoritesCount(data.totalItems ?? 0))
        .catch(err => console.error('Error fetching favorites:', err))
    }
    fetchFavoritesCount()
    window.addEventListener('favorites_changed', fetchFavoritesCount)

    apiFetch('/api/customer/coupons/mine')
      .then(data => setCouponsCount(data.length ?? 0))
      .catch(err => console.error('Error fetching coupons:', err))

    return () => {
      window.removeEventListener('favorites_changed', fetchFavoritesCount)
    }
  }, [user])

  const displayName = user?.name || 'Khách hàng'
  const initials = displayName.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()
  const points = membership ? Math.floor((membership.totalSpent || 0) / 10000) : 0

  return (
    <div className="relative" ref={dropdownRef}>
      <button type="button"
        onClick={() => setOpen(prev => !prev)}
        className="w-8 h-8 flex items-center justify-center text-white text-[12px] font-bold transition-colors border-none cursor-pointer"
        style={{
          backgroundColor: open ? 'var(--accent)' : 'var(--s3)',
          border: `1px solid ${open ? 'var(--accent)' : 'var(--b2)'}`,
          borderRadius: '6px',
        }}
        aria-label="Tài khoản"
      >
        {initials}
      </button>

      {open && (
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
                <span style={{ color: 'var(--accent)' }}>★</span> {getMembershipTierLabel(membership?.tier)}
              </span>
              <span className="text-[11px] font-bold" style={{ color: 'var(--accent)' }}>
                {points.toLocaleString('vi-VN')} điểm
              </span>
            </div>
          </div>

          {subPanel === null ? (
            <>
              <div className="p-2" style={{ borderBottom: '1px solid var(--b1)' }}>
                <NavItem onClick={() => { onNavigate('userProfile'); setOpen(false) }} icon={<UserIcon />} label="Trang cá nhân" sub="Xem và chỉnh sửa thông tin" />
                <NavItem onClick={() => { onNavigate('customerOrders'); setOpen(false) }} icon={<OrderIcon />} label="Đơn hàng của tôi" badge={ordersCount > 0 ? String(ordersCount) : undefined} />
                <NavItem onClick={() => { onNavigate('userProfile', { search: '?tab=wishlist' }); setOpen(false) }} icon={<HeartIcon />} label="Sản phẩm yêu thích" badge={favoritesCount > 0 ? String(favoritesCount) : undefined} />
                <NavItem onClick={() => { onNavigate('userProfile', { search: '?tab=coupons' }); setOpen(false) }} icon={<CouponIcon />} label="Mã giảm giá của tôi" badge={couponsCount > 0 ? String(couponsCount) : undefined} />
              </div>
              <div className="p-2" style={{ borderBottom: '1px solid var(--b1)' }}>
                <NavItem onClick={() => setSubPanel('display')} icon={<DisplayIcon />} label="Màn hình & trợ năng" arrow />
              </div>
              <div className="p-2">
                <NavItem onClick={() => { setOpen(false); onNavigate('login') }} icon={<LogoutIcon />} label="Đăng xuất" danger />
              </div>
            </>
          ) : (
            <>
              <div
                className="flex items-center gap-3 px-3 py-2.5"
                style={{ borderBottom: '1px solid var(--b1)' }}
              >
                <button type="button"
                  onClick={() => setSubPanel(null)}
                  className="w-6 h-6 flex items-center justify-center transition-colors border-none cursor-pointer"
                  style={{ backgroundColor: 'var(--s2)', borderRadius: '3px' }}
                  aria-label="Quay lại"
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
                  <Toggle on={dark} onChange={setDark} label="Chế độ tối" />
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
                      <button key={val}
                        type="button"
                        onClick={() => setFont(val)}
                        aria-label={`Cỡ chữ ${label}`}
                        className={`flex-1 flex flex-col items-center py-2 transition-colors ${sz} border-none cursor-pointer`}
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
                  <Toggle on={noMotion} onChange={setNoMotion} label="Giảm chuyển động" />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
