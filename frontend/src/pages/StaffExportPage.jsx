import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../services/api'

const EXPORT_TYPES = [
  { id: 'sale',     label: 'Xuất bán',           recipientLabel: 'Khách hàng',     color: 'blue'   },
  { id: 'transfer', label: 'Xuất chuyển kho',    recipientLabel: 'Kho nhận',       color: 'purple' },
  { id: 'damage',   label: 'Xuất hỏng / thanh lý', recipientLabel: 'Lý do',       color: 'red'    },
  { id: 'return',   label: 'Xuất trả NCC',        recipientLabel: 'Nhà cung cấp',  color: 'amber'  },
]

const TYPE_BADGE = {
  sale:     'bg-orange-50 text-[#C4350A]',
  transfer: 'bg-purple-100 text-purple-700',
  damage:   'bg-red-100 text-red-600',
  return:   'bg-amber-100 text-amber-700',
}

const USER_EMAIL_TO_ID = {
  'nguyenducduy@gmail.com': 'user-mgr-01',
  'bich.tran@techstore.vn': 'user-stf-01',
  'cuong.le@techstore.vn': 'user-stf-02',
}

const fmt = n => n.toLocaleString('vi-VN')

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function parseDetails(detailsStr) {
  if (!detailsStr) return { ram: '', storage: '', color: '' }
  const parts = detailsStr.split('/').map(s => s.trim())
  let ram = ''
  let storage = ''
  let color = ''
  parts.forEach(p => {
    if (p.toLowerCase().includes('ram')) {
      ram = p.replace(/gb\s*ram/i, '').trim()
    } else if (p.toLowerCase().includes('storage')) {
      storage = p.replace(/gb\s*storage/i, '').trim()
    } else {
      color = p
    }
  })
  return { ram, storage, color }
}

const BLANK_ROW = () => ({ productId: '', productVariantId: '', qty: 1 })

/* ── Export Receipt Modal ── */
function ExportReceiptModal({ receipt, onClose }) {
  const type = EXPORT_TYPES.find(t => t.id === receipt.exportType)
  const isSale = receipt.exportType === 'sale'
  const rows = receipt.rows
  const sub = rows.reduce((s, r) => s + (Number(r.qty) || 0) * (r.unitPrice || 0), 0)
  const vat = isSale ? Math.round(sub * 0.1) : 0
  const total = sub + vat

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gray-900 px-6 py-5 text-white">
            <p className="text-xs font-semibold opacity-70 uppercase tracking-widest">TechStore · Kho vận</p>
            <h2 className="text-2xl font-black mt-1">PHIẾU XUẤT KHO</h2>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm opacity-80">Số phiếu: <span className="font-bold">{receipt.id}</span></span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TYPE_BADGE[receipt.exportType]}`}>{type?.label}</span>
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
                <p className="text-xs text-gray-400 font-medium mb-0.5">{type?.recipientLabel}</p>
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
                  {rows.map((r, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2.5 text-gray-400 text-xs">{i+1}</td>
                      <td className="px-3 py-2.5">
                        <p className="text-xs font-semibold text-gray-800">{r.displayName}</p>
                        <p className="text-[11px] text-gray-400">{r.specs}</p>
                      </td>
                      <td className="px-3 py-2.5 text-center text-sm font-bold text-red-600">{r.qty}</td>
                      <td className="px-3 py-2.5 text-right text-xs text-gray-600">{fmt(r.unitPrice)}đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(isSale || receipt.exportType === 'return') && (
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
                <div key={i} className="text-center">
                  <p className="text-xs font-semibold text-gray-600">{label}</p>
                  <p className="text-[11px] text-gray-400 mb-8">(Ký, ghi rõ họ tên)</p>
                  {i === 0 && <p className="text-xs font-semibold text-gray-700 border-t border-dashed border-gray-300 pt-1">{receipt.staffName}</p>}
                  {i !== 0 && <p className="text-xs text-gray-400 border-t border-dashed border-gray-300 pt-1">...</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 px-6 pb-6">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Đóng</button>
            <button onClick={() => window.print()} className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded text-sm font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              In phiếu
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Main Page ── */
export default function StaffExportPage() {
  const { user } = useAuth()
  const [productsList, setProductsList] = useState([])
  const [flatVariants, setFlatVariants] = useState([])
  const [exportType, setExportType] = useState('sale')
  const [recipient,  setRecipient]  = useState('')
  const [date,       setDate]       = useState(today())
  const [note,       setNote]       = useState('')
  const [rows,       setRows]       = useState([BLANK_ROW()])
  const [errors,     setErrors]     = useState({})
  const [receipt,    setReceipt]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const userPerfId = USER_EMAIL_TO_ID[user?.email] || 'user-stf-01'

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const rawProducts = await apiFetch('/api/products')
        const detailed = await Promise.all(
          rawProducts.map(async (p) => {
            try {
              return await apiFetch(`/api/products/${p.id}`)
            } catch {
              return { ...p, variants: [] }
            }
          })
        )

        let logs = []
        try {
          logs = await apiFetch('/api/manager/warehouse-logs')
        } catch (e) {
          console.warn("Failed to load warehouse logs", e)
        }

        // Count exports
        const exportedCounts = {}
        logs.filter(l => l.type === 'EXPORT').forEach(log => {
          const { ram, storage, color } = parseDetails(log.productDetails)
          const key = `${log.productName}-${ram}-${storage}-${color}`.toLowerCase()
          exportedCounts[key] = (exportedCounts[key] || 0) + log.quantity
        })

        // Build flat variants list with correct stock levels
        const list = []
        detailed.forEach(p => {
          const configMap = {}
          p.variants.forEach(v => {
            const configKey = `${v.ramGb || ''}-${v.storageGb || ''}-${v.color || ''}`.toLowerCase()
            if (!configMap[configKey]) {
              configMap[configKey] = {
                id: v.id,
                productId: p.id,
                productName: p.name,
                ramGb: v.ramGb,
                storageGb: v.storageGb,
                color: v.color,
                price: v.price || 0,
                totalUnits: 0,
              }
            }
            configMap[configKey].totalUnits += 1
          })

          Object.values(configMap).forEach(cfg => {
            const matchKey = `${p.name}-${cfg.ramGb || ''}-${cfg.storageGb || ''}-${cfg.color || ''}`.toLowerCase()
            const exported = exportedCounts[matchKey] || 0
            const stock = Math.max(0, cfg.totalUnits - exported)

            list.push({
              ...cfg,
              stock,
            })
          })
        })

        setProductsList(detailed)
        setFlatVariants(list)
      } catch (err) {
        console.error("Failed to load export data", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const inp = 'w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400'
  const sel = inp + ' cursor-pointer'
  const currentType = EXPORT_TYPES.find(t => t.id === exportType)

  function addRow() { setRows(r => [...r, BLANK_ROW()]) }
  function removeRow(i) { setRows(r => r.filter((_,idx) => idx !== i)) }
  function updateRow(i, field, val) { setRows(r => r.map((row, idx) => idx === i ? { ...row, [field]: val } : row)) }

  function getVariantDetails(row) {
    return flatVariants.find(v => v.id === row.productVariantId)
  }

  function stockAfter(row) {
    const v = getVariantDetails(row)
    if (!v) return null
    return v.stock - (Number(row.qty) || 0)
  }

  async function handleSubmit() {
    const e = {}
    if (!recipient.trim()) e.recipient = `Vui lòng nhập ${currentType?.recipientLabel}`
    
    const validRows = rows.filter(r => r.productVariantId && Number(r.qty) > 0)
    if (validRows.length === 0) e.rows = 'Cần ít nhất 1 sản phẩm'
    
    validRows.forEach((r, i) => {
      const after = stockAfter(r)
      if (after !== null && after < 0) {
        e[`row_${i}`] = 'Xuất quá số lượng tồn kho khả dụng'
      }
    })

    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setSubmitting(true)

    try {
      const payload = {
        performedById: userPerfId,
        reason: `${recipient}; ${note}`,
        items: validRows.map(r => ({
          productVariantId: r.productVariantId,
          quantity: Number(r.qty) || 1,
        }))
      }

      const res = await apiFetch('/api/export-logs', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      setReceipt({
        id: res.id,
        date: new Date(res.exportedAt || res.createdAt).toLocaleDateString('vi-VN'),
        exportType,
        recipient,
        note,
        receiptId: res.receiptId,
        staffName: user?.name || 'Lê Hoàng Dũng',
        rows: validRows.map(r => {
          const v = getVariantDetails(r)
          return {
            ...r,
            displayName: v?.productName,
            specs: `${v?.ramGb ? v.ramGb + 'GB RAM / ' : ''}${v?.storageGb ? v.storageGb + 'GB Storage / ' : ''}${v?.color || ''}`,
            unitPrice: v?.price || 0,
          }
        })
      })
    } catch (err) {
      console.error(err)
      setErrors({ submit: err.message || 'Lỗi hệ thống khi xuất kho' })
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setExportType('sale'); setRecipient(''); setDate(today())
    setNote(''); setRows([BLANK_ROW()]); setErrors({}); setReceipt(null)
  }

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
