import { fmt, resolveExportType } from '../utils/inventoryHelpers'

const EXPORT_TYPE_CFG = {
  sale:     { label: 'Xuất bán',        bg: 'bg-orange-50',   text: 'text-[#E8420A]'   },
  transfer: { label: 'Chuyển kho',      bg: 'bg-purple-100', text: 'text-purple-600' },
  damage:   { label: 'Hỏng / Thanh lý', bg: 'bg-red-100',    text: 'text-red-600'    },
  return:   { label: 'Trả NCC',         bg: 'bg-amber-100',  text: 'text-amber-700'  },
}

export default function ViewExportModal({ log, onClose }) {
  const typeKey = resolveExportType(log.note)
  const tc = EXPORT_TYPE_CFG[typeKey]
  const sub = log.items.reduce((s, r) => s + r.qty * r.unitPrice, 0)
  const isSale = typeKey === 'sale'
  const vat = isSale ? Math.round(sub * 0.1) : 0
  const total = sub + vat

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="bg-gray-900  px-6 py-5 text-white">
            <p className="text-xs font-semibold opacity-70 uppercase tracking-widest">TechStore · Kho vận</p>
            <h2 className="text-2xl font-black mt-1">PHIẾU XUẤT KHO</h2>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm opacity-90">Số phiếu: <strong>{log.id}</strong></span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tc?.bg || 'bg-gray-100'} ${tc?.text || 'text-gray-700'}`}>{tc?.label || 'Xuất kho'}</span>
            </div>
            <p className="text-sm opacity-80 mt-1">{log.date} · {log.time}</p>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded p-3"><p className="text-xs text-gray-400">Loại xuất</p><p className="font-semibold text-sm text-gray-800 mt-0.5">{tc?.label || 'Mặc định'}</p></div>
              <div className="bg-gray-50 rounded p-3"><p className="text-xs text-gray-400">Người nhận / Lý do</p><p className="font-semibold text-sm text-gray-800 mt-0.5">{log.recipient}</p></div>
            </div>
            <div className="border border-gray-200 rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-400">Sản phẩm</th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-gray-400">SL xuất</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-400">Đơn giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {log.items.map((r,i) => (
                    <tr key={i}>
                      <td className="px-3 py-2.5"><p className="text-xs font-semibold text-gray-800">{r.name}</p><p className="text-[11px] text-gray-400">{r.sku}</p></td>
                      <td className="px-3 py-2.5 text-center font-bold text-red-600">{r.qty}</td>
                      <td className="px-3 py-2.5 text-right text-xs text-gray-600">{fmt(r.unitPrice)}đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(isSale || typeKey === 'return') && (
              <div className="bg-slate-50 rounded p-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-500"><span>Tổng giá trị xuất</span><span className="font-semibold">{fmt(sub)}đ</span></div>
                {isSale && <div className="flex justify-between text-gray-500"><span>VAT (10%)</span><span className="font-semibold">{fmt(vat)}đ</span></div>}
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-700 text-base"><span>TỔNG CỘNG</span><span>{fmt(total)}đ</span></div>
              </div>
            )}
            {log.note && <p className="text-xs text-gray-400 italic">Ghi chú: {log.note}</p>}
          </div>
          <div className="flex gap-3 px-6 pb-6">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Đóng</button>
          </div>
        </div>
      </div>
    </>
  )
}
