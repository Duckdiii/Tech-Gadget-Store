import { useNav } from '../../../hooks/useNav'
import StoreNavbar from '../../../components/StoreNavbar'
import OrderCard from '../components/OrderCard'
import { useCustomerOrders } from '../hooks/useCustomerOrders'

export default function CustomerOrdersPage() {
  const onNavigate = useNav()
  const {
    loading,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    filtered,
    getTabCount,
    handleCancelOrder,
  } = useCustomerOrders()

  const filterTabs = [
    { id: 'all',        label: 'Tất cả' },
    { id: 'pending',    label: 'Chờ xác nhận' },
    { id: 'processing', label: 'Đang xử lý' },
    { id: 'shipping',   label: 'Đang giao' },
    { id: 'completed',  label: 'Đã hoàn thành' },
    { id: 'cancelled',  label: 'Đã hủy' },
  ]

  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{ backgroundColor: 'var(--page)' }}>
      <StoreNavbar />

      {/* Dark header */}
      <div style={{ backgroundColor: 'var(--ink)', borderBottom: '1px solid var(--b1)' }} className="py-5">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-0.5" style={{ color: 'var(--accent)' }}>Tài khoản</p>
          <h1 className="text-[18px] font-bold" style={{ color: 'var(--t1)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Đơn hàng của tôi</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full px-4 py-6 text-gray-800">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm mb-5" style={{ color: 'var(--ct3)' }}>
          <span onClick={() => onNavigate('home')} className="cursor-pointer transition-colors"
            onMouseEnter={e => e.currentTarget.style.color = 'var(--ct1)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--ct3)'}
          >Trang chủ</span>
          <span>›</span>
          <span onClick={() => onNavigate('userProfile')} className="cursor-pointer transition-colors"
            onMouseEnter={e => e.currentTarget.style.color = 'var(--ct1)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--ct3)'}
          >Tài khoản</span>
          <span>›</span>
          <span style={{ color: 'var(--ct1)', fontWeight: 500 }}>Đơn hàng của tôi</span>
        </nav>

        {/* Search */}
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--ct3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo mã đơn hàng..."
            className="field-light w-full pl-9 pr-4 py-2.5 text-sm"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
          {filterTabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold transition-all duration-200 cursor-pointer border-none bg-transparent"
              style={activeTab === tab.id
                ? { backgroundColor: 'var(--accent)', color: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(232,66,10,0.18)' }
                : { backgroundColor: 'var(--card)', color: 'var(--ct2)', border: '1.5px solid var(--cb)', borderRadius: '8px' }
              }
            >
              {tab.label}
              <span className="text-[11px] font-bold px-2 py-0.5"
                style={{
                  backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : 'var(--page)',
                  color: activeTab === tab.id ? 'white' : 'var(--ct3)',
                  borderRadius: '20px',
                }}
              >{getTabCount(tab.id)}</span>
            </button>
          ))}
        </div>

        {/* Order list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--accent)' }}></div>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map(order => (
              <OrderCard key={order.id} order={order} onNavigate={onNavigate} onCancel={handleCancelOrder} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--card)', border: '1.5px solid var(--cb)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <svg className="w-8 h-8" style={{ color: 'var(--ct3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="font-bold" style={{ color: 'var(--ct2)' }}>Không có đơn hàng nào</p>
            <p className="text-sm mt-1" style={{ color: 'var(--ct3)' }}>Hãy thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
            <button onClick={() => onNavigate('list')}
              className="mt-5 text-white text-sm font-bold px-5 py-2.5 transition-all duration-200 cursor-pointer border-none"
              style={{ backgroundColor: 'var(--accent)', borderRadius: '10px', boxShadow: '0 4px 12px rgba(232,66,10,0.18)' }}
            >Mua sắm ngay</button>
          </div>
        )}
      </div>
    </div>
  )
}
