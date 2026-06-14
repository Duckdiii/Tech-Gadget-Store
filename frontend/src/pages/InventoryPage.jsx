import { useState, useRef } from 'react'

/* ── Shared helpers ── */
function fmt(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(3).replace(/\.?0+$/, '') + ' tỷ'
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + ' tr'
  return n.toLocaleString('vi-VN') + ' đ'
}

/* ══════════════════════════════════════════════════
   INVENTORY (TAB 1)
══════════════════════════════════════════════════ */
const STATUS_CONFIG = {
  sap_het:  { label: 'Sắp hết',   bg: 'bg-orange-100', text: 'text-orange-600', barColor: 'bg-red-500' },
  con_hang: { label: 'Còn hàng',  bg: 'bg-green-100',  text: 'text-green-700',  barColor: 'bg-green-500' },
  het_hang: { label: 'Hết hàng',  bg: 'bg-gray-200',   text: 'text-gray-500',   barColor: 'bg-gray-300' },
}

const PRODUCTS = [
  { id: 1, img: 'https://placehold.co/48x48/e0e7ff/4f46e5?text=IP', name: 'iPhone 15 Pro Max 256GB',  sku: 'IP15PM-256-BLK', category: 'Smartphones', price: 32990000, stock: 15,  maxStock: 100, status: 'sap_het',  faded: false },
  { id: 2, img: 'https://placehold.co/48x48/d1d5db/374151?text=MB', name: 'MacBook Air M3 8GB',        sku: 'MBA-M3-8-SLV',   category: 'Laptops',     price: 28990000, stock: 42,  maxStock: 50,  status: 'con_hang', faded: false },
  { id: 3, img: 'https://placehold.co/48x48/d1d5db/9ca3af?text=AW', name: 'Apple Watch Series 9 45mm', sku: 'AWS9-45-MID',     category: 'Accessories', price: 11990000, stock: 0,   maxStock: 200, status: 'het_hang', faded: true  },
  { id: 4, img: 'https://placehold.co/48x48/fef3c7/d97706?text=S2', name: 'Samsung Galaxy S24 Ultra',  sku: 'SGS24U-256-BLK', category: 'Smartphones', price: 27490000, stock: 88,  maxStock: 120, status: 'con_hang', faded: false },
  { id: 5, img: 'https://placehold.co/48x48/ede9fe/7c3aed?text=AP', name: 'AirPods Pro 2nd Gen',       sku: 'APP2-WHT',        category: 'Accessories', price: 5990000,  stock: 6,   maxStock: 80,  status: 'sap_het',  faded: false },
  { id: 6, img: 'https://placehold.co/48x48/dbeafe/1d4ed8?text=IP', name: 'iPad Pro 11" M4 Wi-Fi',     sku: 'IPP11-M4-256',   category: 'Tablets',     price: 21990000, stock: 24,  maxStock: 60,  status: 'con_hang', faded: false },
]

function StockBar({ stock, maxStock, barColor }) {
  const pct = maxStock > 0 ? Math.round((stock / maxStock) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">{stock}/{maxStock}</span>
    </div>
  )
}

function InventoryTab() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const filtered = PRODUCTS.filter((p) => {
    const q = search.toLowerCase()
    return (
      (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) &&
      (!category || p.category === category) &&
      (!statusFilter || p.status === statusFilter)
    )
  })

  return (
    <>
      {/* Title row */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tồn kho</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Tổng: 12,450 sản phẩm · <span className="text-red-500 font-semibold">Sắp hết: 45 SKU</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded text-sm cursor-pointer transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Xuất CSV
          </button>
          <button className="flex items-center gap-2 bg-[#E8420A] hover:bg-[#C4350A] text-white font-semibold py-2 px-4 rounded text-sm cursor-pointer transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tên sản phẩm hoặc SKU..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A] bg-white" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer">
          <option value="">Tất cả danh mục</option>
          {['Smartphones','Laptops','Accessories','Tablets'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer">
          <option value="">Trạng thái kho</option>
          <option value="sap_het">Sắp hết</option>
          <option value="con_hang">Còn hàng</option>
          <option value="het_hang">Hết hàng</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-[3.5rem_1fr_9rem_8rem_8rem_12rem_8rem_4rem] gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
          {['ẢNH','SẢN PHẨM','SKU','DANH MỤC','GIÁ (VNĐ)','MỨC TỒN KHO','TRẠNG THÁI',''].map((h,i) => (
            <span key={i} className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{h}</span>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">Không tìm thấy sản phẩm nào.</div>
        ) : filtered.map((p) => (
          <div key={p.id} className={`grid grid-cols-[3.5rem_1fr_9rem_8rem_8rem_12rem_8rem_4rem] gap-2 px-5 py-4 border-b border-gray-50 last:border-0 items-center ${p.faded ? 'opacity-50' : ''}`}>
            <img src={p.img} alt={p.name} className="w-10 h-10 rounded object-cover" />
            <span className="text-sm font-semibold text-gray-800">{p.name}</span>
            <span className="text-xs font-mono text-gray-500">{p.sku}</span>
            <span className="text-sm text-gray-600">{p.category}</span>
            <span className="text-sm font-medium text-gray-800">{p.price.toLocaleString('vi-VN')}</span>
            <StockBar stock={p.stock} maxStock={p.maxStock} barColor={STATUS_CONFIG[p.status].barColor} />
            <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded ${STATUS_CONFIG[p.status].bg} ${STATUS_CONFIG[p.status].text}`}>
              {STATUS_CONFIG[p.status].label}
            </span>
            <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded cursor-pointer transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        ))}
        <div className="px-5 py-4 flex items-center justify-between border-t border-gray-100">
          <span className="text-sm text-gray-400">Hiển thị {filtered.length} / 12,450 sản phẩm</span>
          <div className="flex items-center gap-1">
            {[1,2,3,'...',415].map((n,i) => (
              typeof n === 'number' && n !== 415 ? (
                <button key={i} onClick={() => setPage(n)} className={`w-8 h-8 rounded text-sm font-medium cursor-pointer ${page===n ? 'bg-[#E8420A] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{n}</button>
              ) : n === '...' ? (
                <span key={i} className="w-8 h-8 flex items-center justify-center text-gray-300 text-sm">…</span>
              ) : (
                <button key={i} onClick={() => setPage(415)} className={`w-8 h-8 rounded text-sm font-medium cursor-pointer ${page===415 ? 'bg-[#E8420A] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>415</button>
              )
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════
   IMPORT LOG (TAB 2)
══════════════════════════════════════════════════ */
const IMPORT_LOGS = [
  {
    id: 'IMP-2024-061301', date: '13/06/2024', time: '09:15',
    supplier: 'Apple Vietnam Co., Ltd',
    items: [
      { name: 'iPhone 15 Pro Max 256GB', sku: 'IP15PM-256-BLK', qty: 50, unitPrice: 27500000 },
      { name: 'iPhone 15 Pro 128GB',     sku: 'IP15P-128-BLK',  qty: 30, unitPrice: 24000000 },
    ],
    total: 2095000000, staff: 'Lê Hoàng Dũng', status: 'completed',
    note: 'Hàng nhập đợt Q2/2024 theo hợp đồng HĐ-2024-APL-02',
  },
  {
    id: 'IMP-2024-061201', date: '12/06/2024', time: '14:30',
    supplier: 'Samsung Vietnam Electronics',
    items: [
      { name: 'Samsung Galaxy S24 Ultra 256GB', sku: 'SGS24U-256-BLK', qty: 40, unitPrice: 25000000 },
      { name: 'Samsung Galaxy S24+ 256GB',      sku: 'SGS24P-256-BLK', qty: 25, unitPrice: 18000000 },
    ],
    total: 1450000000, staff: 'Lê Hoàng Dũng', status: 'completed',
    note: '',
  },
  {
    id: 'IMP-2024-061001', date: '10/06/2024', time: '08:00',
    supplier: 'Lenovo Vietnam',
    items: [
      { name: 'ThinkPad X1 Carbon Gen 12', sku: 'LNV-X1C12-I7',  qty: 15, unitPrice: 42000000 },
      { name: 'IdeaPad Slim 5 Pro',         sku: 'LNV-IDS5P-R7', qty: 20, unitPrice: 21000000 },
    ],
    total: 1050000000, staff: 'Đỗ Thị Lan', status: 'completed',
    note: '',
  },
  {
    id: 'IMP-2024-060801', date: '08/06/2024', time: '11:00',
    supplier: 'Sony Vietnam',
    items: [
      { name: 'Sony WH-1000XM5',  sku: 'SNY-WH1000XM5', qty: 60, unitPrice: 6990000 },
      { name: 'Sony WF-1000XM5',  sku: 'SNY-WF1000XM5', qty: 40, unitPrice: 5990000 },
    ],
    total: 657200000, staff: 'Lê Hoàng Dũng', status: 'completed',
    note: 'Giao hàng 2 đợt',
  },
  {
    id: 'IMP-2024-060501', date: '05/06/2024', time: '09:45',
    supplier: 'DJI Vietnam Distribution',
    items: [
      { name: 'DJI Mini 4 Pro (fly more)', sku: 'DJI-MINI4P-FM', qty: 10, unitPrice: 19990000 },
    ],
    total: 199900000, staff: 'Đỗ Thị Lan', status: 'pending',
    note: 'Chờ kiểm tra chất lượng',
  },
]

function ImportReceiptModal({ log, onClose }) {
  const ref = useRef()
  const subtotal = log.items.reduce((s, it) => s + it.qty * it.unitPrice, 0)

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded shadow-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto">
          <div ref={ref} className="p-8">
            {/* Receipt header */}
            <div className="text-center border-b-2 border-dashed border-gray-200 pb-5 mb-5">
              <div className="w-12 h-12 bg-[#E8420A] rounded flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-black text-base">TS</span>
              </div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">TECHSTORE</h2>
              <p className="text-xs text-gray-400 mt-0.5">123 Nguyễn Huệ, Q.1, TP.HCM · 028 3825 1234</p>
              <div className="mt-4 inline-block bg-orange-50 border border-orange-200 rounded px-5 py-2">
                <p className="text-sm font-black text-[#C4350A] uppercase tracking-widest">Phiếu Nhập Kho</p>
              </div>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-5 text-sm">
              <div><span className="text-gray-400 text-xs">Mã phiếu</span><p className="font-bold text-gray-800 font-mono">{log.id}</p></div>
              <div><span className="text-gray-400 text-xs">Ngày giờ</span><p className="font-semibold text-gray-800">{log.date} {log.time}</p></div>
              <div><span className="text-gray-400 text-xs">Nhà cung cấp</span><p className="font-semibold text-gray-800">{log.supplier}</p></div>
              <div><span className="text-gray-400 text-xs">Thủ kho</span><p className="font-semibold text-gray-800">{log.staff}</p></div>
            </div>

            {/* Items */}
            <div className="border border-gray-200 rounded overflow-hidden mb-5">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-500">Sản phẩm</th>
                    <th className="text-center px-3 py-2.5 text-xs font-bold text-gray-500">SL</th>
                    <th className="text-right px-4 py-2.5 text-xs font-bold text-gray-500">Đơn giá</th>
                    <th className="text-right px-4 py-2.5 text-xs font-bold text-gray-500">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {log.items.map((it, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{it.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{it.sku}</p>
                      </td>
                      <td className="px-3 py-3 text-center font-semibold text-gray-700">{it.qty}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{it.unitPrice.toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">{(it.qty * it.unitPrice).toLocaleString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="bg-orange-50 rounded p-4 mb-5">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Tạm tính</span>
                <span className="font-medium text-gray-700">{subtotal.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">VAT (10%)</span>
                <span className="font-medium text-gray-700">{Math.round(subtotal * 0.1).toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="border-t border-orange-200 mt-2 pt-2 flex justify-between">
                <span className="font-bold text-gray-800">Tổng cộng</span>
                <span className="font-black text-[#C4350A] text-lg">{Math.round(subtotal * 1.1).toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            {/* Note */}
            {log.note && (
              <div className="bg-gray-50 rounded px-4 py-3 mb-5">
                <p className="text-xs text-gray-400 font-semibold mb-0.5">GHI CHÚ</p>
                <p className="text-sm text-gray-700">{log.note}</p>
              </div>
            )}

            {/* Signatures */}
            <div className="border-t-2 border-dashed border-gray-200 pt-5 grid grid-cols-2 gap-6 text-center">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-8">Thủ kho</p>
                <div className="border-t border-gray-300 pt-2">
                  <p className="text-xs text-gray-400">(Ký, ghi rõ họ tên)</p>
                  <p className="text-sm font-semibold text-gray-700 mt-1">{log.staff}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-8">Đại diện NCC</p>
                <div className="border-t border-gray-300 pt-2">
                  <p className="text-xs text-gray-400">(Ký, ghi rõ họ tên)</p>
                  <p className="text-sm font-semibold text-gray-700 mt-1">&nbsp;</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 px-8 pb-6">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Đóng</button>
            <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#E8420A] hover:bg-[#C4350A] text-white rounded text-sm font-semibold cursor-pointer transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              In phiếu nhập
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function ImportLogTab() {
  const [search, setSearch]       = useState('')
  const [supplier, setSupplier]   = useState('')
  const [status, setStatus]       = useState('')
  const [receipt, setReceipt]     = useState(null)

  const suppliers = [...new Set(IMPORT_LOGS.map(l => l.supplier))]

  const filtered = IMPORT_LOGS.filter(l => {
    const q = search.toLowerCase()
    return (
      (!q || l.id.toLowerCase().includes(q) || l.supplier.toLowerCase().includes(q) || l.items.some(it => it.name.toLowerCase().includes(q))) &&
      (!supplier || l.supplier === supplier) &&
      (!status || l.status === status)
    )
  })

  const totalValue = filtered.reduce((s, l) => s + l.total, 0)

  return (
    <>
      {/* Title */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nhật ký nhập hàng</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} phiếu · Tổng giá trị: <span className="font-semibold text-[#E8420A]">{fmt(totalValue)}</span></p>
        </div>
        <button className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2 px-4 rounded text-sm cursor-pointer transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Xuất Excel
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Mã phiếu, NCC, sản phẩm..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]" />
        </div>
        <select value={supplier} onChange={e => setSupplier(e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer">
          <option value="">Tất cả NCC</option>
          {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer">
          <option value="">Tất cả trạng thái</option>
          <option value="completed">Hoàn thành</option>
          <option value="pending">Chờ duyệt</option>
          <option value="cancelled">Đã huỷ</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Mã phiếu','Ngày nhập','Nhà cung cấp','Mặt hàng','Tổng tiền','Thủ kho','Trạng thái',''].map((h,i) => (
                <th key={i} className={`px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide ${i >= 4 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-400">Không tìm thấy phiếu nhập nào</td></tr>
            ) : filtered.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50/60 transition-colors group">
                <td className="px-4 py-4">
                  <span className="font-mono text-xs font-semibold text-[#C4350A] bg-orange-50 px-2 py-0.5 rounded">{log.id}</span>
                </td>
                <td className="px-4 py-4">
                  <p className="text-gray-800 font-medium">{log.date}</p>
                  <p className="text-xs text-gray-400">{log.time}</p>
                </td>
                <td className="px-4 py-4 max-w-[180px]">
                  <p className="text-gray-700 font-medium truncate">{log.supplier}</p>
                </td>
                <td className="px-4 py-4">
                  <div className="space-y-0.5">
                    {log.items.slice(0, 2).map((it, i) => (
                      <p key={i} className="text-xs text-gray-500 truncate max-w-[160px]">· {it.name} <span className="text-gray-400">(×{it.qty})</span></p>
                    ))}
                    {log.items.length > 2 && <p className="text-xs text-gray-400">+{log.items.length - 2} mặt hàng khác</p>}
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="font-bold text-gray-800">{fmt(log.total)}</span>
                </td>
                <td className="px-4 py-4 text-right text-gray-600">{log.staff}</td>
                <td className="px-4 py-4 text-right">
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${log.status === 'completed' ? 'bg-green-100 text-green-700' : log.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
                    {log.status === 'completed' ? 'Hoàn thành' : log.status === 'pending' ? 'Chờ duyệt' : 'Đã huỷ'}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <button
                    onClick={() => setReceipt(log)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-[#E8420A] hover:text-[#C4350A] px-3 py-1.5 rounded hover:bg-orange-50 cursor-pointer whitespace-nowrap"
                  >
                    Xem phiếu →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {receipt && <ImportReceiptModal log={receipt} onClose={() => setReceipt(null)} />}
    </>
  )
}

/* ══════════════════════════════════════════════════
   EXPORT LOG (TAB 3)
══════════════════════════════════════════════════ */
const EXPORT_TYPE = {
  sale:     { label: 'Bán hàng',      bg: 'bg-orange-50',   text: 'text-[#C4350A]'   },
  transfer: { label: 'Điều chuyển',   bg: 'bg-purple-100', text: 'text-purple-700' },
  damage:   { label: 'Hàng hỏng',     bg: 'bg-red-100',    text: 'text-red-600'    },
  return:   { label: 'Trả NCC',        bg: 'bg-amber-100',  text: 'text-amber-700'  },
}

const EXPORT_LOGS = [
  {
    id: 'EXP-2024-061301', date: '13/06/2024', time: '10:30', type: 'sale',
    recipient: 'Nguyễn Văn A', recipientDetail: 'Đơn hàng TG-240601',
    items: [{ name: 'iPhone 15 Pro Max 256GB', sku: 'IP15PM-256-BLK', qty: 1, unitPrice: 32990000 }],
    total: 32990000, staff: 'Vũ Quốc Hùng', status: 'completed', note: '',
  },
  {
    id: 'EXP-2024-061302', date: '13/06/2024', time: '14:05', type: 'sale',
    recipient: 'Trần Thị B', recipientDetail: 'Đơn hàng TG-240602',
    items: [{ name: 'MacBook Air M3 8GB', sku: 'MBA-M3-8-SLV', qty: 1, unitPrice: 28990000 }],
    total: 28990000, staff: 'Nguyễn Thị Bích', status: 'completed', note: '',
  },
  {
    id: 'EXP-2024-061201', date: '12/06/2024', time: '09:00', type: 'transfer',
    recipient: 'Chi nhánh Hà Nội', recipientDetail: 'PO điều chuyển TC-2024-06',
    items: [
      { name: 'AirPods Pro 2nd Gen',       sku: 'APP2-WHT',        qty: 10, unitPrice: 5990000 },
      { name: 'Apple Watch Series 9 45mm', sku: 'AWS9-45-MID',     qty: 5,  unitPrice: 11990000 },
    ],
    total: 119900000, staff: 'Lê Hoàng Dũng', status: 'completed', note: 'Điều chuyển theo kế hoạch Q2',
  },
  {
    id: 'EXP-2024-061202', date: '12/06/2024', time: '15:20', type: 'sale',
    recipient: 'Phạm Văn D', recipientDetail: 'Đơn hàng TG-240604',
    items: [{ name: 'Samsung Galaxy S24 Ultra 256GB', sku: 'SGS24U-256-BLK', qty: 1, unitPrice: 27490000 }],
    total: 27490000, staff: 'Vũ Quốc Hùng', status: 'completed', note: '',
  },
  {
    id: 'EXP-2024-061101', date: '11/06/2024', time: '08:30', type: 'damage',
    recipient: 'Kho hỏng nội bộ', recipientDetail: 'Biên bản số BH-2024-06-11',
    items: [{ name: 'Apple Watch Series 9 45mm', sku: 'AWS9-45-MID', qty: 3, unitPrice: 11990000 }],
    total: 35970000, staff: 'Lê Hoàng Dũng', status: 'completed', note: 'Màn hình nứt, không sửa được',
  },
  {
    id: 'EXP-2024-061001', date: '10/06/2024', time: '11:45', type: 'return',
    recipient: 'DJI Vietnam Distribution', recipientDetail: 'Lô hàng lỗi batch B2406',
    items: [{ name: 'DJI Mini 4 Pro (fly more)', sku: 'DJI-MINI4P-FM', qty: 2, unitPrice: 19990000 }],
    total: 39980000, staff: 'Đỗ Thị Lan', status: 'completed', note: 'Trả hàng lỗi motor',
  },
]

function ExportReceiptModal({ log, onClose }) {
  const subtotal = log.items.reduce((s, it) => s + it.qty * it.unitPrice, 0)
  const typeInfo = EXPORT_TYPE[log.type]

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded shadow-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            {/* Receipt header */}
            <div className="text-center border-b-2 border-dashed border-gray-200 pb-5 mb-5">
              <div className="w-12 h-12 bg-[#E8420A] rounded flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-black text-base">TS</span>
              </div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">TECHSTORE</h2>
              <p className="text-xs text-gray-400 mt-0.5">123 Nguyễn Huệ, Q.1, TP.HCM · 028 3825 1234</p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <div className="inline-block bg-gray-900 text-white rounded px-5 py-2">
                  <p className="text-sm font-black uppercase tracking-widest">Phiếu Xuất Kho</p>
                </div>
                <span className={`text-xs font-bold px-3 py-2 rounded ${typeInfo.bg} ${typeInfo.text}`}>{typeInfo.label}</span>
              </div>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-5 text-sm">
              <div><span className="text-gray-400 text-xs">Mã phiếu</span><p className="font-bold text-gray-800 font-mono">{log.id}</p></div>
              <div><span className="text-gray-400 text-xs">Ngày giờ</span><p className="font-semibold text-gray-800">{log.date} {log.time}</p></div>
              <div><span className="text-gray-400 text-xs">Người nhận / Đích</span><p className="font-semibold text-gray-800">{log.recipient}</p></div>
              <div><span className="text-gray-400 text-xs">Tham chiếu</span><p className="font-semibold text-gray-800">{log.recipientDetail}</p></div>
              <div><span className="text-gray-400 text-xs">Nhân viên xuất</span><p className="font-semibold text-gray-800">{log.staff}</p></div>
            </div>

            {/* Items */}
            <div className="border border-gray-200 rounded overflow-hidden mb-5">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-500">Sản phẩm</th>
                    <th className="text-center px-3 py-2.5 text-xs font-bold text-gray-500">SL</th>
                    <th className="text-right px-4 py-2.5 text-xs font-bold text-gray-500">Đơn giá</th>
                    <th className="text-right px-4 py-2.5 text-xs font-bold text-gray-500">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {log.items.map((it, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{it.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{it.sku}</p>
                      </td>
                      <td className="px-3 py-3 text-center font-semibold text-gray-700">{it.qty}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{it.unitPrice.toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">{(it.qty * it.unitPrice).toLocaleString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="bg-gray-900 rounded p-4 mb-5">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Tạm tính</span>
                <span className="text-gray-200">{subtotal.toLocaleString('vi-VN')} đ</span>
              </div>
              {log.type === 'sale' && (
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">VAT (10%)</span>
                  <span className="text-gray-200">{Math.round(subtotal * 0.1).toLocaleString('vi-VN')} đ</span>
                </div>
              )}
              <div className="border-t border-gray-700 mt-2 pt-2 flex justify-between">
                <span className="font-bold text-white">Tổng cộng</span>
                <span className="font-black text-[#E8420A] text-lg">
                  {(log.type === 'sale' ? Math.round(subtotal * 1.1) : subtotal).toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            {/* Note */}
            {log.note && (
              <div className="bg-gray-50 rounded px-4 py-3 mb-5">
                <p className="text-xs text-gray-400 font-semibold mb-0.5">GHI CHÚ</p>
                <p className="text-sm text-gray-700">{log.note}</p>
              </div>
            )}

            {/* Signatures */}
            <div className="border-t-2 border-dashed border-gray-200 pt-5 grid grid-cols-2 gap-6 text-center">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-8">Người xuất kho</p>
                <div className="border-t border-gray-300 pt-2">
                  <p className="text-xs text-gray-400">(Ký, ghi rõ họ tên)</p>
                  <p className="text-sm font-semibold text-gray-700 mt-1">{log.staff}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-8">Người nhận</p>
                <div className="border-t border-gray-300 pt-2">
                  <p className="text-xs text-gray-400">(Ký, ghi rõ họ tên)</p>
                  <p className="text-sm font-semibold text-gray-700 mt-1">{log.recipient}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 px-8 pb-6">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Đóng</button>
            <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded text-sm font-semibold cursor-pointer transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              In biên lai
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function ExportLogTab() {
  const [search, setSearch]   = useState('')
  const [typeFilter, setType] = useState('')
  const [status, setStatus]   = useState('')
  const [receipt, setReceipt] = useState(null)

  const filtered = EXPORT_LOGS.filter(l => {
    const q = search.toLowerCase()
    return (
      (!q || l.id.toLowerCase().includes(q) || l.recipient.toLowerCase().includes(q) || l.items.some(it => it.name.toLowerCase().includes(q))) &&
      (!typeFilter || l.type === typeFilter) &&
      (!status || l.status === status)
    )
  })

  const totalValue = filtered.reduce((s, l) => s + l.total, 0)

  return (
    <>
      {/* Title */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nhật ký xuất hàng</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} phiếu · Tổng giá trị: <span className="font-semibold text-gray-700">{fmt(totalValue)}</span></p>
        </div>
        <button className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2 px-4 rounded text-sm cursor-pointer transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Xuất Excel
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Mã phiếu, người nhận, sản phẩm..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]" />
        </div>
        <select value={typeFilter} onChange={e => setType(e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer">
          <option value="">Tất cả loại xuất</option>
          <option value="sale">Bán hàng</option>
          <option value="transfer">Điều chuyển</option>
          <option value="damage">Hàng hỏng</option>
          <option value="return">Trả NCC</option>
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer">
          <option value="">Tất cả trạng thái</option>
          <option value="completed">Hoàn thành</option>
          <option value="pending">Chờ duyệt</option>
          <option value="cancelled">Đã huỷ</option>
        </select>

        {/* Type legend */}
        <div className="ml-auto flex items-center gap-2">
          {Object.entries(EXPORT_TYPE).map(([k, v]) => (
            <span key={k} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${v.bg} ${v.text}`}>{v.label}</span>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Mã phiếu','Ngày xuất','Loại','Người nhận / Đích','Mặt hàng','Tổng tiền','Nhân viên','Trạng thái','Biên lai'].map((h,i) => (
                <th key={i} className={`px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide ${i >= 5 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-12 text-gray-400">Không tìm thấy phiếu xuất nào</td></tr>
            ) : filtered.map((log) => {
              const typeInfo = EXPORT_TYPE[log.type]
              return (
                <tr key={log.id} className="hover:bg-gray-50/60 transition-colors group">
                  <td className="px-4 py-4">
                    <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{log.id}</span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-gray-800 font-medium">{log.date}</p>
                    <p className="text-xs text-gray-400">{log.time}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeInfo.bg} ${typeInfo.text}`}>{typeInfo.label}</span>
                  </td>
                  <td className="px-4 py-4 max-w-[160px]">
                    <p className="text-gray-800 font-medium truncate">{log.recipient}</p>
                    <p className="text-xs text-gray-400 truncate">{log.recipientDetail}</p>
                  </td>
                  <td className="px-4 py-4">
                    {log.items.slice(0, 2).map((it, i) => (
                      <p key={i} className="text-xs text-gray-500 truncate max-w-[160px]">· {it.name} <span className="text-gray-400">(×{it.qty})</span></p>
                    ))}
                    {log.items.length > 2 && <p className="text-xs text-gray-400">+{log.items.length - 2} mặt hàng</p>}
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-gray-800">{fmt(log.total)}</td>
                  <td className="px-4 py-4 text-right text-gray-600">{log.staff}</td>
                  <td className="px-4 py-4 text-right">
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${log.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {log.status === 'completed' ? 'Hoàn thành' : 'Chờ duyệt'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => setReceipt(log)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded cursor-pointer whitespace-nowrap"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Biên lai
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {receipt && <ExportReceiptModal log={receipt} onClose={() => setReceipt(null)} />}
    </>
  )
}

/* ══════════════════════════════════════════════════
   ROOT PAGE
══════════════════════════════════════════════════ */
const TABS = [
  {
    id: 'inventory',
    label: 'Tồn kho',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    id: 'import',
    label: 'Nhật ký nhập',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
  {
    id: 'export',
    label: 'Nhật ký xuất + Biên lai',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
]

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('inventory')

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-3 flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Tìm kiếm nhanh..." className="w-full pl-9 pr-4 py-2 bg-gray-100 border-0 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8420A]" />
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button className="relative p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <img src="https://placehold.co/34x34/374151/ffffff?text=NV" alt="avatar" className="w-8 h-8 rounded-full object-cover cursor-pointer" />
        </div>
      </header>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-100 px-8">
        <div className="flex items-center gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#E8420A] text-[#E8420A]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 py-7">
        {activeTab === 'inventory' && <InventoryTab />}
        {activeTab === 'import'    && <ImportLogTab />}
        {activeTab === 'export'    && <ExportLogTab />}
      </div>
    </div>
  )
}
