import { useState } from 'react'
import { useNav } from '../../../hooks/useNav'
import { useCustomerDetail } from '../hooks/useCustomerDetail'
import StatCard from '../components/StatCard'
import { managerUsersService } from '../services/managerUsersService'

// Cùng nhãn/màu với TIER_DISPLAY ở MembershipSection.jsx và CustomerManagementPage.jsx.
const TIER_DISPLAY = {
  STANDARD: { label: 'Thành viên', bg: 'bg-gray-50',    border: 'border-gray-200',   text: 'text-gray-700'   },
  BRONZE:   { label: 'Đồng',       bg: 'bg-amber-50',    border: 'border-amber-200',  text: 'text-amber-800'  },
  SILVER:   { label: 'Bạc',        bg: 'bg-slate-50',    border: 'border-slate-200',  text: 'text-slate-700'  },
  GOLD:     { label: 'Vàng',       bg: 'bg-amber-50',    border: 'border-amber-300',  text: 'text-amber-600'  },
  DIAMOND:  { label: 'Kim Cương',  bg: 'bg-purple-50',   border: 'border-purple-200', text: 'text-purple-700' },
}

const STATUS_DISPLAY = {
  AWAITING_CONFIRMATION: { label: 'Chờ xác nhận',   bg: 'bg-amber-100',  text: 'text-amber-700' },
  PROCESSING:            { label: 'Đang xử lý',      bg: 'bg-blue-100',   text: 'text-blue-700'  },
  SHIPPING:              { label: 'Đang giao',       bg: 'bg-orange-100', text: 'text-orange-600' },
  COMPLETED:             { label: 'Đã hoàn thành',   bg: 'bg-green-100',  text: 'text-green-700' },
  CANCELLED:             { label: 'Đã hủy',          bg: 'bg-red-100',    text: 'text-red-600'   },
  REFUNDED:              { label: 'Đã hoàn tiền',    bg: 'bg-red-50',     text: 'text-red-500'   },
}

const TABS = ['Lịch sử giao dịch', 'Sản phẩm đã mua', 'Ghi chú']

const MONTH_NAMES = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']

function fmtMoney(n) { return (Number(n) || 0).toLocaleString('vi-VN') + ' đ' }
function fmtDate(iso) { return iso ? new Date(iso).toLocaleDateString('vi-VN') : '—' }
function initialsOf(name) {
  const trimmed = (name || '').trim()
  if (!trimmed) return '?'
  return trimmed.split(/\s+/).map((w) => w[0]).slice(-2).join('').toUpperCase()
}

export default function CustomerDetailPage() {
  const onNavigate = useNav()
  const { customer, loading, error, refetch } = useCustomerDetail()
  const [activeTab, setActiveTab] = useState(TABS[0])
  const [headerSearch, setHeaderSearch] = useState('')

  const [newNoteContent, setNewNoteContent] = useState('')
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [editingNoteContent, setEditingNoteContent] = useState('')
  const [hoveredMonth, setHoveredMonth] = useState(null)

  const handleHeaderSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      onNavigate('customerManagement', { state: { prefilledSearch: headerSearch } })
    }
  }

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return
    try {
      await managerUsersService.addCustomerNote(customer.id, newNoteContent)
      setNewNoteContent('')
      refetch()
    } catch (e) {
      alert('Không thể lưu ghi chú: ' + (e.message || e))
    }
  }

  const handleUpdateNote = async (noteId) => {
    if (!editingNoteContent.trim()) return
    try {
      await managerUsersService.updateCustomerNote(noteId, editingNoteContent)
      setEditingNoteId(null)
      refetch()
    } catch (e) {
      alert('Không thể cập nhật ghi chú: ' + (e.message || e))
    }
  }

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ghi chú này không?')) {
      try {
        await managerUsersService.deleteCustomerNote(noteId)
        refetch()
      } catch (e) {
        alert('Không thể xóa ghi chú: ' + (e.message || e))
      }
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-dvh bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--accent)' }}></div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-dvh bg-gray-50 gap-3">
        <p className="text-sm text-gray-500">{error || 'Không tìm thấy khách hàng.'}</p>
        <button aria-label="Thao tác" type="button"
          onClick={() => onNavigate('customerManagement')}
          className="text-sm text-[#E8420A] hover:text-[#C4350A] font-medium cursor-pointer"
        >
          ← Quay lại danh sách khách hàng
        </button>
      </div>
    )
  }

  const tier = TIER_DISPLAY[customer.tier] || { label: customer.tier, bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' }

  return (
    <div className="flex-1 flex flex-col min-h-dvh bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-3 flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              aria-label="Tìm kiếm khách hàng"
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              onKeyDown={handleHeaderSearchSubmit}
              placeholder="Tìm kiếm khách hàng..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border-0 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8420A]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button aria-label="Thông báo" type="button" className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button aria-label="Trợ giúp" type="button" className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button aria-label="Cài đặt hệ thống" type="button" className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <img
            src="https://placehold.co/34x34/374151/ffffff?text=AD"
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover cursor-pointer"
          />
        </div>
      </header>

      {/* Page content */}
      <div className="flex-1 px-8 py-6">
        {/* Breadcrumb + Title + Actions */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-sm text-gray-500 mb-1">
              <button aria-label="Trở về danh sách khách hàng" type="button" onClick={() => onNavigate('customerManagement')} className="hover:text-[#E8420A] cursor-pointer border-none bg-transparent p-0 font-inherit text-inherit">Khách hàng</button>
              <span className="mx-2">›</span>
              <span className="text-gray-700 font-medium">{customer.fullName}</span>
            </p>
            <h1 className="text-3xl font-bold text-gray-900">Chi tiết khách hàng</h1>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <button aria-label="Thao tác" type="button" className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium py-2.5 px-4 rounded text-sm transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
            <button aria-label="Thao tác" type="button" className="flex items-center gap-2 bg-[#C4350A] hover:bg-[#0D0F14] text-white font-semibold py-2.5 px-4 rounded text-sm transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              Send Promotion
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-5">
          {/* LEFT: Customer info card */}
          <div className="bg-white rounded border border-gray-200 px-6 py-7 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-[#E8420A] text-white text-2xl font-bold flex items-center justify-center mb-4 ring-4 ring-gray-100">
              {initialsOf(customer.fullName)}
            </div>

            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">{customer.fullName}</h2>

            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold mb-4 ${tier.bg} ${tier.border} ${tier.text}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              {tier.label}
            </span>

            {/* Progression Bar */}
            {customer.nextTier ? (
              <div className="w-full mb-5 p-3.5 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-500 mb-1.5">
                  <span>Hạng hiện tại</span>
                  <span>Kế tiếp: <strong className="text-[#E8420A]">{TIER_DISPLAY[customer.nextTier]?.label || customer.nextTier}</strong></span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-2">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-[#E8420A] h-full transition-colors duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, (customer.totalSpend / (customer.nextTierMinSpending || 1)) * 100))}%` }}
                  />
                </div>
                <div className="text-[11px] text-gray-400 leading-normal">
                  Đã tích lũy: <strong className="text-gray-700">{fmtMoney(customer.totalSpend)}</strong>
                  <br />
                  Cần thêm <strong className="text-[#E8420A]">{fmtMoney(customer.amountToNextTier)}</strong> để thăng hạng
                </div>
              </div>
            ) : (
              <div className="w-full mb-5 p-3 bg-amber-50/50 rounded border border-amber-200/50 text-center">
                <p className="text-xs font-bold text-amber-700">★ Hạng Kim Cương tối đa</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Khách hàng đã đạt thứ hạng cao nhất</p>
              </div>
            )}

            <div className="w-full space-y-0">
              {[
                {
                  icon: (
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                  text: customer.email,
                },
                {
                  icon: (
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  ),
                  text: customer.phone || 'Chưa cập nhật',
                },
                {
                  icon: (
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                  text: customer.address || 'Chưa cập nhật',
                },
                {
                  icon: (
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ),
                  text: `Tham gia: ${fmtDate(customer.joinDate)}`,
                },
              ].map((item, i, arr) => (
                <div key={item.text}>
                  <div className="flex items-center gap-3 py-3.5">
                    {item.icon}
                    <span className="text-sm text-gray-700">{item.text}</span>
                  </div>
                  {i < arr.length - 1 && <div className="border-t border-gray-100" />}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT section */}
          <div className="flex flex-col gap-4">
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Tổng chi tiêu"
                value={fmtMoney(customer.totalSpend)}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              />
              <StatCard
                label="Tổng đơn hàng"
                value={customer.totalOrders}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                }
              />
              <StatCard
                label="Đơn hoàn trả"
                value={customer.returnedOrders}
                valueClass="text-red-500"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                }
              />
              <StatCard
                label="Mua gần nhất"
                value={fmtDate(customer.lastPurchaseDate)}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </div>

            {/* Spending Trends Card */}
            <div className="bg-white rounded border border-gray-200 p-5 flex flex-col">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center justify-between">
                <span>Biểu đồ chi tiêu năm {new Date().getFullYear()}</span>
                {hoveredMonth !== null && (
                  <span className="text-xs font-semibold text-gray-500">
                    Tháng {hoveredMonth + 1}: <strong className="text-[#E8420A]">{fmtMoney(customer.monthlySpending?.[hoveredMonth] || 0)}</strong>
                  </span>
                )}
              </h3>
              
              {/* Bars container */}
              <div className="h-32 flex items-end justify-between gap-2.5 px-2.5 border-b border-gray-200 pb-2">
                {MONTH_NAMES.map((name, idx) => {
                  const spent = customer.monthlySpending?.[idx] || 0
                  const maxSpent = Math.max(...(customer.monthlySpending || []), 1)
                  const heightPercent = maxSpent > 0 ? (spent / maxSpent) * 100 : 0
                  const isHovered = hoveredMonth === idx

                  return (
                    <div 
                      key={name?.id ?? name?.code ?? name?.name ?? name?.key ?? name?.val ?? name} 
                      className="flex-1 flex flex-col items-center h-full group relative"
                      onMouseEnter={() => setHoveredMonth(idx)}
                      onMouseLeave={() => setHoveredMonth(null)}
                    >
                      {/* Bar fill wrapper */}
                      <div className="w-full flex-1 flex items-end">
                        <div 
                          className={`w-full rounded-t-sm transition-all duration-300 ${
                            isHovered ? 'bg-[#E8420A]' : 'bg-gradient-to-t from-amber-400 to-[#E8420A]/80'
                          }`}
                          style={{ height: `${Math.max(4, heightPercent)}%` }}
                        />
                      </div>
                      
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-1.5 hidden group-hover:block z-10 bg-gray-900 text-white text-[10px] py-1 px-1.5 rounded whitespace-nowrap pointer-events-none shadow-md">
                        {fmtMoney(spent)}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Labels container */}
              <div className="flex justify-between gap-2.5 px-2.5 pt-1.5">
                {MONTH_NAMES.map((name, idx) => (
                  <span 
                    key={name} 
                    className={`flex-1 text-center text-[10px] font-semibold ${
                      hoveredMonth === idx ? 'text-[#E8420A] font-bold' : 'text-gray-400'
                    }`}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>

            {/* Tabs + Table */}
            <div className="bg-white rounded border border-gray-200 flex-1 overflow-hidden">
              <div className="flex border-b border-gray-200 px-5">
                {TABS.map((tab) => (
                  <button aria-label="Thao tác" type="button"
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-3 mr-4 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                      activeTab === tab
                        ? 'border-[#E8420A] text-[#E8420A]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 'Lịch sử giao dịch' && (
                <div className="overflow-x-auto">
                  <div className="min-w-[700px]">
                    <div className="grid grid-cols-[140px_110px_1fr_130px_130px] gap-2 px-5 py-3.5 border-b border-gray-100">
                      {['MÃ ĐƠN', 'NGÀY ĐẶT', 'TỔNG TIỀN', 'THANH TOÁN', 'TRẠNG THÁI'].map((h) => (
                        <span key={h} className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                          {h}
                        </span>
                      ))}
                    </div>

                    {customer.recentOrders.length === 0 ? (
                      <div className="px-5 py-16 text-center text-sm text-gray-400">
                        Khách hàng chưa có đơn hàng nào.
                      </div>
                    ) : (
                      customer.recentOrders.map((order) => {
                        const st = STATUS_DISPLAY[order.orderStatus] || { label: order.orderStatus, bg: 'bg-gray-100', text: 'text-gray-500' }
                        return (
                          <div
                            key={order.id}
                            className="grid grid-cols-[140px_110px_1fr_130px_130px] gap-2 px-5 py-4 border-b border-gray-100 last:border-0 items-center"
                          >
                            <span className="text-sm font-mono font-semibold text-gray-700">
                              {order.id.substring(0, 10).toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-600">{fmtDate(order.orderDate)}</span>
                            <span className="text-sm font-semibold text-gray-800">{fmtMoney(order.total)}</span>
                            <span className="text-sm text-gray-700">{order.paymentMethod || 'N/A'}</span>
                            <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-semibold w-fit ${st.bg} ${st.text}`}>
                              {st.label}
                            </span>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'Sản phẩm đã mua' && (
                <div className="overflow-x-auto">
                  <div className="min-w-[700px]">
                    <div className="grid grid-cols-[1fr_150px_100px_140px] gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50 items-center">
                      {['TÊN SẢN PHẨM', 'PHÂN LOẠI', 'SỐ LƯỢNG', 'MUA GẦN NHẤT'].map((h) => (
                        <span key={h} className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                          {h}
                        </span>
                      ))}
                    </div>

                    {!customer.purchasedProducts || customer.purchasedProducts.length === 0 ? (
                      <div className="px-5 py-16 text-center text-sm text-gray-400">
                        Khách hàng chưa mua sản phẩm nào.
                      </div>
                    ) : (
                      customer.purchasedProducts.map((item) => (
                        <div
                          key={item.id || item.productId || item.productName}
                          className="grid grid-cols-[1fr_150px_100px_140px] gap-2 px-5 py-4 border-b border-gray-100 last:border-0 items-center hover:bg-gray-50 transition-colors"
                        >
                          {/* Tên sản phẩm + Hình ảnh */}
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0">
                              {item.productImageUrl ? (
                                <img
                                  src={item.productImageUrl}
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.productName}</p>
                              <p className="text-xs text-gray-400 mt-0.5">ID: {item.productId}</p>
                            </div>
                          </div>

                          {/* Phân loại */}
                          <span className="text-sm text-gray-600 font-medium">
                            {item.variantName || 'Mặc định'}
                          </span>

                          {/* Số lượng */}
                          <span className="text-sm text-gray-800 font-bold bg-gray-100 px-2 py-0.5 rounded w-fit">
                            {item.quantity}
                          </span>

                          {/* Ngày mua gần nhất */}
                          <span className="text-sm text-gray-500">
                            {fmtDate(item.lastPurchaseDate)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'Ghi chú' && (
                <div className="px-5 py-6">
                  {/* Form to Add Note */}
                  <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label htmlFor="new-customer-note" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Thêm ghi chú mới
                    </label>
                    <textarea
                      id="new-customer-note"
                      aria-label="Thêm ghi chú mới"
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Nhập ghi chú nội bộ về khách hàng (ví dụ: thói quen mua sắm, yêu cầu đặc biệt...)"
                      rows={3}
                      className="w-full border border-gray-300 rounded p-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E8420A] bg-white resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <button aria-label="Lưu ghi chú" type="button"
                        onClick={handleAddNote}
                        disabled={!newNoteContent.trim()}
                        className="bg-[#E8420A] hover:bg-[#C4350A] disabled:opacity-50 text-white font-semibold py-2 px-4 rounded text-xs transition-colors cursor-pointer"
                      >
                        Lưu ghi chú
                      </button>
                    </div>
                  </div>

                  {/* List of Notes */}
                  <div className="space-y-4">
                    {!customer.notes || customer.notes.length === 0 ? (
                      <p className="py-8 text-center text-sm text-gray-400">
                        Chưa có ghi chú nào về khách hàng này.
                      </p>
                    ) : (
                      customer.notes.map((note) => {
                        const isEditing = editingNoteId === note.id
                        return (
                          <div
                            key={note.id}
                            className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow transition-shadow flex flex-col gap-2"
                          >
                            {/* Author name & date */}
                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <span className="font-semibold text-gray-600">{note.authorName}</span>
                              <span>{fmtDate(note.createdAt)}</span>
                            </div>

                            {/* Content or Edit Textarea */}
                            {isEditing ? (
                              <div className="flex flex-col gap-2 mt-1">
                                <textarea
                                  aria-label="Chỉnh sửa ghi chú"
                                  value={editingNoteContent}
                                  onChange={(e) => setEditingNoteContent(e.target.value)}
                                  rows={2}
                                  className="w-full border border-gray-300 rounded p-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E8420A] bg-white resize-none"
                                />
                                <div className="flex justify-end gap-2">
                                  <button aria-label="Hủy chỉnh sửa ghi chú" type="button"
                                    onClick={() => setEditingNoteId(null)}
                                    className="border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 py-1 px-3 rounded text-xs transition-colors cursor-pointer"
                                  >
                                    Hủy
                                  </button>
                                  <button aria-label="Lưu chỉnh sửa ghi chú" type="button"
                                    onClick={() => handleUpdateNote(note.id)}
                                    disabled={!editingNoteContent.trim()}
                                    className="bg-[#E8420A] hover:bg-[#C4350A] disabled:opacity-50 text-white py-1 px-3 rounded text-xs transition-colors cursor-pointer"
                                  >
                                    Cập nhật
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm text-gray-700 whitespace-pre-line mt-1">
                                  {note.content}
                                </p>
                                <div className="flex justify-end gap-3 mt-1 pt-2 border-t border-gray-50">
                                  <button aria-label="Thao tác" type="button"
                                    onClick={() => {
                                      setEditingNoteId(note.id)
                                      setEditingNoteContent(note.content)
                                    }}
                                    className="text-xs text-gray-400 hover:text-[#E8420A] transition-colors cursor-pointer"
                                  >
                                    Sửa
                                  </button>
                                  <button aria-label="Thao tác" type="button"
                                    onClick={() => handleDeleteNote(note.id)}
                                    className="text-xs text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
