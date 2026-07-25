import { fmt } from '../utils/inventoryHelpers'

export default function ViewImportModal({ log, onClose }) {
  const sub   = log.items.reduce((s, r) => s + r.qty * r.unitPrice, 0)
  const vat   = Math.round(sub * 0.1)
  const total = sub + vat
  return (
    <>
      <button type="button" aria-label="Đóng xem phiếu nhập kho" onClick={onClose} className="fixed inset-0 bg-black/50 z-50 cursor-pointer border-none" />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="bg-teal-700  px-6 py-5 text-white">
            <p className="text-xs font-semibold opacity-70 uppercase tracking-widest">TechStore · Kho vận</p>
            <h2 className="text-2xl font-black mt-1">PHIẾU NHẬP KHO</h2>
            <div className="flex justify-between mt-2 text-sm opacity-90">
              <span>Số phiếu: <strong>{log.id}</strong></span>
              <span>{log.date} · {log.time}</span>
            </div>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded p-3"><p className="text-xs text-gray-400">Nhà cung cấp</p><p className="font-semibold text-sm text-gray-800 mt-0.5">{log.supplier}</p></div>
              <div className="bg-gray-50 rounded p-3"><p className="text-xs text-gray-400">Thủ kho thực hiện</p><p className="font-semibold text-sm text-gray-800 mt-0.5">{log.staff}</p></div>
            </div>
            <div className="border border-gray-200 rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-400">Sản phẩm</th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-gray-400">SL</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-400">Đơn giá</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-400">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {log.items.map((r) => (
                    <tr key={r.id || r.sku || r.name}>
                      <td className="px-3 py-2.5"><p className="text-xs font-semibold text-gray-800">{r.name}</p><p className="text-[11px] text-gray-400">{r.sku}</p></td>
                      <td className="px-3 py-2.5 text-center font-bold text-teal-700">{r.qty}</td>
                      <td className="px-3 py-2.5 text-right text-xs text-gray-600">{fmt(r.unitPrice)}đ</td>
                      <td className="px-3 py-2.5 text-right font-bold text-gray-800 text-xs">{fmt(r.qty*r.unitPrice)}đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-teal-50 rounded p-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>Cộng tiền hàng</span><span>{fmt(sub)}đ</span></div>
              <div className="flex justify-between text-gray-600"><span>VAT (10%)</span><span>{fmt(vat)}đ</span></div>
              <div className="flex justify-between border-t border-teal-200 pt-2 font-bold text-teal-700 text-base"><span>TỔNG CỘNG</span><span>{fmt(total)}đ</span></div>
            </div>
            {log.note && <p className="text-xs text-gray-400 italic">Ghi chú: {log.note}</p>}
          </div>
          <div className="flex gap-3 px-6 pb-6">
            <button aria-label="Đóng chi tiết phiếu nhập" type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">Đóng</button>
          </div>
        </div>
      </div>
    </>
  )
}
