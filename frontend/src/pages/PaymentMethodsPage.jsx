import { useNav } from '../hooks/useNav'

const CHECKERBOARD = {
  backgroundImage: `
    linear-gradient(45deg, #c9cdd4 25%, transparent 25%),
    linear-gradient(-45deg, #c9cdd4 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #c9cdd4 75%),
    linear-gradient(-45deg, transparent 75%, #c9cdd4 75%)
  `,
  backgroundSize: '18px 18px',
  backgroundPosition: '0 0, 0 9px, 9px -9px, -9px 0px',
  backgroundColor: '#dde1e7',
}

function CreditCard({ brand, lastFour, holder, expiry, isDefault, dark }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col justify-between transition-all duration-200"
      style={dark
        ? { background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', minHeight: '180px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }
        : { background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', border: '1.5px solid var(--cb)', minHeight: '180px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }
      }
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = dark ? '0 12px 28px rgba(0,0,0,0.15)' : '0 8px 24px rgba(0,0,0,0.05)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none'
        e.currentTarget.style.boxShadow = dark ? '0 4px 20px rgba(0,0,0,0.06)' : '0 4px 20px rgba(0,0,0,0.02)'
      }}
    >
      {/* Top row: brand + default badge */}
      <div className="flex items-start justify-between">
        <div className={`px-2.5 py-1 rounded-md text-xs font-black tracking-wider shadow-sm`}
          style={dark ? { backgroundColor: 'white', color: 'var(--accent)' } : { backgroundColor: 'white', color: 'var(--ct1)' }}>
          {brand}
        </div>
        {isDefault && (
          <span className="text-white text-xs font-bold px-3 py-1 rounded-full"
            style={{ backgroundColor: 'var(--accent)', boxShadow: '0 2px 8px rgba(232,66,10,0.2)' }}>
            Mặc định
          </span>
        )}
      </div>

      {/* Card number */}
      <p className={`text-base font-mono tracking-widest mt-4 ${dark ? 'text-white' : 'text-gray-700'}`}>
        * * * *  * * * *  * * * *  {lastFour}
      </p>

      {/* Bottom: holder + expiry */}
      <div className="flex items-end justify-between mt-3">
        <div>
          <p className={`text-[10px] font-semibold tracking-widest uppercase mb-0.5 ${dark ? 'text-slate-400' : 'text-gray-400'}`}>
            Chủ thẻ
          </p>
          <p className={`text-sm font-bold tracking-wide ${dark ? 'text-white' : 'text-gray-800'}`}>
            {holder}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-[10px] font-semibold tracking-widest uppercase mb-0.5 ${dark ? 'text-slate-400' : 'text-gray-400'}`}>
            Hết hạn
          </p>
          <p className={`text-sm font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>
            {expiry}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentMethodsPage() {
  const onNavigate = useNav()
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">

      {/* ── Top header ── */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {['Shop', 'Support', 'Business'].map((link) => (
            <button key={link} className="text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer transition-colors">
              {link}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 bg-gray-900 hover:bg-gray-800 rounded-full flex items-center justify-center cursor-pointer transition-colors">
            <svg className="w-4.5 h-4.5 text-white w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
          <button className="w-9 h-9 bg-gray-900 hover:bg-gray-800 rounded-full flex items-center justify-center cursor-pointer transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── Page content ── */}
      <div className="px-8 py-8 space-y-6 flex-1">

        {/* Page title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">Quản lý phương thức thanh toán</h1>
          <p className="text-sm text-gray-500 mt-2">
            Quản lý an toàn thẻ tín dụng và ví điện tử được liên kết của bạn để thanh toán nhanh hơn.
          </p>
        </div>

        {/* ── Section 1: Credit/Debit cards ── */}
        <div className="bg-white rounded-2xl border border-gray-200 px-6 py-6">
          {/* Section header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h2 className="text-base font-bold text-gray-900">Thẻ Tín Dụng / Ghi Nợ</h2>
            </div>
            <button onClick={() => onNavigate('addCard')}
              className="flex items-center gap-1.5 text-white font-bold py-2 px-4 rounded-xl text-sm transition-all duration-200 cursor-pointer"
              style={{ backgroundColor: 'var(--accent)', boxShadow: '0 4px 12px rgba(232, 66, 10, 0.18)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-d)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Thêm Thẻ Mới
            </button>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-2 gap-4">
            <CreditCard
              brand="VISA" lastFour="4242" holder="NGUYEN VAN A"
              expiry="12/25" isDefault dark
            />
            <CreditCard
              brand="MC" lastFour="8888" holder="NGUYEN VAN A"
              expiry="08/26" isDefault={false} dark={false}
            />
          </div>
        </div>

        {/* ── Section 2: E-wallets ── */}
        <div className="bg-white rounded-2xl border border-gray-200 px-6 py-6">
          {/* Section header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M3 6h18M3 14h18M3 18h18" />
              </svg>
              <h2 className="text-base font-bold text-gray-900">Ví Điện Tử &amp; Phương Thức Khác</h2>
            </div>
            <button className="flex items-center gap-1.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-xl text-sm transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Liên Kết Ví Mới
            </button>
          </div>

          {/* Wallet items */}
          <div className="space-y-3">
            {/* MoMo */}
            <div className="flex items-center gap-4 border border-gray-200 rounded-xl px-4 py-4">
              <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center shrink-0">
                <span className="text-lg font-black text-rose-600">M</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Ví MoMo</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-gray-500">090 **** 123</span>
                </div>
              </div>
              <button className="flex items-center gap-1.5 text-sm font-medium text-rose-500 hover:text-rose-700 cursor-pointer transition-colors shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728M12 12h.01" />
                </svg>
                Hủy liên kết
              </button>
            </div>

            {/* Add more wallet (dashed) */}
            <div className="flex items-center gap-4 border border-dashed border-gray-300 rounded-xl px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">ZaloPay, ShopeePay...</p>
                <p className="text-xs text-gray-400 mt-0.5">Nhấn để liên kết thêm ví</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
