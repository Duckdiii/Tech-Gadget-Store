import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useNav } from '../../../hooks/useNav'
import { useCustomerManagement } from '../hooks/useCustomerManagement'
import Avatar from '../components/Avatar'
import StatCard from '../components/StatCard'
import { managerUsersService } from '../services/managerUsersService'

// Cùng nhãn/màu với TIER_DISPLAY ở MembershipSection.jsx và TIER_LABELS ở
// MembershipManagementPage.jsx — giữ nhất quán cách hiển thị hạng thành viên trong toàn app.
const TIER_DISPLAY = {
  STANDARD: { label: 'Thành viên', bg: 'bg-gray-100',   text: 'text-gray-600'   },
  BRONZE:   { label: 'Đồng',       bg: 'bg-amber-100',  text: 'text-amber-800'  },
  SILVER:   { label: 'Bạc',        bg: 'bg-slate-100',  text: 'text-slate-600'  },
  GOLD:     { label: 'Vàng',       bg: 'bg-amber-50',   text: 'text-amber-600'  },
  DIAMOND:  { label: 'Kim Cương',  bg: 'bg-purple-100', text: 'text-purple-700' },
}

const AVATAR_BG_CYCLE = ['bg-[#E8420A]', 'bg-teal-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-cyan-500']

const PAGE_SIZE = 10

function fmtMoney(n) { return (Number(n) || 0).toLocaleString('vi-VN') + ' đ' }
function fmtDate(iso) { return iso ? new Date(iso).toLocaleDateString('vi-VN') : '—' }
function initialsOf(name) {
  const trimmed = (name || '').trim()
  if (!trimmed) return '?'
  return trimmed.split(/\s+/).map((w) => w[0]).slice(-2).join('').toUpperCase()
}

export default function CustomerManagementPage() {
  const onNavigate = useNav()
  const location = useLocation()
  const {
    search, setSearch,
    tierFilter, setTierFilter,
    joinDateRange, setJoinDateRange,
    customStartDate, setCustomStartDate,
    customEndDate, setCustomEndDate,
    spendFilter, setSpendFilter,
    onlyRepeat, setOnlyRepeat,
    sortBy, setSortBy,
    sortDir, setSortDir,
    page, setPage,
    customers, totalElements, totalPages,
    stats, loading,
    refetch,
  } = useCustomerManagement()

  const [selectedIds, setSelectedIds] = useState([])
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [promoMessage, setPromoMessage] = useState('')

  useEffect(() => {
    if (location.state?.prefilledSearch !== undefined) {
      setSearch(location.state.prefilledSearch)
    }
    if (location.state?.prefilledTier !== undefined) {
      setTierFilter(location.state.prefilledTier)
    }
  }, [location.state])

  useEffect(() => {
    setSelectedIds([])
  }, [customers])

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(customers.map((c) => c.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectRow = (customerId) => {
    setSelectedIds((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    )
  }

  const handleBulkSendPromotion = async () => {
    if (!promoMessage.trim()) return
    try {
      const res = await managerUsersService.bulkSendPromotion(selectedIds, promoMessage)
      alert(res.message || 'Gửi khuyến mãi thành công!')
      setShowPromoModal(false)
      setPromoMessage('')
      setSelectedIds([])
    } catch (e) {
      alert('Lỗi khi gửi khuyến mãi: ' + (e.message || e))
    }
  }

  const handleBulkStatusUpdate = async (status) => {
    const isLock = status === 'BLOCKED'
    const actionText = isLock ? 'khóa' : 'mở khóa'
    if (window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản của ${selectedIds.length} khách hàng đã chọn?`)) {
      try {
        const selectedCustomers = customers.filter((c) => selectedIds.includes(c.id))
        const accountIds = selectedCustomers.map((c) => c.accountId).filter(Boolean)
        
        if (accountIds.length === 0) {
          alert('Không tìm thấy ID tài khoản hợp lệ để thực hiện thao tác.')
          return
        }

        await managerUsersService.bulkUpdateStatus(accountIds, status)
        alert(`Đã ${actionText} thành công ${accountIds.length} tài khoản!`)
        setSelectedIds([])
        refetch()
      } catch (e) {
        alert(`Lỗi khi ${actionText} tài khoản hàng loạt: ` + (e.message || e))
      }
    }
  }

  const handleBulkExport = async () => {
    try {
      const response = await managerUsersService.exportCustomers(selectedIds)
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'danh_sach_khach_hang.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
      setSelectedIds([])
    } catch (e) {
      alert('Lỗi khi xuất dữ liệu: ' + (e.message || e))
    }
  }

  const handleToggleBlock = async (customer) => {
    const isBlocked = customer.accountStatus === 'BLOCKED'
    const actionText = isBlocked ? 'mở khóa' : 'khóa'
    if (window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản của khách hàng ${customer.fullName}?`)) {
      try {
        if (isBlocked) {
          await managerUsersService.unblockAccount(customer.accountId)
        } else {
          await managerUsersService.blockAccount(customer.accountId)
        }
        refetch()
      } catch (e) {
        alert(`Lỗi khi ${actionText} tài khoản: ` + (e.message || e))
      }
    }
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('desc')
    }
  }

  const renderSortHeader = (label, field) => {
    const isActive = sortBy === field
    return (
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-1 text-xs font-bold text-gray-400 tracking-wider uppercase hover:text-gray-700 transition-colors focus:outline-none cursor-pointer text-left"
      >
        {label}
        <span className="text-[10px] text-gray-500">
          {isActive ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
        </span>
      </button>
    )
  }

  const kpiCards = [
    {
      label: 'TỔNG KHÁCH HÀNG',
      value: stats ? stats.totalCustomers.toLocaleString('vi-VN') : '…',
      valueClass: 'text-gray-900',
      active: !tierFilter && !joinDateRange && !spendFilter && !onlyRepeat && !search,
      onClick: () => {
        setTierFilter('')
        setJoinDateRange('')
        setSpendFilter('')
        setOnlyRepeat(false)
        setSearch('')
      },
      icon: (
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: 'THÀNH VIÊN MỚI',
      value: stats ? `+${stats.newThisMonth.toLocaleString('vi-VN')}` : '…',
      valueSuffix: ' tháng này',
      valueClass: 'text-green-600',
      suffixClass: 'text-gray-500 text-base font-normal',
      active: joinDateRange === 'month' && !tierFilter && !spendFilter && !onlyRepeat,
      onClick: () => {
        setTierFilter('')
        setJoinDateRange('month')
        setSpendFilter('')
        setOnlyRepeat(false)
      },
      icon: (
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
    {
      label: 'KHÁCH HÀNG VIP',
      value: stats ? stats.vipCustomers.toLocaleString('vi-VN') : '…',
      valueClass: 'text-orange-500',
      active: tierFilter === 'GOLD' && !joinDateRange && !spendFilter && !onlyRepeat,
      onClick: () => {
        setTierFilter('GOLD')
        setJoinDateRange('')
        setSpendFilter('')
        setOnlyRepeat(false)
      },
      icon: (
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'TỶ LỆ QUAY LẠI',
      value: stats ? `${stats.retentionRate.toFixed(1)}%` : '…',
      valueClass: 'text-orange-500',
      active: onlyRepeat && !tierFilter && !joinDateRange && !spendFilter,
      onClick: () => {
        setTierFilter('')
        setJoinDateRange('')
        setSpendFilter('')
        setOnlyRepeat(true)
      },
      icon: (
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
  ]

  // Window of page buttons centered on the current page — real totalPages here is small
  // (dataset-sized), so a fixed-size sliding window is enough; no need for a "…" ellipsis jump.
  const pageButtons = []
  const windowStart = Math.max(0, Math.min(page - 2, totalPages - 5))
  const windowEnd = Math.min(totalPages, windowStart + 5)
  for (let p = Math.max(0, windowStart); p < windowEnd; p++) pageButtons.push(p)

  const rangeStart = totalElements === 0 ? 0 : page * PAGE_SIZE + 1
  const rangeEnd = Math.min(totalElements, (page + 1) * PAGE_SIZE)

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên, email..."
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card, i) => (
            <StatCard
              key={i}
              icon={card.icon}
              label={card.label}
              value={card.value}
              valueSuffix={card.valueSuffix}
              valueClass={card.valueClass}
              suffixClass={card.suffixClass}
              padding="px-5 py-5"
              onClick={card.onClick}
              active={card.active}
            />
          ))}
        </div>

        {/* Table card */}
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-4 px-5 py-4 border-b border-gray-100">
            {/* Tier filter */}
            <div className="relative min-w-[150px]">
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="w-full appearance-none border border-gray-300 rounded px-3 py-2 pr-9 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer"
              >
                <option value="">Tất cả hạng</option>
                {Object.entries(TIER_DISPLAY).map(([value, { label }]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Date range filter */}
            <div className="relative min-w-[170px]">
              <select
                value={joinDateRange}
                onChange={(e) => setJoinDateRange(e.target.value)}
                className="w-full appearance-none border border-gray-300 rounded px-3 py-2 pr-9 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer"
              >
                <option value="">Tất cả ngày đăng ký</option>
                <option value="week">Đăng ký tuần này</option>
                <option value="month">Đăng ký tháng này</option>
                <option value="custom">Khoảng tùy chỉnh...</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Custom Date Inputs */}
            {joinDateRange === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E8420A] bg-white cursor-pointer"
                />
                <span className="text-gray-400 text-sm">đến</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E8420A] bg-white cursor-pointer"
                />
              </div>
            )}

            {/* Spending filter */}
            <div className="relative min-w-[180px]">
              <select
                value={spendFilter}
                onChange={(e) => setSpendFilter(e.target.value)}
                className="w-full appearance-none border border-gray-300 rounded px-3 py-2 pr-9 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer"
              >
                <option value="">Tất cả mức chi tiêu</option>
                <option value="zero">Chưa mua sản phẩm nào (0 đ)</option>
                <option value="gt10m">Chi tiêu trên 10 triệu</option>
                <option value="gt50m">Chi tiêu trên 50 triệu</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Responsive Table Scroll Wrapper */}
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              {/* Table header */}
              <div className="grid grid-cols-[4.5rem_1fr_11rem_8rem_10rem_10rem_9rem_6rem] gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50 items-center">
                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={customers.length > 0 && selectedIds.length === customers.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-[#E8420A] focus:ring-[#E8420A] border-gray-300 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">STT</span>
                </div>
                <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">KHÁCH HÀNG</span>
                <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">HẠNG THÀNH VIÊN</span>
                {renderSortHeader('TỔNG ĐƠN', 'totalOrders')}
                {renderSortHeader('TỔNG CHI TIÊU', 'totalSpend')}
                {renderSortHeader('NGÀY ĐĂNG KÝ', 'createdAt')}
                <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">TRẠNG THÁI</span>
                <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">THAO TÁC</span>
              </div>

              {/* Table rows */}
              {loading ? (
                <div className="px-5 py-12 text-center text-sm text-gray-400">Đang tải...</div>
              ) : customers.length === 0 ? (
                <div className="px-5 py-12 text-center text-sm text-gray-400">
                  Không tìm thấy khách hàng nào.
                </div>
              ) : (
                customers.map((customer, idx) => {
                  const tier = TIER_DISPLAY[customer.tier] || { label: customer.tier, bg: 'bg-gray-100', text: 'text-gray-600' }
                  const isSelected = selectedIds.includes(customer.id)
                  return (
                    <div
                      key={customer.id}
                      className={`grid grid-cols-[4.5rem_1fr_11rem_8rem_10rem_10rem_9rem_6rem] gap-2 px-5 py-4 border-b border-gray-100 last:border-0 items-center transition-colors ${
                        isSelected ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* STT + Checkbox */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(customer.id)}
                          className="w-4 h-4 rounded text-[#E8420A] focus:ring-[#E8420A] border-gray-300 cursor-pointer"
                        />
                        <span className="text-sm text-gray-500 font-medium">{page * PAGE_SIZE + idx + 1}</span>
                      </div>

                      {/* Khách hàng */}
                      <div className="flex items-center gap-3">
                        <Avatar
                          size="xs"
                          initials={initialsOf(customer.fullName)}
                          bg={AVATAR_BG_CYCLE[idx % AVATAR_BG_CYCLE.length]}
                          alt={customer.fullName}
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{customer.fullName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{customer.email}</p>
                        </div>
                      </div>

                      {/* Hạng thành viên */}
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded text-xs font-semibold w-fit ${tier.bg} ${tier.text}`}>
                        {tier.label}
                      </span>

                      {/* Tổng đơn */}
                      <span className="text-sm text-gray-700 font-medium">{customer.totalOrders}</span>

                      {/* Tổng chi tiêu */}
                      <span className="text-sm font-semibold text-gray-800">{fmtMoney(customer.totalSpend)}</span>

                      {/* Ngày đăng ký */}
                      <span className="text-sm text-gray-600">{fmtDate(customer.joinDate)}</span>

                      {/* Trạng thái tài khoản */}
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${
                        customer.accountStatus === 'ACTIVE' 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {customer.accountStatus === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}
                      </span>

                      {/* Thao tác */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onNavigate('customerDetail', { search: `?id=${customer.id}` })}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                          title="Xem chi tiết"
                        >
                          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleBlock(customer)}
                          className={`p-1.5 rounded transition-colors cursor-pointer ${
                            customer.accountStatus === 'ACTIVE' 
                              ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                              : 'text-red-500 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={customer.accountStatus === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        >
                          {customer.accountStatus === 'ACTIVE' ? (
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          ) : (
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4.5m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="px-5 py-4 flex items-center justify-between border-t border-gray-100">
            <span className="text-sm text-gray-500">
              {totalElements === 0 ? 'Không có khách hàng nào' : `Hiển thị ${rangeStart} - ${rangeEnd} trên ${totalElements.toLocaleString('vi-VN')}`}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-8 h-8 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {pageButtons.map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium cursor-pointer transition-colors ${
                    page === p ? 'bg-[#E8420A] text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p + 1}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="w-8 h-8 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur text-white px-6 py-4 rounded-xl shadow-2xl border border-gray-800 flex items-center gap-6 z-40 transition-all duration-300">
          <div className="text-sm font-semibold border-r border-gray-700 pr-6">
            Đã chọn: <span className="text-[#E8420A] text-base font-bold">{selectedIds.length}</span> khách hàng
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPromoModal(true)}
              className="bg-[#E8420A] hover:bg-[#C4350A] text-white px-4 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm0 0h4m-4 0H8m0 0v13m0-13V6a2 2 0 10-2-2h2zm0 0V5a2 2 0 112 2H8" />
              </svg>
              Gửi khuyến mãi
            </button>
            
            <button
              onClick={handleBulkExport}
              className="border border-gray-700 hover:bg-gray-800 text-gray-200 px-4 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Xuất Excel (CSV)
            </button>

            <button
              onClick={() => handleBulkStatusUpdate('ACTIVE')}
              className="border border-gray-700 hover:bg-green-950/30 hover:border-green-800 text-green-400 px-4 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              Mở khóa tài khoản
            </button>

            <button
              onClick={() => handleBulkStatusUpdate('BLOCKED')}
              className="border border-gray-700 hover:bg-red-950/30 hover:border-red-800 text-red-400 px-4 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              Khóa tài khoản
            </button>
          </div>
          <button
            onClick={() => setSelectedIds([])}
            className="text-gray-400 hover:text-white transition-colors pl-4 border-l border-gray-700 cursor-pointer"
            title="Bỏ chọn tất cả"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Promotion Modal Overlay */}
      {showPromoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-slide-up">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Gửi chương trình khuyến mãi hàng loạt</h3>
              <button 
                onClick={() => setShowPromoModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">
                Gửi tin nhắn khuyến mãi, mã giảm giá đến <strong className="text-gray-800">{selectedIds.length}</strong> khách hàng đã chọn.
              </p>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Nội dung khuyến mãi
                </label>
                <textarea
                  value={promoMessage}
                  onChange={(e) => setPromoMessage(e.target.value)}
                  placeholder="Nhập tin nhắn hoặc mã giảm giá muốn gửi..."
                  rows={4}
                  className="w-full border border-gray-300 rounded p-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E8420A] bg-white resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowPromoModal(false)}
                className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2 rounded text-xs font-semibold cursor-pointer transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleBulkSendPromotion}
                disabled={!promoMessage.trim()}
                className="bg-[#E8420A] hover:bg-[#C4350A] disabled:opacity-50 text-white px-5 py-2 rounded text-xs font-semibold cursor-pointer transition-colors"
              >
                Gửi ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
