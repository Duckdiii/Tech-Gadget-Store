import { useAuth } from '../../../context/useAuth'
import { useStaffExport } from '../hooks/useStaffExport'
import ExportReceiptModal from '../components/ExportReceiptModal'
import { EXPORT_TYPES } from '../utils/inventoryHelpers'

export default function StaffExportPage() {
  const { user } = useAuth()
  const {
    productsList,
    flatVariants,
    exportType, setExportType,
    recipient, setRecipient,
    date, setDate,
    note, setNote,
    rows,
    errors,
    receipt, setReceipt,
    loading,
    submitting,
    addRow,
    removeRow,
    updateRow,
    stockAfter,
    handleSubmit,
    resetForm,
  } = useStaffExport(user)

  const inp = 'w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400'
  const currentType = EXPORT_TYPES.find(t => t.id === exportType)

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-8 py-3.5 flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Xuất kho</h1>
          <p className="text-xs text-gray-400 mt-0.5">Tạo phiếu xuất hàng và xuất biên lai tự động</p>
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
            {/* Export type selector */}
            <div className="bg-white rounded border border-gray-200 p-5">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Loại xuất kho</h2>
              <div className="grid grid-cols-4 gap-2">
                {EXPORT_TYPES.map(t => {
                  const colorMap = {
                    blue:   ['bg-[#E8420A]',   'border-[#E8420A]',   'text-[#E8420A]',   'bg-orange-50'  ],
                    purple: ['bg-purple-600', 'border-purple-600', 'text-purple-600', 'bg-purple-50'],
                    red:    ['bg-red-600',    'border-red-600',    'text-red-600',    'bg-red-50'   ],
                    amber:  ['bg-amber-500',  'border-amber-500',  'text-amber-600',  'bg-amber-50' ],
                  }[t.color]
                  const isActive = exportType === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => { setExportType(t.id); setRecipient('') }}
                      className={`py-3 px-4 rounded border-2 text-sm font-semibold transition-all cursor-pointer ${isActive ? `${colorMap[1]} ${colorMap[3]} ${colorMap[2]}` : 'border-gray-100 text-gray-500 hover:border-gray-200 bg-gray-50'}`}
                    >
                      {t.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Info */}
            <div className="bg-white rounded border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Thông tin phiếu xuất</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">{currentType?.recipientLabel} *</label>
                  <input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder={`Nhập ${currentType?.recipientLabel?.toLowerCase()}...`} className={inp} />
                  {errors.recipient && <p className="text-xs text-red-500 mt-1">{errors.recipient}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Ngày xuất</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Ghi chú</label>
                  <input value={note} onChange={e => setNote(e.target.value)} placeholder="Ghi chú..." className={inp} />
                </div>
              </div>
            </div>

            {/* Product rows */}
            <div className="bg-white rounded border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Danh sách hàng xuất</h2>
                <button onClick={addRow} className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-semibold cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  Thêm sản phẩm
                </button>
              </div>

              {errors.rows && <p className="text-xs text-red-500 px-6 pt-3">{errors.rows}</p>}
              {errors.submit && <p className="text-xs text-red-600 font-semibold px-6 pt-3">{errors.submit}</p>}

              {/* Column headers */}
              <div className="px-6 pt-3 pb-1 grid text-[11px] font-bold text-gray-400 uppercase" style={{gridTemplateColumns:'24px 1.5fr 1fr 100px 100px 40px', gap:'12px'}}>
                <span></span><span>Sản phẩm</span><span>Phiên bản</span><span className="text-center">SL xuất</span><span className="text-center">Còn lại/Tồn</span><span></span>
              </div>

              <div className="divide-y divide-gray-50">
                {rows.map((row, i) => {
                  const after = stockAfter(row)
                  const overstock = after !== null && after < 0

                  const selectedProduct = productsList.find(p => p.id === row.productId)
                  const variantOptions = []
                  if (selectedProduct) {
                    flatVariants.filter(v => v.productId === row.productId).forEach(v => {
                      variantOptions.push({
                        id: v.id,
                        label: `${v.ramGb ? v.ramGb + 'GB RAM / ' : ''}${v.storageGb ? v.storageGb + 'GB Storage / ' : ''}${v.color || ''} (Còn: ${v.stock})`,
                        stock: v.stock
                      })
                    })
                  }

                  const selectedVariant = flatVariants.find(v => v.id === row.productVariantId)

                  return (
                    <div key={i} className={`px-6 py-4 grid items-center gap-3 ${overstock ? 'bg-red-50/50' : ''}`} style={{gridTemplateColumns:'24px 1.5fr 1fr 100px 100px 40px', gap:'12px'}}>
                      <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">{i+1}</span>

                      <select value={row.productId} onChange={e => { updateRow(i, 'productId', e.target.value); updateRow(i, 'productVariantId', '') }} className="w-full border border-gray-200 rounded px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer">
                        <option value="">-- Chọn sản phẩm --</option>
                        {productsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>

                      <select value={row.productVariantId} onChange={e => updateRow(i, 'productVariantId', e.target.value)} disabled={!row.productId} className="w-full border border-gray-200 rounded px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer disabled:opacity-55">
                        <option value="">-- Chọn phiên bản --</option>
                        {variantOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                      </select>

                      <input type="number" min={1} value={row.qty} onChange={e => updateRow(i, 'qty', e.target.value)}
                        className={`w-full border rounded px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 ${overstock ? 'border-red-400 focus:ring-red-300 bg-red-50' : 'border-gray-200 focus:ring-teal-400'}`}
                      />

                      <div className="text-center">
                        {selectedVariant ? (
                          <div>
                            <p className={`text-sm font-bold ${overstock ? 'text-red-600' : 'text-gray-700'}`}>{after ?? selectedVariant.stock}</p>
                            <p className="text-[10px] text-gray-400">/ {selectedVariant.stock} tồn</p>
                          </div>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </div>

                      <button
                        onClick={() => removeRow(i)} disabled={rows.length === 1}
                        className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 disabled:opacity-30 cursor-pointer shrink-0 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>

                      {errors[`row_${i}`] && <p className="col-span-6 text-xs text-red-500 ml-9">{errors[`row_${i}`]}</p>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button onClick={resetForm} className="px-5 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Làm mới</button>
              <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 bg-slate-700 hover:bg-slate-800 disabled:opacity-55 text-white rounded text-sm font-bold cursor-pointer transition-colors flex items-center gap-2">
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
                    Tạo phiếu xuất
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {receipt && <ExportReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />}
    </div>
  )
}
