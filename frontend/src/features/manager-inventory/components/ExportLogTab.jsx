import { useState } from 'react'
import { downloadCSV } from '../../../utils/exportHelper'

function fmt(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(3).replace(/\.?0+$/, '') + ' tỷ'
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + ' tr'
  return n.toLocaleString('vi-VN') + ' đ'
}

const EXPORT_TYPE = {
  sale:     { label: 'Bán hàng',      bg: 'bg-orange-50',   text: 'text-[#C4350A]'   },
  transfer: { label: 'Điều chuyển',   bg: 'bg-purple-100', text: 'text-purple-700' },
  damage:   { label: 'Hàng hỏng',     bg: 'bg-red-100',    text: 'text-red-600'    },
  return:   { label: 'Trả NCC',        bg: 'bg-amber-100',  text: 'text-amber-700'  },
}

function ExportReceiptModal({ log, onClose }) {
  const subtotal = log.items.reduce((s, it) => s + it.qty * it.unitPrice, 0)
  const typeInfo = EXPORT_TYPE[log.type] || { label: 'Khác', bg: 'bg-gray-100', text: 'text-gray-600' }

  return (
    <>
      <button type="button" aria-label="Đóng modal lịch sử xuất kho" onClick={onClose} className="fixed inset-0 bg-black/40 z-50 cursor-pointer border-none" />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded shadow-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            {/* Receipt header */}
            <div className="text-center border-b-2 border-dashed border-gray-200 pb-5 mb-5 text-gray-800">
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
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-5 text-sm text-gray-800">
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
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {log.items.map((it) => (
                    <tr key={it.id || it.sku || it.name}>
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
              <div className="flex justify-between text-sm mb-1 text-gray-400">
                <span className="text-gray-400">Tạm tính</span>
                <span className="text-gray-200">{subtotal.toLocaleString('vi-VN')} đ</span>
              </div>
              {log.type === 'sale' && (
                <div className="flex justify-between text-sm mb-1 text-gray-400">
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
            <div className="border-t-2 border-dashed border-gray-200 pt-5 grid grid-cols-2 gap-6 text-center text-gray-800">
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
            <button aria-label="Đóng biên lai xuất kho" type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">Đóng</button>
            <button aria-label="In biên lai xuất kho" type="button" onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded text-sm font-semibold cursor-pointer transition-colors border-none">
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

export default function ExportLogTab({ logsList }) {
  const [search, setSearch]   = useState('')
  const [typeFilter, setType] = useState('')
  const [status, setStatus]   = useState('')
  const [receipt, setReceipt] = useState(null)

  const filtered = logsList.filter(l => {
    const q = search.toLowerCase()
    return (
      (!q || l.id.toLowerCase().includes(q) || l.recipient?.toLowerCase().includes(q) || l.items.some(it => it.name.toLowerCase().includes(q))) &&
      (!typeFilter || l.type === typeFilter) &&
      (!status || l.status === status)
    )
  })

  const totalValue = filtered.reduce((s, l) => s + l.total, 0)

  const handleExportExcel = () => {
    const headers = ['Mã phiếu', 'Ngày xuất', 'Loại xuất', 'Người nhận / Đích', 'Tổng số mặt hàng', 'Tổng tiền (đ)', 'Nhân viên', 'Trạng thái']
    const rows = filtered.map(log => [
      log.id,
      `${log.date} ${log.time}`,
      log.type === 'sale' ? 'Bán hàng' : log.type === 'transfer' ? 'Điều chuyển' : log.type === 'damage' ? 'Hàng hỏng' : 'Trả NCC',
      log.recipient || 'N/A',
      log.items.reduce((sum, item) => sum + item.qty, 0),
      log.total,
      log.staff,
      log.status === 'completed' ? 'Hoàn thành' : 'Chờ duyệt'
    ])
    downloadCSV(headers, rows, 'nhat_ky_xuat_kho.csv')
  }

  return (
    <>
      {/* Title */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nhật ký xuất hàng</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} phiếu · Tổng giá trị: <span className="font-semibold text-gray-700">{fmt(totalValue)}</span></p>
        </div>
        <button aria-label="Xuất dữ liệu Excel" type="button"
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Mã phiếu, người nhận, sản phẩm..." aria-label="Tìm kiếm nhật ký xuất kho" className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A] bg-white" />
        </div>
        <select value={typeFilter} onChange={e => setType(e.target.value)} aria-label="Lọc theo loại xuất" className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer bg-white">
          <option value="">Tất cả loại xuất</option>
          <option value="sale">Bán hàng</option>
          <option value="transfer">Điều chuyển</option>
          <option value="damage">Hàng hỏng</option>
          <option value="return">Trả NCC</option>
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} aria-label="Lọc theo trạng thái" className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer bg-white">
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
              {['Mã phiếu','Ngày xuất','Loại','Người nhận / Đích','Mặt hàng','Tổng tiền','Nhân viên','Trạng thái','Biên lai'].map((h) => (
                <th key={h} className={`px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide ${['Tổng tiền', 'Nhân viên', 'Trạng thái', 'Biên lai'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-12 text-gray-400">Không tìm thấy phiếu xuất nào</td></tr>
            ) : filtered.map((log) => {
              const typeInfo = EXPORT_TYPE[log.type] || { label: 'Khác', bg: 'bg-gray-100', text: 'text-gray-600' }
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
                    {log.items.slice(0, 2).map((it) => (
                      <p key={it.id || it.sku || it.name} className="text-xs text-gray-500 truncate max-w-[160px]">· {it.name} <span className="text-gray-400">(×{it.qty})</span></p>
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
                    <button aria-label={`Xem chi tiết biên lai ${log.id}`} type="button"
                      onClick={() => setReceipt(log)}
                      className="p-1.5 bg-gray-50 hover:bg-orange-50 text-gray-500 hover:text-[#E8420A] rounded transition-colors cursor-pointer border-none"
                      title="Xem chi tiết biên lai xuất"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
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
