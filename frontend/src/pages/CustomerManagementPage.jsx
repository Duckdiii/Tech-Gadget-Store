import { useState } from 'react'
import { useNav } from '../hooks/useNav'

const TIER_CONFIG = {
  VIP:              { bg: 'bg-amber-100',  text: 'text-amber-700'  },
  Premium:          { bg: 'bg-orange-100', text: 'text-orange-600' },
  'Thành viên mới': { bg: 'bg-orange-50',   text: 'text-[#E8420A]'   },
}

const CUSTOMERS = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    avatarImg: 'https://placehold.co/40x40/94a3b8/ffffff?text=NA',
    tier: 'VIP',
    totalOrders: 42,
    totalSpend: 125500000,
    joinDate: '12/03/2022',
  },
  {
    id: 2,
    name: 'Trần Thị B',
    email: 'tranthib.work@gmail.com',
    avatarImg: 'https://placehold.co/40x40/f9a8d4/ffffff?text=TB',
    tier: 'Premium',
    totalOrders: 15,
    totalSpend: 45200000,
    joinDate: '05/08/2023',
  },
  {
    id: 3,
    name: 'Lê Hoàng C',
    email: 'lehoangc@company.vn',
    avatarLetter: 'L',
    avatarBg: 'bg-teal-200',
    avatarColor: 'text-teal-700',
    tier: 'Thành viên mới',
    totalOrders: 2,
    totalSpend: 4500000,
    joinDate: '22/10/2023',
  },
  {
    id: 4,
    name: 'Phạm Văn D',
    email: 'phamvand99@gmail.com',
    avatarLetter: 'P',
    avatarBg: 'bg-orange-200',
    avatarColor: 'text-orange-600',
    tier: 'Premium',
    totalOrders: 18,
    totalSpend: 52800000,
    joinDate: '10/01/2023',
  },
]

const KPI_CARDS = [
  {
    label: 'TỔNG KHÁCH HÀNG',
    value: '5,240',
    valueClass: 'text-gray-900',
    icon: (
      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'THÀNH VIÊN MỚI',
    value: '+150',
    valueSuffix: ' tháng này',
    valueClass: 'text-green-600',
    suffixClass: 'text-gray-500 text-base font-normal',
    icon: (
      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    label: 'KHÁCH HÀNG VIP',
    value: '420',
    valueClass: 'text-orange-500',
    icon: (
      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'TỶ LỆ QUAY LẠI',
    value: '65%',
    valueClass: 'text-orange-500',
    icon: (
      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
]

function CustomerAvatar({ customer }) {
  if (customer.avatarLetter) {
    return (
      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${customer.avatarBg} ${customer.avatarColor}`}>
        {customer.avatarLetter}
      </div>
    )
  }
  return (
    <img src={customer.avatarImg} alt={customer.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
  )
}

export default function CustomerManagementPage() {
  const onNavigate = useNav()
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [page, setPage] = useState(1)

  const filtered = CUSTOMERS.filter((c) => {
    const matchSearch =
      search === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    const matchTier = tierFilter === '' || c.tier === tierFilter
    return matchSearch && matchTier
  })

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-3 flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm nhanh..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border-0 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8420A]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button className="relative p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <img
            src="https://placehold.co/34x34/f9a8d4/9d174d?text=AD"
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover cursor-pointer"
          />
        </div>
      </header>

      {/* Page content */}
      <div className="flex-1 px-8 py-7 space-y-5">
        {/* Title row */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý khách hàng</h1>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý danh sách, phân hạng và lịch sử mua hàng.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium py-2.5 px-4 rounded text-sm transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Xuất dữ liệu
            </button>
            <button className="flex items-center gap-2 bg-[#E8420A] hover:bg-[#C4350A] text-white font-semibold py-2.5 px-4 rounded text-sm transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Thêm khách hàng mới
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          {KPI_CARDS.map((card, i) => (
            <div key={i} className="bg-white rounded border border-gray-200 px-5 py-5">
              <div className="flex items-center gap-2 mb-3">
                {card.icon}
                <span className="text-xs font-bold text-gray-400 tracking-wider">{card.label}</span>
              </div>
              <p className={`text-3xl font-black leading-tight ${card.valueClass}`}>
                {card.value}
                {card.valueSuffix && (
                  <span className={`text-base font-normal ${card.suffixClass}`}>{card.valueSuffix}</span>
                )}
              </p>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          {/* Filter row */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            {/* Search */}
            <div className="relative w-72">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tên, email, sđt..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8420A]"
              />
            </div>

            {/* Tier filter */}
            <div className="relative">
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="appearance-none border border-gray-300 rounded px-4 py-2.5 pr-9 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer min-w-[150px]"
              >
                <option value="">Tất cả hạng</option>
                <option value="VIP">VIP</option>
                <option value="Premium">Premium</option>
                <option value="Thành viên mới">Thành viên mới</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Sort */}
            <button className="ml-auto border border-gray-300 rounded px-4 py-2.5 text-sm text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors font-medium">
              Tổng chi tiêu: Cao - Thấp
            </button>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[3.5rem_1fr_11rem_8rem_10rem_10rem_6rem] gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
            {['STT', 'KHÁCH HÀNG', 'HẠNG THÀNH VIÊN', 'TỔNG ĐƠN', 'TỔNG CHI TIÊU', 'NGÀY ĐĂNG KÝ', 'THAO TÁC'].map((h) => (
              <span key={h} className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                {h}
              </span>
            ))}
          </div>

          {/* Table rows */}
          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-gray-400">
              Không tìm thấy khách hàng nào.
            </div>
          ) : (
            filtered.map((customer) => {
              const tier = TIER_CONFIG[customer.tier] || { bg: 'bg-gray-100', text: 'text-gray-600' }
              return (
                <div
                  key={customer.id}
                  className="grid grid-cols-[3.5rem_1fr_11rem_8rem_10rem_10rem_6rem] gap-2 px-5 py-4 border-b border-gray-100 last:border-0 items-center"
                >
                  {/* STT */}
                  <span className="text-sm text-gray-500 font-medium">{customer.id}</span>

                  {/* Khách hàng */}
                  <div className="flex items-center gap-3">
                    <CustomerAvatar customer={customer} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{customer.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{customer.email}</p>
                    </div>
                  </div>

                  {/* Hạng thành viên */}
                  <span className={`inline-flex items-center justify-center px-3 py-1 rounded text-xs font-semibold w-fit ${tier.bg} ${tier.text}`}>
                    {customer.tier}
                  </span>

                  {/* Tổng đơn */}
                  <span className="text-sm text-gray-700 font-medium">{customer.totalOrders}</span>

                  {/* Tổng chi tiêu */}
                  <span className="text-sm font-semibold text-gray-800">
                    {customer.totalSpend.toLocaleString('vi-VN')} đ
                  </span>

                  {/* Ngày đăng ký */}
                  <span className="text-sm text-gray-600">{customer.joinDate}</span>

                  {/* Thao tác */}
                  <button onClick={() => onNavigate('customerDetail')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors cursor-pointer">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              )
            })
          )}

          {/* Pagination */}
          <div className="px-5 py-4 flex items-center justify-between border-t border-gray-100">
            <span className="text-sm text-gray-500">Hiển thị 1 - 10 trên 5,240</span>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 cursor-pointer transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium cursor-pointer transition-colors ${
                    page === n ? 'bg-[#E8420A] text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {n}
                </button>
              ))}

              <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">...</span>

              <button className="w-8 h-8 flex items-center justify-center rounded text-sm font-medium text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors">
                524
              </button>

              <button className="w-8 h-8 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 cursor-pointer transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
