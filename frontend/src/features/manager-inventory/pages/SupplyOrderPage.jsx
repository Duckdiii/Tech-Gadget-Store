import { useState, useEffect } from 'react'
import { apiFetch } from '../../../services/api'

const STATUS_LABEL = {
  PENDING:   { label: 'Chờ xử lý',  bg: 'bg-amber-100',  text: 'text-amber-700'  },
  CONFIRMED: { label: 'Đã xác nhận', bg: 'bg-blue-100',   text: 'text-blue-700'   },
  SHIPPING:  { label: 'Đang giao',   bg: 'bg-purple-100', text: 'text-purple-700' },
  DELIVERED: { label: 'Đã giao',     bg: 'bg-green-100',  text: 'text-green-700'  },
  CANCELLED: { label: 'Đã hủy',      bg: 'bg-gray-100',   text: 'text-gray-500'   },
}

function normalizeOrder(dto) {
  return {
    id:                    dto.id,
    supplierId:            dto.supplierId,
    supplierName:          dto.supplierName || '—',
    status:                dto.status,
    orderDate:             dto.orderDate,
    expectedDeliveryDate:  dto.expectedDeliveryDate,
    notes:                 dto.notes || '',
    items:                 dto.items || [],
    totalValue:            dto.totalValue || 0,
  }
}

function variantLabel(variant) {
  const parts = []
  if (variant.ramGb) parts.push(`${variant.ramGb}GB RAM`)
  if (variant.storageGb) parts.push(`${variant.storageGb}GB`)
  if (variant.color) parts.push(variant.color)
  return parts.length ? parts.join(' / ') : 'Mặc định'
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('vi-VN') + ' đ'
}

const EMPTY_NEW_ITEM = { productId: '', variantId: '', variants: [], quantity: '', unitPrice: '' }

const NEXT_STATUS = {
  PENDING:   { status: 'CONFIRMED', label: 'Xác nhận đơn hàng' },
  CONFIRMED: { status: 'SHIPPING',  label: 'Bắt đầu giao hàng' },
  SHIPPING:  { status: 'DELIVERED', label: 'Đánh dấu đã giao' },
}

export default function SupplyOrderPage() {
  const [mode, setMode]           = useState('list')
  const [orders, setOrders]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [toast, setToast]         = useState(null)

  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updating, setUpdating]           = useState(false)

  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts]   = useState([])
  const [supplierId, setSupplierId] = useState('')
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('')
  const [notes, setNotes]         = useState('')
  const [items, setItems]         = useState([])
  const [newItem, setNewItem]     = useState(EMPTY_NEW_ITEM)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [])

  function loadOrders() {
    setLoading(true)
    apiFetch('/api/manager/supply-orders')
      .then(data => setOrders(data.map(normalizeOrder)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 3200) }

  function resetForm() {
    setSupplierId('')
    setExpectedDeliveryDate('')
    setNotes('')
    setItems([])
    setNewItem(EMPTY_NEW_ITEM)
  }

  function openCreate() {
    resetForm()
    setMode('create')
    apiFetch('/api/manager/suppliers').then(data => setSuppliers(data)).catch(err => showToast(err.message))
    apiFetch('/api/products?page=0&size=200').then(data => setProducts(data.items || [])).catch(err => showToast(err.message))
  }

  function backToList() {
    setMode('list')
    setSelectedOrder(null)
    loadOrders()
  }

  async function openDetail(id) {
    try {
      const dto = await apiFetch(`/api/manager/supply-orders/${id}`)
      setSelectedOrder(normalizeOrder(dto))
      setMode('detail')
    } catch (err) {
      showToast(err.message)
    }
  }

  async function handleUpdateStatus(newStatus) {
    setUpdating(true)
    try {
      const dto = await apiFetch(`/api/manager/supply-orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })
      setSelectedOrder(normalizeOrder(dto))
      showToast('Supply Order status updated successfully')
    } catch (err) {
      showToast(err.message)
    } finally {
      setUpdating(false)
    }
  }

  async function onSelectProduct(productId) {
    if (!productId) { setNewItem(EMPTY_NEW_ITEM); return }
    try {
      const detail = await apiFetch(`/api/products/${productId}`)
      const variants = detail.variants || []
      const single = variants.length === 1 ? variants[0] : null
      setNewItem({
        productId,
        variantId: single ? single.id : '',
        variants,
        quantity: '',
        unitPrice: single ? single.price : '',
      })
    } catch (err) {
      showToast(err.message)
    }
  }

  function onSelectVariant(variantId) {
    const variant = newItem.variants.find(v => v.id === variantId)
    setNewItem(f => ({ ...f, variantId, unitPrice: variant ? variant.price : f.unitPrice }))
  }

  function addItem() {
    if (!newItem.variantId || !newItem.quantity || !newItem.unitPrice) {
      showToast('Please fill in all required fields')
      return
    }
    const product = products.find(p => p.id === newItem.productId)
    const variant = newItem.variants.find(v => v.id === newItem.variantId)
    setItems(p => [...p, {
      productVariantId: newItem.variantId,
      label: `${product?.name || ''}${variant ? ' — ' + variantLabel(variant) : ''}`,
      quantity: Number(newItem.quantity),
      unitPrice: Number(newItem.unitPrice),
    }])
    setNewItem(EMPTY_NEW_ITEM)
  }

  function removeItem(index) {
    setItems(p => p.filter((_, i) => i !== index))
  }

  const itemsTotal = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0)

  async function handleSubmit() {
    if (!supplierId || !expectedDeliveryDate) {
      showToast('Please fill in all required fields')
      return
    }
    if (items.length === 0) {
      showToast('Please add at least one product to the order')
      return
    }

    const payload = {
      supplierId,
      expectedDeliveryDate,
      notes,
      items: items.map(it => ({
        productVariantId: it.productVariantId,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
      })),
    }

    setSubmitting(true)
    try {
      await apiFetch('/api/manager/supply-orders', { method: 'POST', body: JSON.stringify(payload) })
      showToast('Purchase Order created successfully')
      backToList()
    } catch (err) {
      showToast(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const inp = 'w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]'

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 px-8 py-7 space-y-5">

        {mode === 'list' && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Đơn nhập hàng</h1>
                <p className="text-sm text-gray-500 mt-0.5">Quản lý các đơn nhập hàng từ nhà cung cấp</p>
              </div>
              <button onClick={openCreate} className="flex items-center gap-2 bg-[#E8420A] hover:bg-[#C4350A] text-white font-semibold py-2.5 px-4 rounded text-sm transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                Tạo đơn nhập hàng
              </button>
            </div>

            {loading && <div className="bg-white rounded border border-gray-200 py-16 text-center text-gray-400 text-sm">Đang tải dữ liệu...</div>}
            {error && !loading && <div className="bg-red-50 border border-red-200 rounded px-5 py-4 text-red-600 text-sm">{error}</div>}

            {!loading && !error && (
              <div className="bg-white rounded border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Nhà cung cấp', 'Trạng thái', 'Ngày đặt', 'Ngày giao dự kiến', 'Tổng giá trị'].map((h, i) => (
                        <th key={i} className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wide text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.length === 0
                      ? <tr><td colSpan={5} className="text-center py-12 text-gray-400">Chưa có đơn nhập hàng nào</td></tr>
                      : orders.map(o => {
                        const st = STATUS_LABEL[o.status] || STATUS_LABEL.PENDING
                        return (
                          <tr key={o.id} onClick={() => openDetail(o.id)} className="hover:bg-gray-50/70 transition-colors cursor-pointer">
                            <td className="px-4 py-4 font-semibold text-gray-800">{o.supplierName}</td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
                            </td>
                            <td className="px-4 py-4 text-gray-600">{o.orderDate}</td>
                            <td className="px-4 py-4 text-gray-600">{o.expectedDeliveryDate || '—'}</td>
                            <td className="px-4 py-4 text-gray-800 font-semibold">{formatCurrency(o.totalValue)}</td>
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {mode === 'create' && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tạo đơn nhập hàng</h1>
                <p className="text-sm text-gray-500 mt-0.5">Chọn nhà cung cấp và sản phẩm cần nhập</p>
              </div>
              <button onClick={backToList} className="text-sm text-gray-500 hover:text-gray-700 font-medium cursor-pointer">← Quay lại danh sách</button>
            </div>

            <div className="bg-white rounded border border-gray-200 px-6 py-5">
              <h2 className="text-base font-bold text-gray-800 mb-4">Thông tin chung</h2>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Nhà cung cấp *</label>
                  <select value={supplierId} onChange={e => setSupplierId(e.target.value)} className={inp}>
                    <option value="">Chọn nhà cung cấp</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Ngày giao dự kiến *</label>
                  <input type="date" value={expectedDeliveryDate} onChange={e => setExpectedDeliveryDate(e.target.value)} className={inp} />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Ghi chú</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Không bắt buộc" className={`${inp} resize-none`} />
              </div>
            </div>

            <div className="bg-white rounded border border-gray-200 px-6 py-5">
              <h2 className="text-base font-bold text-gray-800 mb-4">Thêm sản phẩm</h2>
              <div className="grid grid-cols-[1fr_1fr_6rem_9rem_auto] gap-3 items-end">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Sản phẩm</label>
                  <select value={newItem.productId} onChange={e => onSelectProduct(e.target.value)} className={inp}>
                    <option value="">Chọn sản phẩm</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Phiên bản</label>
                  <select value={newItem.variantId} onChange={e => onSelectVariant(e.target.value)} disabled={newItem.variants.length <= 1} className={`${inp} disabled:bg-gray-100`}>
                    {newItem.variants.length === 0 && <option value="">—</option>}
                    {newItem.variants.length > 1 && <option value="">Chọn phiên bản</option>}
                    {newItem.variants.map(v => <option key={v.id} value={v.id}>{variantLabel(v)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">SL</label>
                  <input type="number" min="1" value={newItem.quantity} onChange={e => setNewItem(f => ({ ...f, quantity: e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Đơn giá</label>
                  <input type="number" min="0" value={newItem.unitPrice} onChange={e => setNewItem(f => ({ ...f, unitPrice: e.target.value }))} className={inp} />
                </div>
                <button onClick={addItem} className="py-2 px-4 bg-gray-900 hover:bg-black text-white rounded text-sm font-semibold cursor-pointer">Thêm vào đơn</button>
              </div>

              <div className="mt-5">
                {items.length === 0
                  ? <p className="text-sm text-gray-400 text-center py-6">Chưa có sản phẩm nào trong đơn</p>
                  : (
                    <table className="w-full text-sm">
                      <thead className="border-b border-gray-100">
                        <tr>
                          {['Sản phẩm', 'SL', 'Đơn giá', 'Thành tiền', ''].map((h, i) => (
                            <th key={i} className="py-2 text-xs font-bold text-gray-400 uppercase text-left">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {items.map((it, i) => (
                          <tr key={i}>
                            <td className="py-2.5 text-gray-800">{it.label}</td>
                            <td className="py-2.5 text-gray-600">{it.quantity}</td>
                            <td className="py-2.5 text-gray-600">{formatCurrency(it.unitPrice)}</td>
                            <td className="py-2.5 font-semibold text-gray-800">{formatCurrency(it.quantity * it.unitPrice)}</td>
                            <td className="py-2.5 text-right">
                              <button onClick={() => removeItem(i)} className="text-xs text-red-500 hover:text-red-700 cursor-pointer">Xóa</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                }
              </div>
            </div>

            <div className="bg-white rounded border border-gray-200 px-6 py-5 flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-600">Tổng cộng: </span>
                <span className="text-xl font-black text-[#E8420A]">{formatCurrency(itemsTotal)}</span>
              </div>
              <button onClick={handleSubmit} disabled={submitting} className="py-2.5 px-6 bg-[#E8420A] hover:bg-[#C4350A] disabled:opacity-60 text-white rounded text-sm font-semibold cursor-pointer transition-colors">
                {submitting ? 'Đang gửi...' : 'Gửi đơn'}
              </button>
            </div>
          </>
        )}

        {mode === 'detail' && selectedOrder && (() => {
          const st = STATUS_LABEL[selectedOrder.status] || STATUS_LABEL.PENDING
          const next = NEXT_STATUS[selectedOrder.status]
          const isFinal = selectedOrder.status === 'DELIVERED' || selectedOrder.status === 'CANCELLED'
          return (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Chi tiết đơn nhập hàng</h1>
                  <p className="text-sm text-gray-500 mt-0.5">{selectedOrder.supplierName}</p>
                </div>
                <button onClick={backToList} className="text-sm text-gray-500 hover:text-gray-700 font-medium cursor-pointer">← Quay lại danh sách</button>
              </div>

              <div className="bg-white rounded border border-gray-200 px-6 py-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-gray-800">Thông tin chung</h2>
                  <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
                </div>
                <div className="grid grid-cols-3 gap-5 text-sm">
                  <div><span className="text-gray-400 text-xs block mb-1">Nhà cung cấp</span><span className="font-semibold text-gray-800">{selectedOrder.supplierName}</span></div>
                  <div><span className="text-gray-400 text-xs block mb-1">Ngày đặt</span><span className="text-gray-700">{selectedOrder.orderDate}</span></div>
                  <div><span className="text-gray-400 text-xs block mb-1">Ngày giao dự kiến</span><span className="text-gray-700">{selectedOrder.expectedDeliveryDate || '—'}</span></div>
                </div>
              </div>

              <div className="bg-white rounded border border-gray-200 px-6 py-5">
                <h2 className="text-base font-bold text-gray-800 mb-4">Danh sách sản phẩm</h2>
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-100">
                    <tr>
                      {['Sản phẩm', 'SL', 'Đơn giá', 'Thành tiền'].map((h, i) => (
                        <th key={i} className="py-2 text-xs font-bold text-gray-400 uppercase text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selectedOrder.items.map(it => (
                      <tr key={it.id}>
                        <td className="py-2.5 text-gray-800">{it.productName}{it.variantLabel ? ` — ${it.variantLabel}` : ''}</td>
                        <td className="py-2.5 text-gray-600">{it.quantity}</td>
                        <td className="py-2.5 text-gray-600">{formatCurrency(it.unitPrice)}</td>
                        <td className="py-2.5 font-semibold text-gray-800">{formatCurrency(it.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-white rounded border border-gray-200 px-6 py-5 flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-600">Tổng giá trị: </span>
                  <span className="text-xl font-black text-[#E8420A]">{formatCurrency(selectedOrder.totalValue)}</span>
                </div>
                {!isFinal && (
                  <div className="flex gap-3">
                    <button onClick={() => handleUpdateStatus('CANCELLED')} disabled={updating} className="py-2.5 px-5 border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60 rounded text-sm font-semibold cursor-pointer transition-colors">
                      Hủy đơn
                    </button>
                    {next && (
                      <button onClick={() => handleUpdateStatus(next.status)} disabled={updating} className="py-2.5 px-6 bg-[#E8420A] hover:bg-[#C4350A] disabled:opacity-60 text-white rounded text-sm font-semibold cursor-pointer transition-colors">
                        {updating ? 'Đang cập nhật...' : next.label}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )
        })()}
      </div>

      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-xl z-[70]">{toast}</div>}
    </div>
  )
}
