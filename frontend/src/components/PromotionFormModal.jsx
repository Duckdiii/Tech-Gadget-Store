import { useState, useEffect } from 'react'
import { getProductsForPromotion } from '../services/promotionService'

const EMPTY_FORM = {
  code: '',
  name: '',
  discountPercent: '',
  startAt: '',
  endAt: '',
  active: true,
  productIds: [],
}

function toInputDateTime(val) {
  if (!val) return ''
  if (Array.isArray(val)) {
    const [y, mo, d, h = 0, m = 0] = val
    return `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
  }
  return String(val).substring(0, 16)
}

export default function PromotionFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const isEdit = !!initialData
  const [form, setForm] = useState(EMPTY_FORM)
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [prodSearch, setProdSearch] = useState('')
  const [prodCategory, setProdCategory] = useState('')

  useEffect(() => {
    if (!isOpen) return
    setError('')
    setProdSearch('')
    setProdCategory('')
    if (isEdit) {
      setForm({
        code: initialData.code ?? '',
        name: initialData.name ?? '',
        discountPercent: initialData.discountPercent ?? '',
        startAt: toInputDateTime(initialData.startAt),
        endAt: toInputDateTime(initialData.endAt),
        active: initialData.active ?? true,
        productIds: initialData.productIds ?? [],
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setLoadingProducts(true)
    getProductsForPromotion()
      .then((res) => setProducts(res?.items ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false))
  }, [isOpen, initialData, isEdit])

  if (!isOpen) return null

  const categories = [...new Set(products.map((p) => p.categoryName || 'General'))]

  const filteredProducts = products.filter((p) => {
    const q = prodSearch.toLowerCase().trim()
    const matchesSearch = !q || p.name?.toLowerCase().includes(q)
    const matchesCategory = !prodCategory || (p.categoryName || 'General') === prodCategory
    return matchesSearch && matchesCategory
  })

  const handleSelectAllVisible = () => {
    const visibleIds = filteredProducts.map(p => p.id)
    setForm(f => {
      const newIds = [...new Set([...f.productIds, ...visibleIds])]
      return { ...f, productIds: newIds }
    })
  }

  const handleDeselectAllVisible = () => {
    const visibleIds = filteredProducts.map(p => p.id)
    setForm(f => {
      const newIds = f.productIds.filter(id => !visibleIds.includes(id))
      return { ...f, productIds: newIds }
    })
  }

  const handleGenerateCode = () => {
    const prefixes = ['SUMMER', 'WINTER', 'SALE', 'PROMO', 'VIP', 'TECH', 'GIFT']
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()
    set('code', `${prefix}_${randomHex}`)
  }

  const getDurationText = () => {
    if (!form.startAt || !form.endAt) return null
    const start = new Date(form.startAt)
    const end = new Date(form.endAt)
    const diffMs = end.getTime() - start.getTime()
    if (diffMs <= 0) {
      return { text: 'Ngày kết thúc phải sau ngày bắt đầu!', isValid: false }
    }
    const diffSecs = Math.floor(diffMs / 1000)
    const days = Math.floor(diffSecs / (3600 * 24))
    const hours = Math.floor((diffSecs % (3600 * 24)) / 3600)
    const minutes = Math.floor((diffSecs % 3600) / 60)

    let parts = []
    if (days > 0) parts.push(`${days} ngày`)
    if (hours > 0) parts.push(`${hours} giờ`)
    if (minutes > 0) parts.push(`${minutes} phút`)
    
    return { text: `Thời gian chạy: ${parts.join(' ')}`, isValid: true }
  }

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const toggleProduct = (id) => {
    setForm((f) => ({
      ...f,
      productIds: f.productIds.includes(id)
        ? f.productIds.filter((p) => p !== id)
        : [...f.productIds, id],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.code.trim()) return setError('Mã khuyến mãi không được để trống')
    if (!form.name.trim()) return setError('Tên không được để trống')
    const pct = parseFloat(form.discountPercent)
    if (isNaN(pct) || pct < 0 || pct > 100) return setError('Phần trăm giảm phải từ 0 đến 100')
    if (!form.startAt) return setError('Vui lòng chọn ngày bắt đầu')
    if (!form.endAt) return setError('Vui lòng chọn ngày kết thúc')
    if (form.endAt <= form.startAt) return setError('Ngày kết thúc phải sau ngày bắt đầu')
    if (form.productIds.length === 0) return setError('Vui lòng chọn ít nhất một sản phẩm')

    setSubmitting(true)
    try {
      await onSubmit({
        code: form.code.trim(),
        name: form.name.trim(),
        discountPercent: pct,
        startAt: form.startAt + ':00',
        endAt: form.endAt + ':00',
        active: form.active,
        productIds: form.productIds,
      })
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            {isEdit ? 'Chỉnh sửa khuyến mãi' : 'Tạo khuyến mãi mới'}
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Mã khuyến mãi *</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => set('code', e.target.value.toUpperCase())}
                  placeholder="VD: SUMMER24"
                  className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A] bg-white text-gray-700"
                />
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  title="Tạo mã ngẫu nhiên"
                  className="px-3 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded text-gray-600 hover:text-gray-800 transition-colors cursor-pointer text-sm font-semibold flex items-center justify-center"
                >
                  🪄
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Phần trăm giảm (%) *</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.discountPercent}
                onChange={(e) => set('discountPercent', e.target.value)}
                placeholder="10"
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A] bg-white text-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tên chiến dịch *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="VD: Sale Mùa Hè 2024"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A] bg-white text-gray-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày bắt đầu *</label>
              <input
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => set('startAt', e.target.value)}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A] bg-white text-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày kết thúc *</label>
              <input
                type="datetime-local"
                value={form.endAt}
                onChange={(e) => set('endAt', e.target.value)}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A] bg-white text-gray-700"
              />
            </div>
          </div>

          {/* Duration Preview */}
          {(() => {
            const duration = getDurationText()
            if (!duration) return null
            return (
              <p className={`text-xs font-semibold ${duration.isValid ? 'text-green-600' : 'text-red-500'} mt-1`}>
                {duration.text}
              </p>
            )
          })()}

          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-gray-600">Kích hoạt ngay</label>
            <button
              type="button"
              onClick={() => set('active', !form.active)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
                form.active ? 'bg-[#E8420A]' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                form.active ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-gray-600">
                Sản phẩm áp dụng * ({form.productIds.length} đã chọn)
              </label>
              <div className="flex gap-2 text-xs font-bold text-[#E8420A]">
                <button
                  type="button"
                  onClick={handleSelectAllVisible}
                  className="hover:underline cursor-pointer border-none bg-transparent text-[#E8420A] p-0"
                >
                  Chọn tất cả hiển thị
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={handleDeselectAllVisible}
                  className="hover:underline cursor-pointer border-none bg-transparent text-[#E8420A] p-0"
                >
                  Bỏ chọn tất cả
                </button>
              </div>
            </div>

            {/* Search & Filter sub-row */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={prodSearch}
                onChange={e => setProdSearch(e.target.value)}
                className="border border-gray-200 rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#E8420A] bg-white text-gray-700"
              />
              <select
                value={prodCategory}
                onChange={e => setProdCategory(e.target.value)}
                className="border border-gray-200 rounded px-2.5 py-1 text-xs bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {loadingProducts ? (
              <div className="text-sm text-gray-400 py-3 text-center">Đang tải sản phẩm...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-sm text-gray-400 py-3 text-center bg-gray-50 border border-dashed border-gray-200 rounded">Không tìm thấy sản phẩm nào</div>
            ) : (
              <div className="border border-gray-200 rounded max-h-40 overflow-y-auto divide-y divide-gray-100 bg-white">
                {filteredProducts.map((p) => (
                  <label key={p.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.productIds.includes(p.id)}
                      onChange={() => toggleProduct(p.id)}
                      className="accent-[#E8420A] w-4 h-4 shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm text-gray-700 font-medium truncate">{p.name}</span>
                      <span className="text-[10px] text-gray-400">{p.categoryName || 'General'}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#E8420A] hover:bg-[#C4350A] rounded transition-colors disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo khuyến mãi'}
          </button>
        </div>
      </div>
    </div>
  )
}
