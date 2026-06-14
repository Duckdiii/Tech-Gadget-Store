import { useState } from 'react'

const PRODUCTS = [
  { id:1, name:'iPhone 15 Pro Max 256GB',   sku:'APL-IP15PM-256',  unit:'Cái', stock:15 },
  { id:2, name:'Samsung Galaxy S24 Ultra',   sku:'SAM-S24U-256',   unit:'Cái', stock:8  },
  { id:3, name:'MacBook Air M3 13"',         sku:'APL-MBA-M3-13',  unit:'Cái', stock:2  },
  { id:4, name:'AirPods Pro 2nd Gen',        sku:'APL-APP2',       unit:'Cái', stock:3  },
  { id:5, name:'iPad Pro 11" M4',            sku:'APL-IPDPRO-M4',  unit:'Cái', stock:6  },
  { id:6, name:'Samsung 65" QLED TV',        sku:'SAM-TV65Q',      unit:'Cái', stock:4  },
  { id:7, name:'Sony WH-1000XM5',            sku:'SON-WH1000XM5',  unit:'Cái', stock:12 },
  { id:8, name:'Apple Watch Series 9 45mm',  sku:'APL-AW9-45',     unit:'Cái', stock:9  },
]

const EXPORT_TYPES = [
  { id:'sale',     label:'Xuất bán',           recipientLabel:'Khách hàng',     color:'blue'   },
  { id:'transfer', label:'Xuất chuyển kho',    recipientLabel:'Kho nhận',       color:'purple' },
  { id:'damage',   label:'Xuất hỏng / thanh lý', recipientLabel:'Lý do',       color:'red'    },
  { id:'return',   label:'Xuất trả NCC',        recipientLabel:'Nhà cung cấp',  color:'amber'  },
]

const TYPE_BADGE = {
  sale:     'bg-orange-50 text-[#C4350A]',
  transfer: 'bg-purple-100 text-purple-700',
  damage:   'bg-red-100 text-red-600',
  return:   'bg-amber-100 text-amber-700',
}

const fmt = n => n.toLocaleString('vi-VN')

function genId() {
  const d = new Date()
  const s = `${String(d.getDate()).padStart(2,'0')}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getFullYear()).slice(2)}`
  return `PX-${s}-${String(Math.floor(Math.random()*900)+100)}`
}

function today() {
  const d = new Date()
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
}

const BLANK_ROW = () => ({ productId:'', qty:1 })

/* ── Export Receipt Modal ── */
function ExportReceiptModal({ receipt, onClose }) {
  const type = EXPORT_TYPES.find(t => t.id === receipt.exportType)
  const isSale = receipt.exportType === 'sale'
  const rows = receipt.rows
  const sub  = rows.reduce((s, r) => {
    const p = PRODUCTS.find(p => String(p.id) === String(r.productId))
    return s + (p?.stock || 0) * 0 + (Number(r.qty) || 0) * (r.refPrice || 0)
  }, 0)
  const vat   = isSale ? Math.round(sub * 0.1) : 0
  const total = sub + vat

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gray-900  px-6 py-5 text-white">
            <p className="text-xs font-semibold opacity-70 uppercase tracking-widest">TechStore · Kho vận</p>
            <h2 className="text-2xl font-black mt-1">PHIẾU XUẤT KHO</h2>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm opacity-80">Số phiếu: <span className="font-bold">{receipt.id}</span></span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TYPE_BADGE[receipt.exportType]}`}>{type?.label}</span>
            </div>
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
                    <th className="px-3 py-2.5 text-right text-xs font-bold text-gray-400 uppercase">Tồn sau</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rows.map((r, i) => {
                    const p = PRODUCTS.find(p => String(p.id) === String(r.productId))
                    return (
                      <tr key={i}>
                        <td className="px-3 py-2.5 text-gray-400 text-xs">{i+1}</td>
                        <td className="px-3 py-2.5">
                          <p className="text-xs font-semibold text-gray-800">{p?.name}</p>
                          <p className="text-[11px] text-gray-400">{p?.sku}</p>
                        </td>
                        <td className="px-3 py-2.5 text-center text-sm font-bold text-red-600">{r.qty}</td>
                        <td className="px-3 py-2.5 text-right text-sm font-semibold text-gray-600">{(p?.stock || 0) - (Number(r.qty)||0)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {isSale && (
              <div className="bg-slate-50 rounded p-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500"><span>Tổng giá trị xuất</span><span className="font-semibold">{fmt(sub)}đ</span></div>
                <div className="flex justify-between text-gray-500"><span>VAT (10%)</span><span className="font-semibold">{fmt(vat)}đ</span></div>
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
                  {i === 0 && <p className="text-xs font-semibold text-gray-700 border-t border-dashed border-gray-300 pt-1">Lê Hoàng Dũng</p>}
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
  const [exportType, setExportType] = useState('sale')
  const [recipient,  setRecipient]  = useState('')
  const [date,       setDate]       = useState(today())
  const [note,       setNote]       = useState('')
  const [rows,       setRows]       = useState([BLANK_ROW()])
  const [errors,     setErrors]     = useState({})
  const [receipt,    setReceipt]    = useState(null)

  const inp = 'w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400'
  const sel = inp + ' cursor-pointer'
  const currentType = EXPORT_TYPES.find(t => t.id === exportType)

  function addRow() { setRows(r => [...r, BLANK_ROW()]) }
  function removeRow(i) { setRows(r => r.filter((_,idx) => idx !== i)) }
  function updateRow(i, field, val) { setRows(r => r.map((row, idx) => idx === i ? { ...row, [field]: val } : row)) }

  function stockAfter(row) {
    const p = PRODUCTS.find(p => String(p.id) === String(row.productId))
    if (!p) return null
    return p.stock - (Number(row.qty) || 0)
  }

  function handleSubmit() {
    const e = {}
    if (!recipient.trim()) e.recipient = `Vui lòng nhập ${currentType?.recipientLabel}`
    const validRows = rows.filter(r => r.productId && Number(r.qty) > 0)
    if (validRows.length === 0) e.rows = 'Cần ít nhất 1 sản phẩm'
    validRows.forEach((r, i) => {
      const after = stockAfter(r)
      if (after !== null && after < 0) e[`row_${i}`] = 'Xuất quá số lượng tồn kho'
    })
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setReceipt({ id:genId(), date, exportType, recipient, note, rows: validRows })
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
          <button className="relative p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">LD</div>
        </div>
      </header>

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
                <input value={date} onChange={e => setDate(e.target.value)} className={inp} placeholder="dd/mm/yyyy" />
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

            {/* Column headers */}
            <div className="px-6 pt-3 pb-1 grid text-[11px] font-bold text-gray-400 uppercase" style={{gridTemplateColumns:'24px 1fr 80px 120px 80px'}}>
              <span></span><span>Sản phẩm</span><span className="text-center">SL xuất</span><span className="text-center">Tồn kho</span><span></span>
            </div>

            <div className="divide-y divide-gray-50">
              {rows.map((row, i) => {
                const p = PRODUCTS.find(p => String(p.id) === String(row.productId))
                const after = stockAfter(row)
                const overstock = after !== null && after < 0
                return (
                  <div key={i} className={`px-6 py-3.5 flex items-center gap-3 ${overstock ? 'bg-red-50/50' : ''}`}>
                    <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">{i+1}</span>

                    <select value={row.productId} onChange={e => updateRow(i, 'productId', e.target.value)} className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer">
                      <option value="">-- Chọn sản phẩm --</option>
                      {PRODUCTS.map(p => <option key={p.id} value={String(p.id)}>{p.name} (Còn: {p.stock})</option>)}
                    </select>

                    <div className="w-20 shrink-0">
                      <input type="number" min={1} value={row.qty} onChange={e => updateRow(i, 'qty', e.target.value)}
                        className={`w-full border rounded px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 ${overstock ? 'border-red-400 focus:ring-red-300 bg-red-50' : 'border-gray-200 focus:ring-teal-400'}`}
                      />
                    </div>

                    <div className="w-24 text-center shrink-0">
                      {p ? (
                        <div>
                          <p className={`text-sm font-bold ${overstock ? 'text-red-600' : 'text-gray-700'}`}>{after ?? p.stock}</p>
                          <p className="text-[11px] text-gray-400">/ {p.stock} tồn</p>
                        </div>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </div>

                    <button
                      onClick={() => removeRow(i)} disabled={rows.length === 1}
                      className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 disabled:opacity-30 cursor-pointer shrink-0 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                )
              })}
            </div>
            {errors.rows && <p className="text-xs text-red-500 px-6 pb-3">{errors.rows}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button onClick={resetForm} className="px-5 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Làm mới</button>
            <button onClick={handleSubmit} className="px-6 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded text-sm font-bold cursor-pointer transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Tạo phiếu xuất
            </button>
          </div>
        </div>
      </div>

      {receipt && <ExportReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />}
    </div>
  )
}
