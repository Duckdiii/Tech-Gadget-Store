import React from 'react'
import { fmt } from '../utils/inventoryHelpers'

export default function ImportReceiptModal({ receipt, onClose }) {
  const rows = receipt.rows || receipt.items || []
  const sub = rows.reduce((s, r) => s + (r.qty || r.quantity || 0) * (r.unitPrice || r.price || 0), 0)
  const vat  = Math.round(sub * 0.1)
  const total = sub + vat

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 text-gray-800 text-left">
        <div className="bg-white rounded shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Blue header */}
          <div className="px-6 py-5 text-white bg-teal-700">
            <p className="text-xs font-semibold opacity-70 uppercase tracking-widest">TechStore · Kho vận</p>
            <h2 className="text-2xl font-black mt-1">PHIẾU NHẬP KHO</h2>
            <div className="flex items-center justify-between mt-3 text-sm">
              <span className="opacity-80">Số phiếu: <span className="font-bold">{receipt.id}</span></span>
              <span className="opacity-80">Ngày: <span className="font-bold">{receipt.date}</span></span>
            </div>
          </div>

          <div className="px-6 py-4 space-y-4">
            {/* Meta */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded p-3">
                <p className="text-xs text-gray-400 font-medium mb-0.5">Nhà cung cấp</p>
                <p className="font-semibold text-gray-800">{receipt.supplier}</p>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-xs text-gray-400 font-medium mb-0.5">Kho nhận / Người nhập</p>
                <p className="font-semibold text-gray-800">{receipt.warehouse || receipt.staff || '—'}</p>
              </div>
            </div>

            {/* Items table */}
            <div className="border border-gray-200 rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-400 uppercase">#</th>
                    <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-400 uppercase">Sản phẩm</th>
                    <th className="px-3 py-2.5 text-center text-xs font-bold text-gray-400 uppercase">SL</th>
                    <th className="px-3 py-2.5 text-right text-xs font-bold text-gray-400 uppercase">Đơn giá</th>
                    <th className="px-3 py-2.5 text-right text-xs font-bold text-gray-400 uppercase">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rows.map((r, i) => {
                    const name = r.isNewProduct
                      ? `${r.newName} ${r.newRamGb ? r.newRamGb + 'GB' : ''} ${r.newStorageGb ? r.newStorageGb + 'GB' : ''} ${r.newColor || ''}`.trim()
                      : r.displayName || r.name || 'Sản phẩm hiện có'
                    const specs = r.isNewProduct
                      ? `Mới · ${r.newColor || 'No Color'}`
                      : r.specs || r.sku || ''
                    const qty = r.qty || r.quantity || 0
                    const unitPrice = r.unitPrice || r.price || 0
                    return (
                      <tr key={i}>
                        <td className="px-3 py-2.5 text-gray-400 text-xs">{i+1}</td>
                        <td className="px-3 py-2.5">
                          <p className="text-xs font-semibold text-gray-800">{name}</p>
                          <p className="text-[11px] text-gray-400">{specs}</p>
                        </td>
                        <td className="px-3 py-2.5 text-center text-sm font-bold text-teal-700">{qty}</td>
                        <td className="px-3 py-2.5 text-right text-xs text-gray-600">{fmt(unitPrice)}đ</td>
                        <td className="px-3 py-2.5 text-right text-sm font-bold text-gray-800">{fmt(qty * unitPrice)}đ</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="bg-teal-50 rounded p-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Cộng tiền hàng</span><span className="font-semibold">{fmt(sub)}đ</span></div>
              <div className="flex justify-between text-gray-600"><span>VAT (10%)</span><span className="font-semibold">{fmt(vat)}đ</span></div>
              <div className="flex justify-between border-t border-teal-200 pt-2 text-base font-bold text-teal-700"><span>TỔNG CỘNG</span><span>{fmt(total)}đ</span></div>
            </div>

            {/* Signatures */}
            {receipt.note && <p className="text-xs text-gray-500 italic">Ghi chú: {receipt.note}</p>}
            <div className="grid grid-cols-2 gap-4 pt-2">
              {['Người nhập kho', 'Người giao hàng'].map((label, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs font-semibold text-gray-600">{label}</p>
                  <p className="text-[11px] text-gray-400 mb-8">(Ký, ghi rõ họ tên)</p>
                  {i === 0 && <p className="text-xs font-semibold text-gray-700 border-t border-dashed border-gray-300 pt-1">{receipt.staffName || receipt.staff || 'Thủ kho'}</p>}
                  {i !== 0 && <p className="text-xs text-gray-400 border-t border-dashed border-gray-300 pt-1">...</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 px-6 pb-6">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">
              Đóng
            </button>
            <button onClick={() => window.print()} className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-sm font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2 border-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              In phiếu
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
