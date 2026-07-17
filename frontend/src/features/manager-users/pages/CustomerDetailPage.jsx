import { useState } from 'react'
import { useNav } from '../../../hooks/useNav'
import { useCustomerDetail } from '../hooks/useCustomerDetail'
import StatCard from '../components/StatCard'

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

function fmtMoney(n) { return (Number(n) || 0).toLocaleString('vi-VN') + ' đ' }
function fmtDate(iso) { return iso ? new Date(iso).toLocaleDateString('vi-VN') : '—' }
function initialsOf(name) {
  const trimmed = (name || '').trim()
  if (!trimmed) return '?'
  return trimmed.split(/\s+/).map((w) => w[0]).slice(-2).join('').toUpperCase()
}

export default function CustomerDetailPage() {
  const onNavigate = useNav()
  const { customer, loading, error } = useCustomerDetail()
  const [activeTab, setActiveTab] = useState(TABS[0])
  const [headerSearch, setHeaderSearch] = useState('')

  const handleHeaderSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      onNavigate('customerManagement', { state: { prefilledSearch: headerSearch } })
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--accent)' }}></div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-3">
        <p className="text-sm text-gray-500">{error || 'Không tìm thấy khách hàng.'}</p>
        <button
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
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-3 flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              onKeyDown={handleHeaderSearchSubmit}
              placeholder="Tìm kiếm khách hàng..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border-0 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8420A]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
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
              <span onClick={() => onNavigate('customerManagement')} className="hover:text-[#E8420A] cursor-pointer">Khách hàng</span>
              <span className="mx-2">›</span>
              <span className="text-gray-700 font-medium">{customer.fullName}</span>
            </p>
            <h1 className="text-3xl font-bold text-gray-900">Chi tiết khách hàng</h1>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <button className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium py-2.5 px-4 rounded text-sm transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
            <button className="flex items-center gap-2 bg-[#C4350A] hover:bg-[#0D0F14] text-white font-semibold py-2.5 px-4 rounded text-sm transition-colors cursor-pointer">
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

            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold mb-5 ${tier.bg} ${tier.border} ${tier.text}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              {tier.label}
            </span>

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
                <div key={i}>
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

            {/* Tabs + Table */}
            <div className="bg-white rounded border border-gray-200 flex-1 overflow-hidden">
              <div className="flex border-b border-gray-200 px-5">
                {TABS.map((tab) => (
                  <button
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

              {activeTab !== 'Lịch sử giao dịch' && (
                <div className="px-5 py-16 text-center text-sm text-gray-400">
                  Không có dữ liệu để hiển thị.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
