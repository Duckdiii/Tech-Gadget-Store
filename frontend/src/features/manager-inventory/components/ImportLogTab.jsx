import { useState, useRef } from 'react'
import { downloadCSV } from '../../../utils/exportHelper'

function fmt(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(3).replace(/\.?0+$/, '') + ' tỷ'
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + ' tr'
  return n.toLocaleString('vi-VN') + ' đ'
}

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
            <div className="text-center border-b-2 border-dashed border-gray-200 pb-5 mb-5 text-gray-800">
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
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-5 text-sm text-gray-800">
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
                <tbody className="divide-y divide-gray-100 text-gray-800">
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
              <div className="flex justify-between text-sm mb-1 text-gray-800">
                <span className="text-gray-500">Tạm tính</span>
                <span className="font-medium text-gray-700">{subtotal.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-sm mb-1 text-gray-800">
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
            <div className="border-t-2 border-dashed border-gray-200 pt-5 grid grid-cols-2 gap-6 text-center text-gray-800">
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
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">Đóng</button>
            <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#E8420A] hover:bg-[#C4350A] text-white rounded text-sm font-semibold cursor-pointer transition-colors border-none">
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

export default function ImportLogTab({ logsList }) {
  const [search, setSearch]       = useState('')
  const [supplier, setSupplier]   = useState('')
  const [status, setStatus]       = useState('')
  const [receipt, setReceipt]     = useState(null)

  const suppliers = [...new Set(logsList.map(l => l.supplier).filter(Boolean))]

  const filtered = logsList.filter(l => {
    const q = search.toLowerCase()
    return (
      (!q || l.id.toLowerCase().includes(q) || l.supplier?.toLowerCase().includes(q) || l.items.some(it => it.name.toLowerCase().includes(q))) &&
      (!supplier || l.supplier === supplier) &&
      (!status || l.status === status)
    )
  })

  const totalValue = filtered.reduce((s, l) => s + l.total, 0)

  const handleExportExcel = () => {
    const headers = ['Mã phiếu', 'Ngày nhập', 'Nhà cung cấp', 'Tổng số mặt hàng', 'Tổng tiền (đ)', 'Nhân viên', 'Trạng thái']
    const rows = filtered.map(log => [
      log.id,
      `${log.date} ${log.time}`,
      log.supplier || 'N/A',
      log.items.reduce((sum, item) => sum + item.qty, 0),
      log.total,
      log.staff,
      log.status === 'completed' ? 'Hoàn thành' : log.status === 'pending' ? 'Chờ duyệt' : 'Đã huỷ'
    ])
    downloadCSV(headers, rows, 'nhat_ky_nhap_kho.csv')
  }

  return (
    <>
      {/* Title */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nhật ký nhập hàng</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} phiếu · Tổng giá trị: <span className="font-semibold text-[#E8420A]">{fmt(totalValue)}</span></p>
        </div>
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2 px-4 rounded text-sm cursor-pointer transition-colors bg-white"
        >
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Mã phiếu, NCC, sản phẩm..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A] bg-white" />
        </div>
        <select value={supplier} onChange={e => setSupplier(e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer bg-white">
          <option value="">Tất cả NCC</option>
          {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer bg-white">
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
                    className="p-1.5 bg-gray-50 hover:bg-orange-50 text-gray-500 hover:text-[#E8420A] rounded transition-colors cursor-pointer border-none"
                    title="Xem chi tiết phiếu nhập"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
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
