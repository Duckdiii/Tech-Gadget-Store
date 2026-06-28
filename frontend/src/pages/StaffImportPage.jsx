import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../services/api'

const SUPPLIERS  = ['Apple VN', 'Samsung Electronics VN', 'Sony VN', 'LG Electronics VN', 'Xiaomi VN', 'ASUS VN', 'Dell Technologies VN']
const WAREHOUSES = ['Kho trung tâm', 'Kho chi nhánh Q1', 'Kho chi nhánh Q7', 'Kho phụ B']

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

const BLANK_ROW = () => ({
  isNewProduct: false,
  productId: '',
  productVariantId: '',
  qty: 1,
  unitPrice: 0,
  newName: '',
  newDescription: '',
  newBrandId: 'brand-apple',
  newCategoryId: 'cat-phone',
  newRamGb: 8,
  newStorageGb: 128,
  newColor: 'Titanium',
  newPrice: 20000000,
})

/* ── Receipt modal ── */
function ImportReceiptModal({ receipt, onClose }) {
  const sub = receipt.rows.reduce((s, r) => s + r.qty * r.unitPrice, 0)
  const vat  = Math.round(sub * 0.1)
  const total = sub + vat

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
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
                <p className="text-xs text-gray-400 font-medium mb-0.5">Kho nhận</p>
                <p className="font-semibold text-gray-800">{receipt.warehouse}</p>
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
                  {receipt.rows.map((r, i) => {
                    const name = r.isNewProduct
                      ? `${r.newName} ${r.newRamGb ? r.newRamGb + 'GB' : ''} ${r.newStorageGb ? r.newStorageGb + 'GB' : ''} ${r.newColor || ''}`.trim()
                      : r.displayName || 'Sản phẩm hiện có'
                    const specs = r.isNewProduct
                      ? `Mới · ${r.newColor || 'No Color'}`
                      : r.specs || ''
                    return (
                      <tr key={i}>
                        <td className="px-3 py-2.5 text-gray-400 text-xs">{i+1}</td>
                        <td className="px-3 py-2.5">
                          <p className="text-xs font-semibold text-gray-800">{name}</p>
                          <p className="text-[11px] text-gray-400">{specs}</p>
                        </td>
                        <td className="px-3 py-2.5 text-center text-sm font-bold text-teal-700">{r.qty}</td>
                        <td className="px-3 py-2.5 text-right text-xs text-gray-600">{fmt(r.unitPrice)}đ</td>
                        <td className="px-3 py-2.5 text-right text-sm font-bold text-gray-800">{fmt(r.qty * r.unitPrice)}đ</td>
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
                  {i === 0 && <p className="text-xs font-semibold text-gray-700 border-t border-dashed border-gray-300 pt-1">{receipt.staffName || 'Thủ kho'}</p>}
                  {i !== 0 && <p className="text-xs text-gray-400 border-t border-dashed border-gray-300 pt-1">...</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 px-6 pb-6">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">
              Đóng
            </button>
            <button onClick={() => window.print()} className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-sm font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2">
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
export default function StaffImportPage() {
  const { user } = useAuth()
  const [productsList, setProductsList] = useState([])
  const [supplier,  setSupplier]  = useState('')
  const [warehouse, setWarehouse] = useState(WAREHOUSES[0])
  const [date,      setDate]      = useState(today())
  const [note,      setNote]      = useState('')
  const [rows,      setRows]      = useState([BLANK_ROW()])
  const [errors,    setErrors]    = useState({})
  const [receipt,   setReceipt]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const userPerfId = USER_EMAIL_TO_ID[user?.email] || 'user-stf-01'

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true)
        const raw = await apiFetch('/api/products')
        const detailed = await Promise.all(
          raw.map(async (p) => {
            try {
              return await apiFetch(`/api/products/${p.id}`)
            } catch {
              return { ...p, variants: [] }
            }
          })
        )
        setProductsList(detailed)
      } catch (err) {
        console.error("Failed to load products list", err)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  const inp = 'w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400'
  const sel = inp + ' cursor-pointer'

  function addRow() { setRows(r => [...r, BLANK_ROW()]) }
  function removeRow(i) { setRows(r => r.filter((_,idx) => idx !== i)) }

  function updateRow(i, field, val) {
    setRows(r => r.map((row, idx) => {
      if (idx !== i) return row
      const next = { ...row, [field]: val }
      
      // Auto-set prices if existing product/variant is selected
      if (field === 'productId') {
        next.productVariantId = ''
      }
      if (field === 'productVariantId') {
        const prod = productsList.find(p => p.id === row.productId)
        const variant = prod?.variants?.find(v => v.id === val)
        if (variant) {
          next.unitPrice = variant.price || 0
          next.displayName = prod.name
          next.specs = `${variant.ramGb ? variant.ramGb + 'GB RAM / ' : ''}${variant.storageGb ? variant.storageGb + 'GB Storage / ' : ''}${variant.color || ''}`
        }
      }
      return next
    }))
  }

  const subtotal = rows.reduce((s, r) => s + (Number(r.qty) || 0) * (Number(r.unitPrice) || 0), 0)
  const vat      = Math.round(subtotal * 0.1)
  const total    = subtotal + vat

  async function handleSubmit() {
    const e = {}
    if (!supplier.trim()) e.supplier = 'Vui lòng chọn nhà cung cấp'
    
    const validRows = rows.filter(r => (r.isNewProduct && r.newName.trim()) || (!r.isNewProduct && r.productVariantId))
    if (validRows.length === 0) e.rows = 'Cần ít nhất 1 sản phẩm hợp lệ'
    
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setSubmitting(true)

    try {
      const payload = {
        performedById: userPerfId,
        note: `${supplier}; ${note}`,
        items: validRows.map(r => {
          if (r.isNewProduct) {
            return {
              newProduct: {
                name: r.newName.trim(),
                description: r.newDescription.trim() || 'Nhập kho sản phẩm mới',
                brandId: r.newBrandId,
                categoryId: r.newCategoryId,
                ramGb: Number(r.newRamGb) || null,
                storageGb: Number(r.newStorageGb) || null,
                color: r.newColor.trim(),
                price: Number(r.newPrice) || 0,
              },
              quantity: Number(r.qty) || 1,
              importPrice: Number(r.unitPrice) || 0,
            }
          } else {
            return {
              productVariantId: r.productVariantId,
              quantity: Number(r.qty) || 1,
              importPrice: Number(r.unitPrice) || 0,
            }
          }
        })
      }

      const res = await apiFetch('/api/import-logs', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      setReceipt({
        id: res.id,
        date: new Date(res.importedAt || res.createdAt).toLocaleDateString('vi-VN'),
        supplier,
        warehouse,
        note,
        staffName: user?.name || 'Lê Hoàng Dũng',
        rows: validRows
      })
    } catch (err) {
      console.error(err)
      setErrors({ submit: err.message || 'Lỗi hệ thống khi nhập kho' })
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setSupplier(''); setWarehouse(WAREHOUSES[0]); setDate(today())
    setNote(''); setRows([BLANK_ROW()]); setErrors({}); setReceipt(null)
  }

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
