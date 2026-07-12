import { useState, useEffect } from 'react'
import { useNav } from '../../../hooks/useNav'
import StoreNavbar from '../../../components/StoreNavbar'
import { apiFetch } from '../../../services/api'
import OverviewSection from '../components/OverviewSection'
import OrdersSection from '../components/OrdersSection'
import WishlistSection from '../components/WishlistSection'
import MembershipSection from '../components/MembershipSection'
import CouponsSection from '../components/CouponsSection'
import AccountSection from '../components/AccountSection'
import AddressSection from '../components/AddressSection'
import PaymentSection from '../components/PaymentSection'
import SupportSection from '../components/SupportSection'

/* ── Static data ─────────────────────────────────────────────── */

const BANNERS_INIT = [
  { id: 1, text: 'Thêm địa chỉ để đặt đơn hàng nhanh hơn.', cta: 'Thêm địa chỉ', action: 'address' },
  { id: 2, text: 'Liên kết thẻ ngân hàng để thanh toán nhanh hơn.', cta: 'Liên kết ngay', action: 'payment' },
]

const SIDEBAR_ITEMS = [
  { id: 'overview',   label: 'Tổng quan',                icon: 'home'     },
  { id: 'orders',     label: 'Lịch sử mua hàng',         icon: 'orders'   },
  { id: 'wishlist',   label: 'Sản phẩm yêu thích',       icon: 'heart'    },
  { id: 'warranty',   label: 'Tra cứu bảo hành',         icon: 'warranty' },
  { id: 'membership', label: 'Hạng thành viên & ưu đãi', icon: 'star'     },
  null,
  { id: 'account',    label: 'Thông tin tài khoản',      icon: 'user'     },
  { id: 'address',    label: 'Sổ địa chỉ',               icon: 'location' },
  { id: 'payment',    label: 'Phương thức thanh toán',   icon: 'card' },
  { id: 'coupons',    label: 'Mã giảm giá',              icon: 'coupon'   },
  null,
  { id: 'support',    label: 'Hỗ trợ & Phản hồi',       icon: 'help'     },
  { id: 'logout',     label: 'Đăng xuất',                icon: 'logout',   action: 'login'          },
]

const QUICK_TABS = [
  { id: 'membership', label: 'Hạng thành viên' },
  { id: 'wishlist',   label: 'Yêu thích'        },
  { id: 'coupons',    label: 'Mã giảm giá'     },
  { id: 'orders',     label: 'Lịch sử mua hàng'},
  { id: 'address',    label: 'Sổ địa chỉ' },
  { id: 'payment',    label: 'Thanh toán' },
]

function formatVnd(value) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ'
}

/* ── Helpers ─────────────────────────────────────────────────── */

const ICON_PATHS = {
  home:     'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  orders:   'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  warranty: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  star:     'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  user:     'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  location: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
  card:     'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  coupon:   'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z',
  help:     'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  logout:   'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
}

function SvgIcon({ name, className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={ICON_PATHS[name]} />
    </svg>
  )
}

/* ── Main component ──────────────────────────────────────────── */

export default function UserProfilePage() {
  const onNavigate = useNav()
  const [activeSection, setActiveSection] = useState('overview')
  const [banners, setBanners] = useState(BANNERS_INIT)
  const [profile, setProfile] = useState(null)
  const [membership, setMembership] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProfileAndData = () => {
    Promise.all([
      apiFetch('/api/customer/profile').catch(() => null),
      apiFetch('/api/customer/membership').catch(() => null),
      apiFetch('/api/customer/orders').catch(() => null),
    ])
      .then(([prof, memb, ords]) => {
        if (prof) setProfile(prof)
        if (memb) setMembership(memb)
        if (ords) setOrders(ords)
      })
      .catch(err => console.error('Error fetching user profile info:', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProfileAndData()
  }, [])

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const handleSidebarClick = (item) => {
    if (item.action) onNavigate(item.action)
    else setActiveSection(item.id)
  }

  const handleViewAllOrders = (sectionId) => setActiveSection(sectionId)

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen" style={{ backgroundColor: 'var(--page)' }}>
        <StoreNavbar />
        <div className="flex-1 flex items-center justify-center py-20 text-center text-gray-400 text-sm">
          Đang tải dữ liệu hồ sơ cá nhân...
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{ backgroundColor: 'var(--page)' }}>
      <StoreNavbar />

      {/* ── Hero banner ─────────────────────────────────────────── */}
      <div style={{ backgroundColor: 'var(--ink)', borderBottom: '1px solid var(--b1)' }}>
        <div className="max-w-screen-2xl mx-auto px-8">

          {/* Profile row */}
          <div className="flex items-center gap-8 py-7">

            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#E8420A] to-[#c93808] flex items-center justify-center text-white text-3xl font-black ring-4 shadow-lg" style={{ ringColor: 'rgba(255,255,255,0.15)' }}>
                {getInitials(profile?.fullName)}
              </div>
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
            </div>

            {/* Name + meta */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: 'var(--accent)' }}>Hồ sơ thành viên</p>
              </div>
              <h1 className="text-2xl font-black leading-tight" style={{ color: 'white', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                {profile?.fullName || 'Đang tải...'}
              </h1>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {profile?.phone ? profile.phone.replace(/^(\d{3})\d{4}(\d{2})$/, '$1·····$2') : '—'} · {profile?.email || '—'}
              </p>
              <div className="flex items-center gap-2 mt-2.5">
                <span className="px-3 py-1 text-xs font-black rounded" style={{ backgroundColor: 'rgba(232,66,10,0.15)', color: 'var(--accent)', border: '1px solid rgba(232,66,10,0.3)' }}>T-MEM</span>
                <span className="px-3 py-1 text-xs font-black text-white rounded" style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  {membership?.tier || 'STANDARD'}
                </span>
                <span className="px-3 py-1 text-xs font-semibold rounded" style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }}>Đã xác minh</span>
              </div>
            </div>

            {/* Edit button */}
            <button 
              onClick={() => setActiveSection('account')}
              className="ml-auto flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded transition-colors shrink-0"
              style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'white', backgroundColor: 'rgba(255,255,255,0.06)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'white' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Chỉnh sửa hồ sơ
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 pb-6">
            {/* Orders count */}
            <div className="rounded px-5 py-4 flex items-center gap-4" style={{ backgroundColor: 'rgba(232,66,10,0.1)', border: '1px solid rgba(232,66,10,0.2)' }}>
              <div className="w-12 h-12 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--accent)' }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-black leading-none" style={{ color: 'var(--accent)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                  {orders.length}
                </p>
                <p className="text-xs font-medium mt-1" style={{ color: 'rgba(232,66,10,0.7)' }}>Tổng đơn hàng</p>
              </div>
            </div>

            {/* Spend */}
            <div className="rounded px-5 py-4 flex items-center gap-4" style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div className="w-12 h-12 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: '#16a34a' }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-black leading-none" style={{ color: '#4ade80', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                  {formatVnd(membership?.totalSpent || 0)}
                </p>
                <p className="text-xs font-medium mt-1" style={{ color: 'rgba(74,222,128,0.7)' }}>Tổng tiền tích lũy</p>
              </div>
            </div>

            {/* Points */}
            <div className="rounded px-5 py-4 flex items-center gap-4" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="w-12 h-12 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={ICON_PATHS.star} />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-black leading-none" style={{ color: 'white', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                  {membership ? Math.floor(membership.totalSpent / 100000) : 0}
                </p>
                <p className="text-xs font-medium mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Điểm thành viên</p>
              </div>
            </div>

            {/* Level progress */}
            <div className="rounded px-5 py-4" style={{ backgroundColor: 'rgba(232,66,10,0.1)', border: '1px solid rgba(232,66,10,0.2)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>
                  Tiến trình lên hạng {membership?.nextTier || 'Cao nhất'}
                </span>
                <span className="text-xs font-black" style={{ color: 'var(--accent)' }}>
                  {membership?.nextTierMinSpending
                    ? `${Math.min(100, Math.round((membership.totalSpent / membership.nextTierMinSpending) * 100))}%`
                    : '100%'}
                </span>
              </div>
              <div className="w-full rounded-full h-2.5 mb-2" style={{ backgroundColor: 'rgba(232,66,10,0.2)' }}>
                <div className="h-2.5 rounded-full" style={{ 
                  width: membership?.nextTierMinSpending
                    ? `${Math.min(100, Math.round((membership.totalSpent / membership.nextTierMinSpending) * 100))}%`
                    : '100%',
                  backgroundColor: 'var(--accent)' 
                }} />
              </div>
              <p className="text-xs" style={{ color: 'rgba(232,66,10,0.8)' }}>
                {membership?.nextTierMinSpending && membership.nextTierMinSpending > membership.totalSpent ? (
                  <>Cần thêm <span className="font-black">{formatVnd(membership.nextTierMinSpending - membership.totalSpent)}</span> để lên hạng tiếp</>
                ) : (
                  <span>Đã đạt hạng cao nhất</span>
                )}
              </p>
            </div>
          </div>

          {/* Quick nav tabs */}
          <div className="flex items-center gap-1 -mb-px overflow-x-auto">
            {QUICK_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => tab.action ? onNavigate(tab.action) : setActiveSection(tab.id)}
                className="shrink-0 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
                style={{
                  borderBottomColor: activeSection === tab.id ? 'var(--accent)' : 'transparent',
                  color: activeSection === tab.id ? 'var(--accent)' : 'rgba(255,255,255,0.6)',
                }}
                onMouseEnter={e => { if (activeSection !== tab.id) { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.3)' } }}
                onMouseLeave={e => { if (activeSection !== tab.id) { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderBottomColor = 'transparent' } }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="max-w-screen-2xl mx-auto w-full px-8 py-7">
        <div className="grid grid-cols-[280px_1fr_300px] gap-6 items-start">

          {/* Left sidebar */}
          <aside className="overflow-hidden sticky top-24" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(15,23,42,0.02)' }}>
            <ul className="py-3">
              {SIDEBAR_ITEMS.map((item, i) => {
                if (!item) return <li key={i} className="my-2 mx-4" style={{ borderTop: '1px solid var(--b1)' }} />
                const isActive = activeSection === item.id && !item.action
                const isLogout = item.id === 'logout'
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleSidebarClick(item)}
                      className="w-full flex items-center gap-3.5 text-sm transition-all text-left"
                      style={isActive
                        ? { backgroundColor: 'rgba(232,66,10,0.06)', color: 'var(--accent)', fontWeight: '700', borderLeft: '3px solid var(--accent)', paddingLeft: '17px', paddingRight: '20px', paddingTop: '12px', paddingBottom: '12px' }
                        : isLogout
                          ? { color: 'var(--err)', padding: '12px 20px' }
                          : { color: 'var(--t2)', padding: '12px 20px' }
                      }
                      onMouseEnter={e => { if (!isActive && !isLogout) { e.currentTarget.style.backgroundColor = 'var(--page)'; e.currentTarget.style.color = 'var(--t1)' } }}
                      onMouseLeave={e => { if (!isActive && !isLogout) { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--t2)' } }}
                    >
                      <SvgIcon
                        name={item.icon}
                        className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#E8420A]' : isLogout ? 'text-red-400' : 'opacity-60'}`}
                      />
                      <span>{item.label}</span>
                      {isActive && (
                        <svg className="w-4 h-4 text-[#E8420A] ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </aside>

          {/* Center content */}
          <div className={`min-w-0 ${['orders','wishlist','membership','coupons','account','address','payment','support'].includes(activeSection) ? 'col-span-2' : ''}`}>
            {activeSection === 'orders' ? (
              <OrdersSection orders={orders} onNavigate={onNavigate} />
            ) : activeSection === 'wishlist' ? (
              <WishlistSection />
            ) : activeSection === 'membership' ? (
              <MembershipSection />
            ) : activeSection === 'coupons' ? (
              <CouponsSection />
            ) : activeSection === 'account' ? (
              <AccountSection profile={profile} onProfileUpdate={fetchProfileAndData} />
            ) : activeSection === 'address' ? (
              <AddressSection profile={profile} />
            ) : activeSection === 'payment' ? (
              <PaymentSection />
            ) : activeSection === 'support' ? (
              <SupportSection />
            ) : (
              <OverviewSection
                banners={banners}
                onDismiss={id => setBanners(prev => prev.filter(b => b.id !== id))}
                onNavigate={(key) => {
                  if (['orders', 'address', 'payment'].includes(key)) handleViewAllOrders(key)
                  else onNavigate(key)
                }}
              />
            )}
          </div>

          {/* Right column */}
          <div className="space-y-5 sticky top-24">

            {/* Support tips — chỉ hiện khi ở tab support */}
            {activeSection === 'support' && (
              <div className="space-y-4">
                {/* Working hours */}
                <div className="bg-white border border-gray-200 rounded p-5 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-900 mb-4">Giờ làm việc</h4>
                  <div className="space-y-3">
                    {[
                      { day: 'Thứ 2 – Thứ 6', time: '8:00 – 22:00', active: true  },
                      { day: 'Thứ 7',           time: '8:00 – 20:00', active: true  },
                      { day: 'Chủ nhật',        time: '9:00 – 18:00', active: false },
                    ].map((r, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">{r.day}</span>
                        <span className={`font-bold ${r.active ? 'text-green-600' : 'text-orange-500'}`}>{r.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded px-3 py-2.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                    <span className="text-xs font-bold text-green-700">Đang trong giờ làm việc</span>
                  </div>
                </div>

                {/* SLA */}
                <div className="bg-gray-50 border border-gray-200 rounded p-5">
                  <h4 className="text-sm font-bold text-gray-800 mb-3">Cam kết phản hồi</h4>
                  <div className="space-y-2.5">
                    {[
                      { channel: 'Live Chat',  time: '< 5 phút',  icon: '💬' },
                      { channel: 'Hotline',    time: '< 3 phút',  icon: '📞' },
                      { channel: 'Phiếu hỗ trợ', time: '< 24 giờ', icon: '🎫' },
                      { channel: 'Email',      time: '< 48 giờ', icon: '📧' },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-gray-700 font-medium flex items-center gap-1.5">
                          <span>{s.icon}</span>{s.channel}
                        </span>
                        <span className="font-black text-gray-900 bg-white border border-gray-200 px-2 py-0.5 rounded">{s.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Useful links */}
                <div className="bg-white border border-gray-200 rounded p-5 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Liên kết hữu ích</h4>
                  <div className="space-y-2">
                    {[
                      'Chính sách đổi trả',
                      'Chính sách bảo hành',
                      'Hướng dẫn mua hàng',
                      'Điều khoản sử dụng',
                    ].map((link, i) => (
                      <button key={i} className="w-full flex items-center justify-between text-sm text-[#E8420A] hover:text-[#c93808] font-medium py-1 transition-colors text-left">
                        {link}
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Payment tips — chỉ hiện khi ở tab payment */}
            {activeSection === 'payment' && (
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded p-5 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-900 mb-4">Phương thức được chấp nhận</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'Visa / Mastercard / JCB', desc: 'Thẻ tín dụng & ghi nợ quốc tế', color: 'bg-gray-50 border-gray-200' },
                      { name: 'MoMo & ZaloPay',           desc: 'Ví điện tử phổ biến',          color: 'bg-pink-50 border-pink-100'  },
                      { name: 'VNPay',                    desc: 'Thanh toán qua QR code',       color: 'bg-red-50 border-red-100'    },
                      { name: 'COD',                      desc: 'Thanh toán khi nhận hàng',     color: 'bg-green-50 border-green-100'},
                    ].map((m, i) => (
                      <div key={i} className={`flex items-start gap-3 p-3 rounded border ${m.color}`}>
                        <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <div>
                          <p className="text-xs font-bold text-gray-800">{m.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded p-5">
                  <h4 className="text-sm font-bold text-amber-800 mb-2">Lưu ý bảo mật</h4>
                  <ul className="space-y-2">
                    {[
                      'Không chia sẻ thông tin thẻ với bất kỳ ai',
                      'Luôn kiểm tra địa chỉ website trước khi nhập thẻ',
                      'Bật thông báo giao dịch từ ngân hàng',
                    ].map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-amber-700">
                        <span className="mt-0.5 shrink-0">⚠️</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Address tips — chỉ hiện khi ở tab address */}
            {activeSection === 'address' && (
              <div className="bg-white border border-gray-200 rounded p-5 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-gray-900">Lưu ý về địa chỉ</h4>
                <ul className="space-y-3">
                  {[
                    { icon: '📍', text: 'Tối đa 5 địa chỉ có thể lưu trong sổ địa chỉ' },
                    { icon: '⭐', text: 'Địa chỉ mặc định sẽ được tự động chọn khi đặt hàng' },
                    { icon: '✏️', text: 'Bạn có thể thay đổi địa chỉ giao hàng ngay tại trang xác nhận đơn' },
                    { icon: '🔒', text: 'Thông tin địa chỉ được bảo mật và chỉ dùng cho giao hàng' },
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-gray-600">
                      <span className="shrink-0 mt-0.5">{tip.icon}</span>
                      <span>{tip.text}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-bold text-gray-700 mb-2">Hỗ trợ giao hàng</p>
                  <div className="space-y-1.5">
                    {['Giao hàng toàn quốc 63 tỉnh thành', 'Giao hỏa tốc nội thành HN & HCM', 'Miễn phí ship đơn từ 500.000đ'].map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                        <svg className="w-3.5 h-3.5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Account tips — chỉ hiện khi ở tab account */}
            {activeSection === 'account' && (
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="text-sm font-bold text-gray-800">Gợi ý bảo mật</h4>
                  </div>
                  <ul className="space-y-2.5">
                    {[
                      'Sử dụng mật khẩu dài ít nhất 8 ký tự, kết hợp chữ và số',
                      'Bật xác thực 2 bước để bảo vệ tài khoản',
                      'Không chia sẻ mật khẩu với người khác',
                      'Kiểm tra thiết bị đăng nhập thường xuyên',
                    ].map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                        <svg className="w-3.5 h-3.5 text-gray-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded p-5 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Độ hoàn chỉnh hồ sơ</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Ảnh đại diện', done: true  },
                      { label: 'Họ và tên',     done: true  },
                      { label: 'Số điện thoại', done: true  },
                      { label: 'Email',          done: true  },
                      { label: 'Ngày sinh',      done: true  },
                      { label: 'Giới thiệu bản thân', done: false },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${item.done ? 'bg-green-500' : 'bg-gray-200'}`}>
                          {item.done && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-xs font-medium ${item.done ? 'text-gray-600' : 'text-gray-400'}`}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Mức độ hoàn chỉnh</span>
                      <span className="font-bold text-green-600">83%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '83%' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Membership card */}
            {activeSection !== 'orders' && activeSection !== 'wishlist' && activeSection !== 'membership' && activeSection !== 'coupons' && activeSection !== 'account' && activeSection !== 'address' && activeSection !== 'payment' && activeSection !== 'support' && (
              <div className="rounded overflow-hidden shadow-sm border border-gray-200">
                <div className="bg-[#0D0F14] px-5 py-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-white/90">Hạng thành viên</span>
                    <span className="text-xs font-black px-3 py-1 bg-white/20 text-white rounded border border-white/30">Elite</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-4xl font-black text-white">1.250</span>
                    <span className="text-sm font-semibold text-white/70">điểm</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2.5 mb-2">
                    <div className="bg-[#E8420A] h-2.5 rounded-full" style={{ width: '62.5%' }} />
                  </div>
                  <p className="text-xs text-white/70">Còn <span className="font-black text-white">750 điểm</span> để lên hạng tiếp theo</p>
                </div>
                <div className="bg-white px-5 py-3">
                  <button className="w-full py-2.5 text-sm font-bold text-[#E8420A] border border-orange-200 rounded hover:bg-orange-50 transition-colors">
                    Xem quyền lợi thành viên
                  </button>
                </div>
              </div>
            )}

            {/* Deals */}
            {activeSection !== 'orders' && activeSection !== 'wishlist' && activeSection !== 'membership' && activeSection !== 'coupons' && activeSection !== 'account' && activeSection !== 'address' && activeSection !== 'payment' && activeSection !== 'support' && (
              <div className="bg-white rounded border border-gray-200 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Ưu đãi của bạn</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Giảm 10% cho đơn hàng tiếp theo', exp: 'HSD: 30/06/2026', code: 'ELITE10',  color: 'border-orange-200 bg-orange-50/40' },
                    { label: 'Miễn phí vận chuyển',              exp: 'HSD: 15/06/2026', code: 'FREESHIP', color: 'border-green-200 bg-green-50/40'  },
                    { label: 'Tích thêm 2x điểm cuối tuần',     exp: 'HSD: 08/06/2026', code: null,        color: 'border-orange-200 bg-orange-50/40'},
                  ].map((deal, i) => (
                    <div key={i} className={`border border-dashed rounded p-3.5 ${deal.color}`}>
                      <p className="text-sm font-semibold text-gray-800 leading-snug">{deal.label}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">{deal.exp}</span>
                        {deal.code && (
                          <span className="text-xs font-black font-mono bg-white border border-orange-200 text-[#E8420A] px-2 py-1 rounded shadow-sm">{deal.code}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                  Xem tất cả ưu đãi
                </button>
              </div>
            )}

            {/* Security */}
            {activeSection !== 'orders' && activeSection !== 'wishlist' && activeSection !== 'membership' && activeSection !== 'coupons' && activeSection !== 'account' && activeSection !== 'address' && activeSection !== 'payment' && activeSection !== 'support' && (
              <div className="bg-white rounded border border-gray-200 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Bảo mật tài khoản</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Mật khẩu</p>
                      <p className="text-xs text-gray-400 mt-0.5">Đổi lần cuối 2 tháng trước</p>
                    </div>
                    <button className="text-sm font-bold text-[#E8420A] hover:text-[#c93808] transition-colors px-3 py-1 rounded hover:bg-orange-50">Cập nhật</button>
                  </div>
                  <div className="border-t border-gray-100" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Xác thực 2 bước</p>
                      <p className="text-xs text-green-600 font-bold mt-0.5">Đã bật</p>
                    </div>
                    <div className="w-11 h-6 bg-[#E8420A] rounded-full flex items-center justify-end px-0.5 shadow-inner cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
