import { useAuth } from '../../../context/AuthContext'
import { useStaffImport } from '../hooks/useStaffImport'
import ImportReceiptModal from '../components/ImportReceiptModal'
import { WAREHOUSES, fmt } from '../utils/inventoryHelpers'

const SUPPLIERS  = ['Apple VN', 'Samsung Electronics VN', 'Sony VN', 'LG Electronics VN', 'Xiaomi VN', 'ASUS VN', 'Dell Technologies VN']

const BRANDS = [
  { id: 'brand-apple', name: 'Apple' },
  { id: 'brand-samsung', name: 'Samsung' },
  { id: 'brand-xiaomi', name: 'Xiaomi' },
  { id: 'brand-oppo', name: 'OPPO' },
  { id: 'brand-vivo', name: 'Vivo' },
  { id: 'brand-realme', name: 'Realme' },
  { id: 'brand-google', name: 'Google' },
]

const CATEGORIES = [
  { id: 'cat-phone', name: 'Điện thoại' },
  { id: 'cat-tablet', name: 'Máy tính bảng' },
  { id: 'cat-accessory', name: 'Phụ kiện' },
]

/* ── Main Page ── */
export default function StaffImportPage() {
  const { user } = useAuth()
  const {
    productsList,
    supplier,
    setSupplier,
    warehouse,
    setWarehouse,
    date,
    setDate,
    note,
    setNote,
    rows,
    errors,
    receipt,
    setReceipt,
    loading,
    submitting,
    addRow,
    removeRow,
    updateRow,
    handleSubmit,
    resetForm,
  } = useStaffImport(user)

  const inp = 'w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400'
  const sel = inp + ' cursor-pointer'

  const subtotal = rows.reduce((s, r) => s + (Number(r.qty) || 0) * (Number(r.unitPrice) || 0), 0)
  const vat      = Math.round(subtotal * 0.1)
  const total    = subtotal + vat

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-8 py-3.5 flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Nhập kho</h1>
          <p className="text-xs text-gray-400 mt-0.5">Tạo phiếu nhập hàng và xuất biên lai tự động</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.slice(0, 2).toUpperCase() || 'NV'}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <svg className="w-8 h-8 text-teal-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <div className="flex-1 px-8 py-6">
          <div className="max-w-4xl mx-auto space-y-5">
            {/* Info section */}
            <div className="bg-white rounded border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Thông tin phiếu nhập</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nhà cung cấp *</label>
                  <select value={supplier} onChange={e => setSupplier(e.target.value)} className={sel}>
                    <option value="">-- Chọn NCC --</option>
                    {SUPPLIERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.supplier && <p className="text-xs text-red-500 mt-1">{errors.supplier}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Kho nhận</label>
                  <select value={warehouse} onChange={e => setWarehouse(e.target.value)} className={sel}>
                    {WAREHOUSES.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Ngày nhập</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inp} />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Ghi chú</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Ghi chú thêm về lô hàng..." className={inp + ' resize-none'} />
              </div>
            </div>

            {/* Product rows */}
            <div className="bg-white rounded border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Danh sách hàng nhập</h2>
                <button onClick={addRow} className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-semibold cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  Thêm dòng
                </button>
              </div>

              {errors.rows && <p className="text-xs text-red-500 px-6 pt-3">{errors.rows}</p>}
              {errors.submit && <p className="text-xs text-red-600 font-semibold px-6 pt-3">{errors.submit}</p>}

              <div className="divide-y divide-gray-50">
                {rows.map((row, i) => {
                  const selectedProduct = productsList.find(p => p.id === row.productId)
                  const variantOptions = []
                  const seenConfigs = new Set()
                  if (selectedProduct) {
                    selectedProduct.variants?.forEach(v => {
                      const label = `${v.ramGb ? v.ramGb + 'GB RAM / ' : ''}${v.storageGb ? v.storageGb + 'GB Storage / ' : ''}${v.color || ''}`
                      const key = `${v.ramGb}-${v.storageGb}-${v.color}`.toLowerCase()
                      if (!seenConfigs.has(key)) {
                        seenConfigs.add(key)
                        variantOptions.push({ id: v.id, label })
                      }
                    })
                  }

                  return (
                    <div key={i} className="px-6 py-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">{i+1}</span>
                        <label className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={row.isNewProduct}
                            onChange={e => updateRow(i, 'isNewProduct', e.target.checked)}
                            className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                          />
                          Sản phẩm mới hoàn toàn
                        </label>
                        <button
                          onClick={() => removeRow(i)} disabled={rows.length === 1}
                          className="ml-auto w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 disabled:opacity-30 cursor-pointer shrink-0 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>

                      {row.isNewProduct ? (
                        <div className="grid grid-cols-4 gap-3 ml-9">
                          <div className="col-span-2">
                            <input
                              type="text" placeholder="Tên sản phẩm *" value={row.newName}
                              onChange={e => updateRow(i, 'newName', e.target.value)}
                              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                          </div>
                          <div>
                            <select value={row.newBrandId} onChange={e => updateRow(i, 'newBrandId', e.target.value)} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer">
                              {BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <select value={row.newCategoryId} onChange={e => updateRow(i, 'newCategoryId', e.target.value)} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer">
                              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <input
                              type="number" placeholder="RAM (GB)" value={row.newRamGb || ''}
                              onChange={e => updateRow(i, 'newRamGb', e.target.value)}
                              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                          </div>
                          <div>
                            <input
                              type="number" placeholder="Bộ nhớ (GB)" value={row.newStorageGb || ''}
                              onChange={e => updateRow(i, 'newStorageGb', e.target.value)}
                              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                          </div>
                          <div>
                            <input
                              type="text" placeholder="Màu sắc" value={row.newColor}
                              onChange={e => updateRow(i, 'newColor', e.target.value)}
                              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                          </div>
                          <div>
                            <input
                              type="number" placeholder="Giá bán lẻ đề xuất" value={row.newPrice || ''}
                              onChange={e => updateRow(i, 'newPrice', e.target.value)}
                              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                          </div>
                          <div className="col-span-4">
                            <input
                              type="text" placeholder="Mô tả sản phẩm" value={row.newDescription}
                              onChange={e => updateRow(i, 'newDescription', e.target.value)}
                              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-3 ml-9">
                          <div className="col-span-2">
                            <select value={row.productId} onChange={e => updateRow(i, 'productId', e.target.value)} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer">
                              <option value="">-- Chọn sản phẩm --</option>
                              {productsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          </div>
                          <div className="col-span-2">
                            <select value={row.productVariantId} onChange={e => updateRow(i, 'productVariantId', e.target.value)} disabled={!row.productId} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer disabled:opacity-55">
                              <option value="">-- Chọn phiên bản --</option>
                              {variantOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Common Quantity & Import Price fields */}
                      <div className="grid grid-cols-4 gap-3 ml-9 pt-1">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">SỐ LƯỢNG NHẬP</label>
                          <input
                            type="number" min={1} value={row.qty}
                            onChange={e => updateRow(i, 'qty', e.target.value)}
                            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">ĐƠN GIÁ NHẬP (VNĐ)</label>
                          <input
                            type="number" min={0} value={row.unitPrice}
                            onChange={e => updateRow(i, 'unitPrice', e.target.value)}
                            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                          />
                        </div>
                        <div className="col-span-2 flex items-end justify-end text-right pb-2">
                          <div>
                            <span className="text-xs text-gray-400 block mb-0.5">Thành tiền nhập</span>
                            <span className="text-base font-bold text-gray-800">{fmt((Number(row.qty)||0) * (Number(row.unitPrice)||0))} đ</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
                <div className="flex justify-end">
                  <div className="space-y-1.5 text-sm min-w-[240px]">
                    <div className="flex justify-between text-gray-500"><span>Cộng tiền hàng</span><span className="font-medium">{fmt(subtotal)}đ</span></div>
                    <div className="flex justify-between text-gray-500"><span>VAT (10%)</span><span className="font-medium">{fmt(vat)}đ</span></div>
                    <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-800 text-base"><span>Tổng cộng</span><span className="text-teal-700">{fmt(total)}đ</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button onClick={resetForm} className="px-5 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">
                Làm mới
              </button>
              <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-55 text-white rounded text-sm font-bold cursor-pointer transition-colors flex items-center gap-2">
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Tạo phiếu nhập
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {receipt && <ImportReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />}
    </div>
  )
}
