import { fmt, EXPORT_TYPES, EXPORT_TYPE_BADGE, resolveExportType } from '../utils/inventoryHelpers'

export default function ExportReceiptModal({ receipt, onClose }) {
  const exportType = receipt.exportType || resolveExportType(receipt.note)

  const type = EXPORT_TYPES.find(t => t.id === exportType)
  const isSale = exportType === 'sale'
  const rows = receipt.rows || receipt.items || []
  const sub = rows.reduce((s, r) => s + (Number(r.qty || r.quantity) || 0) * (r.unitPrice || r.price || 0), 0)
  const vat = isSale ? Math.round(sub * 0.1) : 0
  const total = sub + vat

  return (
    <>
      <button type="button" aria-label="Đóng modal phiễu xuất kho" onClick={onClose} className="fixed inset-0 bg-black/50 z-50 cursor-pointer border-none" />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 text-gray-800 text-left">
        <div className="bg-white rounded shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gray-900 px-6 py-5 text-white">
            <p className="text-xs font-semibold opacity-70 uppercase tracking-widest">TechStore · Kho vận</p>
            <h2 className="text-2xl font-black mt-1">PHIẾU XUẤT KHO</h2>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm opacity-80">Số phiếu: <span className="font-bold">{receipt.id}</span></span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${EXPORT_TYPE_BADGE[exportType] || 'bg-gray-100 text-gray-700'}`}>{type?.label}</span>
            </div>
            {receipt.receiptId && (
              <p className="text-xs text-gray-400 mt-1">Mã hóa đơn/Biên lai: <span className="font-bold">{receipt.receiptId}</span></p>
            )}
            <p className="text-sm opacity-80 mt-1">Ngày: <span className="font-bold">{receipt.date}</span></p>
          </div>

          <div className="px-6 py-4 space-y-4">
            {/* Meta */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded p-3">
                <p className="text-xs text-gray-400 font-medium mb-0.5">Loại xuất</p>
                <p className="font-semibold text-gray-800">{type?.label}</p>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-xs text-gray-400 font-medium mb-0.5">{type?.recipientLabel || 'Người nhận'}</p>
                <p className="font-semibold text-gray-800">{receipt.recipient || '—'}</p>
              </div>
            </div>

            {/* Items */}
            <div className="border border-gray-200 rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-400 uppercase">#</th>
                    <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-400 uppercase">Sản phẩm</th>
                    <th className="px-3 py-2.5 text-center text-xs font-bold text-gray-400 uppercase">SL xuất</th>
                    <th className="px-3 py-2.5 text-right text-xs font-bold text-gray-400 uppercase">Đơn giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rows.map((r, i) => {
                    const name = r.displayName || r.name || 'Sản phẩm hiện có'
                    const specs = r.specs || r.sku || ''
                    const qty = r.qty || r.quantity || 0
                    const unitPrice = r.unitPrice || r.price || 0
                    return (
                      <tr key={r.id || r.productId || r.sku || name}>
                        <td className="px-3 py-2.5 text-gray-400 text-xs">{i+1}</td>
                        <td className="px-3 py-2.5">
                          <p className="text-xs font-semibold text-gray-800">{name}</p>
                          <p className="text-[11px] text-gray-400">{specs}</p>
                        </td>
                        <td className="px-3 py-2.5 text-center text-sm font-bold text-red-600">{qty}</td>
                        <td className="px-3 py-2.5 text-right text-xs text-gray-600">{fmt(unitPrice)}đ</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {(isSale || exportType === 'return') && (
              <div className="bg-slate-50 rounded p-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500"><span>Tổng giá trị xuất</span><span className="font-semibold">{fmt(sub)}đ</span></div>
                {isSale && <div className="flex justify-between text-gray-500"><span>VAT (10%)</span><span className="font-semibold">{fmt(vat)}đ</span></div>}
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-700 text-base"><span>TỔNG CỘNG</span><span>{fmt(total)}đ</span></div>
              </div>
            )}

            {receipt.note && <p className="text-xs text-gray-500 italic">Ghi chú: {receipt.note}</p>}

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              {['Nhân viên xuất kho', type?.recipientLabel === 'Khách hàng' ? 'Người nhận hàng' : 'Người xác nhận'].map((label, i) => (
                <div key={label} className="text-center">
                  <p className="text-xs font-semibold text-gray-600">{label}</p>
                  <p className="text-[11px] text-gray-400 mb-8">(Ký, ghi rõ họ tên)</p>
                  {i === 0 && <p className="text-xs font-semibold text-gray-700 border-t border-dashed border-gray-300 pt-1">{receipt.staffName || receipt.staff || 'Thủ kho'}</p>}
                  {i !== 0 && <p className="text-xs text-gray-400 border-t border-dashed border-gray-300 pt-1">...</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 px-6 pb-6">
            <button aria-label="Đóng phiếu xuất kho" type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">Đóng</button>
            <button aria-label="In phiếu xuất kho" type="button" onClick={() => window.print()} className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded text-sm font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2 border-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              In phiếu
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
