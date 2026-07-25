import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
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
import Skeleton from '../components/Skeleton'
import AvatarPickerModal from '../components/AvatarPickerModal'

/* ── Nav — nguồn duy nhất cho cả sidebar (desktop) và thanh tab ngang (mobile) ──── */

const NAV_ITEMS = [
  { id: 'overview',   label: 'Tổng quan',                icon: 'home'     },
  { id: 'orders',     label: 'Lịch sử mua hàng',         icon: 'orders'   },
  { id: 'wishlist',   label: 'Sản phẩm yêu thích',       icon: 'heart'    },
  { id: 'membership', label: 'Hạng thành viên & ưu đãi', icon: 'star'     },
  null,
  { id: 'account',    label: 'Thông tin tài khoản',      icon: 'user'     },
  { id: 'address',    label: 'Sổ địa chỉ',               icon: 'location' },
  { id: 'payment',    label: 'Phương thức thanh toán',   icon: 'card'     },
  { id: 'coupons',    label: 'Mã giảm giá',              icon: 'coupon'   },
  null,
  { id: 'support',    label: 'Hỗ trợ & Phản hồi',        icon: 'help'     },
  { id: 'logout',     label: 'Đăng xuất',                icon: 'logout',  action: 'login' },
]

// Section nào có nội dung gợi ý riêng ở cột phải (desktop only)
const SECTIONS_WITH_TIPS = ['support', 'payment', 'address', 'account']

const vndFormatter = new Intl.NumberFormat('vi-VN')

function formatVnd(value) {
  if (value === null || value === undefined) return '—'
  return vndFormatter.format(value) + 'đ'
}

/* ── Icons ───────────────────────────────────────────────────── */

const ICON_PATHS = {
  home:     'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  orders:   'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  heart:    'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  star:     'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  user:     'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  location: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
  card:     'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  coupon:   'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z',
  help:     'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  logout:   'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
}

function SvgIcon({ name, className = 'w-5 h-5', style }) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={ICON_PATHS[name]} />
    </svg>
  )
}

/* ── Main component ──────────────────────────────────────────── */

function getInitials(name) {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export default function UserProfilePage() {
  const onNavigate = useNav()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeSection = searchParams.get('tab') || 'overview'
  const setActiveSection = (section) => {
    setSearchParams({ tab: section })
  }
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [profile, setProfile] = useState(null)
  const [membership, setMembership] = useState(null)
  const [orders, setOrders] = useState([])
  const [favoritesCount, setFavoritesCount] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [membershipLoading, setMembershipLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [favoritesLoading, setFavoritesLoading] = useState(true)
  const [avatarSrc, setAvatarSrc] = useState(null)
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)

  useEffect(() => {
    const loadAvatar = () => {
      if (profile?.email) {
        const stored = localStorage.getItem(`customer_avatar_${profile.email}`)
        setAvatarSrc(stored)
      }
    }
    loadAvatar()
    window.addEventListener('customer_avatar_changed', loadAvatar)
    return () => window.removeEventListener('customer_avatar_changed', loadAvatar)
  }, [profile])

  const handleAvatarSelect = (newAvatar) => {
    if (profile?.email) {
      localStorage.setItem(`customer_avatar_${profile.email}`, newAvatar)
      setAvatarSrc(newAvatar)
      window.dispatchEvent(new Event('customer_avatar_changed'))
    }
  }

  // Mỗi phần dữ liệu tải độc lập — phần nào xong trước hiển thị trước,
  // không phải đợi Promise.all cho tất cả rồi mới tắt loading.
  const fetchProfileAndData = () => {
    setProfileLoading(true)
    setMembershipLoading(true)
    setOrdersLoading(true)
    setFavoritesLoading(true)

    apiFetch('/api/customer/profile')
      .then(data => setProfile(data))
      .catch(err => console.error('Error fetching profile:', err))
      .finally(() => setProfileLoading(false))

    apiFetch('/api/customer/membership')
      .then(data => setMembership(data))
      .catch(err => console.error('Error fetching membership:', err))
      .finally(() => setMembershipLoading(false))

    apiFetch('/api/customer/orders')
      .then(data => setOrders(data?.items || []))
      .catch(err => console.error('Error fetching orders:', err))
      .finally(() => setOrdersLoading(false))

    apiFetch('/api/customer/favorites?page=0&size=1')
      .then(data => setFavoritesCount(data.totalItems ?? 0))
      .catch(err => console.error('Error fetching favorites:', err))
      .finally(() => setFavoritesLoading(false))
  }

  useEffect(() => {
    fetchProfileAndData()
  }, [])

  const handleNavClick = (item) => {
    if (item.id === 'logout') {
      setShowLogoutModal(true)
    } else if (item.action) {
      onNavigate(item.action)
    } else {
      setActiveSection(item.id)
    }
  }

  const tierProgressPct = membership?.nextTierMinSpending
    ? Math.min(100, Math.round((membership.totalSpent / membership.nextTierMinSpending) * 100))
    : 100

  return (
    <div className="flex-1 flex flex-col min-h-dvh" style={{ backgroundColor: 'var(--page)' }}>
      <StoreNavbar />

      {/* ── Hero banner ─────────────────────────────────────────── */}
      {/* Nền tối với gradient chuyển tiếp mượt mà để chữ trắng và badge tương phản cao đồng thời giảm độ gắt với phần thân sáng */}
      <div style={{ background: 'linear-gradient(180deg, #0D0F14 0%, #1E293B 100%)', borderBottom: '1px solid var(--b1)' }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8">

          {/* Profile row */}
          <div className="flex flex-wrap items-center gap-5 sm:gap-8 py-6 sm:py-7">

            {/* Avatar */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Thay đổi ảnh đại diện"
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsAvatarModalOpen(true) }}
              className="relative shrink-0 cursor-pointer group/avatar"
              onClick={() => setIsAvatarModalOpen(true)}
            >
              {profileLoading ? (
                <Skeleton className="w-16 h-16 sm:w-24 sm:h-24 rounded-full ring-4" style={{ ringColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.12)' }} />
              ) : (
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white text-xl sm:text-3xl font-black ring-4 shadow-lg overflow-hidden relative" style={{ background: 'linear-gradient(135deg, var(--accent-h), var(--accent-d))', ringColor: 'rgba(255,255,255,0.15)' }}>
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(profile?.fullName)
                  )}
                  {/* Overlay camera on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity duration-200">
                    <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
              )}
              <span className="absolute bottom-1 right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: 'var(--ok)' }} />
            </div>

            {/* Name + meta */}
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-1" style={{ color: 'var(--accent)' }}>Hồ sơ thành viên</p>
              {profileLoading ? (
                <>
                  <Skeleton className="h-7 w-48 mb-2" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
                  <Skeleton className="h-4 w-56" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
                </>
              ) : (
                <>
                  <h1 className="text-xl sm:text-2xl font-black leading-tight" style={{ color: 'white', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                    {profile?.fullName}
                  </h1>
                  <p className="text-xs sm:text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {profile?.phone ? profile.phone.replace(/^(\d{3})\d{4}(\d{2})$/, '$1·····$2') : '—'} · {profile?.email || '—'}
                  </p>
                </>
              )}
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                {membershipLoading ? (
                  <Skeleton className="h-6 w-20" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
                ) : (
                  <span className="px-3 py-1 text-xs font-black rounded" style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(232,66,10,0.3)' }}>
                    {membership?.tier || 'STANDARD'}
                  </span>
                )}
                <span className="px-3 py-1 text-xs font-semibold rounded" style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }}>Đã xác minh</span>
              </div>
            </div>

            {/* Edit button */}
            <button aria-label="Thao tác" type="button"
              onClick={() => setActiveSection('account')}
              className="ml-auto flex items-center gap-2 text-sm font-semibold px-4 sm:px-5 py-2.5 rounded transition-colors shrink-0 cursor-pointer"
              style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'white', backgroundColor: 'rgba(255,255,255,0.06)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'white' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="hidden sm:inline">Chỉnh sửa hồ sơ</span>
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pb-6">
            {/* Orders count */}
            <div className="rounded px-4 sm:px-5 py-4 flex items-center gap-3 sm:gap-4" style={{ backgroundColor: 'var(--accent-dim)', border: '1px solid rgba(232,66,10,0.2)' }}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--accent)' }}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                {ordersLoading ? (
                  <Skeleton className="h-8 w-10 mb-1" style={{ backgroundColor: 'rgba(232,66,10,0.15)' }} />
                ) : (
                  <p className="text-2xl sm:text-3xl font-black leading-none" style={{ color: 'var(--accent)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                    {orders.length}
                  </p>
                )}
                <p className="text-xs font-medium mt-1 truncate" style={{ color: 'rgba(232,66,10,0.7)' }}>Tổng đơn hàng</p>
              </div>
            </div>

            {/* Spend */}
            <div className="rounded px-4 sm:px-5 py-4 flex items-center gap-3 sm:gap-4" style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: '#16a34a' }}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                {membershipLoading ? (
                  <Skeleton className="h-7 w-24 mb-1" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }} />
                ) : (
                  <p className="text-lg sm:text-xl font-black leading-none truncate" style={{ color: '#4ade80', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                    {formatVnd(membership?.totalSpent || 0)}
                  </p>
                )}
                <p className="text-xs font-medium mt-1 truncate" style={{ color: 'rgba(74,222,128,0.7)' }}>Tổng tiền tích lũy</p>
              </div>
            </div>

            {/* Wishlist shortcut */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Xem danh sách yêu thích"
              onClick={() => setActiveSection('wishlist')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveSection('wishlist') }}
              className="rounded px-4 sm:px-5 py-4 flex items-center gap-3 sm:gap-4 cursor-pointer transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <SvgIcon name="heart" className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                {favoritesLoading ? (
                  <Skeleton className="h-8 w-10 mb-1" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
                ) : (
                  <p className="text-2xl sm:text-3xl font-black leading-none" style={{ color: 'white', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                    {favoritesCount ?? '—'}
                  </p>
                )}
                <p className="text-xs font-medium mt-1 truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>Sản phẩm yêu thích</p>
              </div>
            </div>

            {/* Level progress */}
            <div className="rounded px-4 sm:px-5 py-4" style={{ backgroundColor: 'var(--accent-dim)', border: '1px solid rgba(232,66,10,0.2)' }}>
              {membershipLoading ? (
                <>
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <Skeleton className="h-3 w-24" style={{ backgroundColor: 'rgba(232,66,10,0.15)' }} />
                    <Skeleton className="h-3 w-8" style={{ backgroundColor: 'rgba(232,66,10,0.15)' }} />
                  </div>
                  <Skeleton className="w-full h-2.5 mb-2" style={{ backgroundColor: 'rgba(232,66,10,0.15)' }} />
                  <Skeleton className="h-3 w-32" style={{ backgroundColor: 'rgba(232,66,10,0.15)' }} />
                </>
              ) : (
              <>
              <div className="flex items-center justify-between mb-2 gap-2">
                <span className="text-xs font-bold truncate" style={{ color: 'var(--accent)' }}>
                  Lên hạng {membership?.nextTier || 'cao nhất'}
                </span>
                <span className="text-xs font-black shrink-0" style={{ color: 'var(--accent)' }}>{tierProgressPct}%</span>
              </div>
              <div className="w-full rounded-full h-2.5 mb-2" style={{ backgroundColor: 'rgba(232,66,10,0.2)' }}>
                <div className="h-2.5 rounded-full transition-colors" style={{ width: `${tierProgressPct}%`, backgroundColor: 'var(--accent)' }} />
              </div>
              <p className="text-xs" style={{ color: 'rgba(232,66,10,0.8)' }}>
                {membership?.nextTierMinSpending && membership.nextTierMinSpending > membership.totalSpent ? (
                  <>Cần thêm <span className="font-black">{formatVnd(membership.nextTierMinSpending - membership.totalSpent)}</span></>
                ) : (
                  <span>Đã đạt hạng cao nhất</span>
                )}
              </p>
              </>
              )}
            </div>
          </div>

          {/* Thanh nav ngang — chỉ hiện trên mobile/tablet (< lg), thay cho sidebar */}
          <div className="flex items-center gap-1 -mb-px overflow-x-auto lg:hidden">
            {NAV_ITEMS.filter(Boolean).map(item => (
              <button aria-label="Thao tác" type="button"
                key={item.id}
                onClick={() => handleNavClick(item)}
                className="shrink-0 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer bg-transparent"
                style={{
                  borderBottomColor: activeSection === item.id && !item.action ? 'var(--accent)' : 'transparent',
                  color: item.id === 'logout' ? '#f87171' : activeSection === item.id ? 'var(--accent)' : 'rgba(255,255,255,0.6)',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="max-w-screen-2xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-7">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_300px] gap-6 items-start">

          {/* Left sidebar — chỉ hiện trên desktop (lg+) */}
          <aside className="hidden lg:block overflow-hidden sticky top-24" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(15,23,42,0.02)' }}>
            <ul className="py-3">
              {NAV_ITEMS.map((item) => {
                if (!item) return <li key={item?.id ?? item?.code ?? item?.name ?? item?.key ?? item?.val ?? item} className="my-2 mx-4" style={{ borderTop: '1px solid var(--b1)' }} />
                const isActive = activeSection === item.id && !item.action
                const isLogout = item.id === 'logout'
                return (
                  <li key={item.id}>
                    <button aria-label="Thao tác" type="button"
                      onClick={() => handleNavClick(item)}
                      className="w-full flex items-center gap-3.5 text-sm transition-all text-left cursor-pointer"
                      style={isActive
                        ? { backgroundColor: 'var(--accent-dim)', color: 'var(--accent)', fontWeight: '700', borderLeft: '3px solid var(--accent)', paddingLeft: '17px', paddingRight: '20px', paddingTop: '12px', paddingBottom: '12px' }
                        : isLogout
                          ? { color: 'var(--err)', padding: '12px 20px' }
                          : { color: 'var(--t2)', padding: '12px 20px' }
                      }
                      onMouseEnter={e => { if (!isActive && !isLogout) { e.currentTarget.style.backgroundColor = 'var(--page)'; e.currentTarget.style.color = 'var(--t1)' } }}
                      onMouseLeave={e => { if (!isActive && !isLogout) { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--t2)' } }}
                    >
                      <SvgIcon
                        name={item.icon}
                        className={`w-5 h-5 shrink-0 ${isLogout ? 'text-red-400' : !isActive ? 'opacity-60' : ''}`}
                        {...(isActive ? { style: { color: 'var(--accent)' } } : {})}
                      />
                      <span>{item.label}</span>
                      {isActive && (
                        <svg className="w-4 h-4 ml-auto" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className={`min-w-0 ${SECTIONS_WITH_TIPS.includes(activeSection) ? '' : 'xl:col-span-2'}`}>
            {activeSection === 'orders' ? (
              <OrdersSection orders={orders} loading={ordersLoading} onNavigate={onNavigate} />
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
                profile={profile}
                orders={orders}
                ordersLoading={ordersLoading}
                onNavigate={(key) => {
                  if (NAV_ITEMS.some(item => item?.id === key)) setActiveSection(key)
                  else onNavigate(key)
                }}
              />
            )}
          </div>

          {/* Right column — chỉ hiện trên desktop rộng (xl+), chỉ khi section có tip riêng */}
          {SECTIONS_WITH_TIPS.includes(activeSection) && (
            <div className="hidden xl:block space-y-5 sticky top-24">
              {activeSection === 'support' && (
                <div className="space-y-4">
                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '16px', boxShadow: '0 8px 32px 0 rgba(15, 23, 42, 0.03)' }} className="p-5">
                    <h4 className="text-sm font-bold mb-4" style={{ color: 'var(--t1)' }}>Giờ làm việc</h4>
                    <div className="space-y-3">
                      {[
                        { day: 'Thứ 2 – Thứ 6', time: '8:00 – 22:00', active: true },
                        { day: 'Thứ 7', time: '8:00 – 20:00', active: true },
                        { day: 'Chủ nhật', time: '9:00 – 18:00', active: false },
                      ].map((r) => (
                        <div key={r.day} className="flex items-center justify-between text-sm">
                          <span className="font-medium" style={{ color: 'var(--t2)' }}>{r.day}</span>
                          <span className="font-bold" style={{ color: r.active ? 'var(--ok)' : 'var(--warn)' }}>{r.time}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-2 rounded px-3 py-2.5" style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <span className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ backgroundColor: 'var(--ok)' }} />
                      <span className="text-xs font-bold" style={{ color: 'var(--ok)' }}>Đang trong giờ làm việc</span>
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.4)', borderRadius: '16px', boxShadow: '0 8px 32px 0 rgba(15, 23, 42, 0.02)' }} className="p-5">
                    <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--t1)' }}>Cam kết phản hồi</h4>
                    <div className="space-y-2.5">
                      {[
                        { channel: 'Hotline', time: '< 3 phút', icon: '📞' },
                        { channel: 'Phiếu hỗ trợ', time: '< 24 giờ', icon: '🎫' },
                        { channel: 'Email', time: '< 48 giờ', icon: '📧' },
                      ].map((s) => (
                        <div key={s.channel} className="flex items-center justify-between text-xs">
                          <span className="font-medium flex items-center gap-1.5" style={{ color: 'var(--t2)' }}>
                            <span>{s.icon}</span>{s.channel}
                          </span>
                          <span className="font-black px-2 py-0.5 rounded" style={{ color: 'var(--t1)', backgroundColor: 'rgba(255, 255, 255, 0.6)', border: '1px solid var(--b1)' }}>{s.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'payment' && (
                <div className="space-y-4">
                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '16px', boxShadow: '0 8px 32px 0 rgba(15, 23, 42, 0.03)' }} className="p-5">
                    <h4 className="text-sm font-bold mb-2" style={{ color: 'var(--t1)' }}>Vì sao không lưu số thẻ?</h4>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--t2)' }}>
                      Để bảo vệ bạn, hệ thống chỉ ghi nhớ <strong>cổng thanh toán ưu tiên</strong> chứ không lưu trữ số thẻ/CVV. Việc nhập thẻ luôn diễn ra trực tiếp trên trang thanh toán của ngân hàng hoặc ví điện tử.
                    </p>
                  </div>
                  <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)', backdropFilter: 'blur(8px)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: '16px', boxShadow: '0 8px 32px 0 rgba(245, 158, 11, 0.02)' }} className="p-5">
                    <h4 className="text-sm font-bold mb-2" style={{ color: 'var(--warn)' }}>Lưu ý bảo mật</h4>
                    <ul className="space-y-2">
                      {[
                        'Không chia sẻ mã OTP với bất kỳ ai',
                        'Luôn kiểm tra địa chỉ website trước khi thanh toán',
                        'Bật thông đoán giao dịch từ ngân hàng',
                      ].map((tip) => (
                        <li key={tip} className="flex items-start gap-2 text-xs" style={{ color: 'var(--warn)' }}>
                          <span className="mt-0.5 shrink-0">⚠️</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeSection === 'address' && (
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '16px', boxShadow: '0 8px 32px 0 rgba(15, 23, 42, 0.03)' }} className="p-5 space-y-4">
                  <h4 className="text-sm font-bold" style={{ color: 'var(--t1)' }}>Lưu ý về địa chỉ</h4>
                  <ul className="space-y-3">
                    {[
                      { icon: '⭐', text: 'Địa chỉ mặc định sẽ được tự động chọn khi đặt hàng' },
                      { icon: '✏️', text: 'Bạn có thể thay đổi địa chỉ giao hàng ngay tại trang xác nhận đơn' },
                      { icon: '🔒', text: 'Thông tin địa chỉ được bảo mật và chỉ dùng cho giao hàng' },
                    ].map((tip) => (
                      <li key={tip.text} className="flex items-start gap-2.5 text-xs" style={{ color: 'var(--t2)' }}>
                        <span className="shrink-0 mt-0.5">{tip.icon}</span>
                        <span>{tip.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeSection === 'account' && (
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.4)', borderRadius: '16px', boxShadow: '0 8px 32px 0 rgba(15, 23, 42, 0.02)' }} className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 shrink-0" style={{ color: 'var(--t2)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="text-sm font-bold" style={{ color: 'var(--t1)' }}>Gợi ý bảo mật</h4>
                  </div>
                  <ul className="space-y-2.5">
                    {[
                      'Sử dụng mật khẩu dài ít nhất 8 ký tự, kết hợp chữ và số',
                      'Bật xác thực 2 bước để bảo vệ tài khoản',
                      'Không chia sẻ mật khẩu với người khác',
                    ].map((tip) => (
                      <li key={tip} className="flex items-start gap-2 text-xs" style={{ color: 'var(--t2)' }}>
                        <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--t3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <AvatarPickerModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelect={handleAvatarSelect}
        currentAvatar={avatarSrc}
      />
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 p-6 space-y-5 animate-scale-up">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900">Xác nhận đăng xuất</h3>
              <p className="text-xs text-gray-500">Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?</p>
            </div>
            <div className="flex gap-3">
              <button aria-label="Thao tác" type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer border-none"
              >
                Hủy bỏ
              </button>
              <button aria-label="Thao tác" type="button"
                onClick={() => {
                  setShowLogoutModal(false)
                  onNavigate('login')
                }}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors cursor-pointer border-none shadow-sm"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
