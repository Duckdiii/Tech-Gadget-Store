import { useState, useEffect } from 'react'
import { apiFetch } from '../../../services/api'

function normalizeProduct(dto) {
  return {
    id:           dto.id,
    name:         dto.name || '',
    brandName:    dto.brandName || '',
    categoryName: dto.categoryName || '',
    minPrice:     dto.minPrice,
    imageUrl:     dto.imageUrl || '',
    hasVariants:  !!dto.hasVariants,
  }
}

const EMPTY_FORM = {
  name: '', description: '', brandId: '', categoryId: '',
  screenSize: '', screenResolution: '', rearCamera: '', frontCamera: '',
  chipset: '', nfcSupported: false, batteryCapacity: '', simType: '', operatingSystem: '',
}

const EMPTY_VARIANT_FORM = { ramGb: '', storageGb: '', color: '', price: '' }
const EMPTY_IMAGE_FORM = { name: '', imageUrl: '' }

function formatCurrency(value) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export default function ProductManagementPage() {
  const [products, setProducts]   = useState([])
  const [brands, setBrands]       = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [search, setSearch]       = useState('')

  const [panel, setPanel]         = useState(null) // 'add' | 'edit' | null
  const [editingId, setEditingId] = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving]       = useState(false)
  const [showSpecs, setShowSpecs] = useState(false)

  const [variants, setVariants]     = useState([])
  const [images, setImages]         = useState([])
  const [variantForm, setVariantForm] = useState(EMPTY_VARIANT_FORM)
  const [imageForm, setImageForm]     = useState(EMPTY_IMAGE_FORM)
  const [subError, setSubError]       = useState(null)
  const [subSaving, setSubSaving]     = useState(false)

  const [discontinueId, setDiscontinueId] = useState(null)
  const [discontinuing, setDiscontinuing] = useState(false)
  const [toast, setToast]         = useState(null)

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 3200) }

  function loadProducts() {
    setLoading(true)
    apiFetch('/api/products?page=0&size=100')
      .then(data => setProducts((data.items || []).map(normalizeProduct)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProducts()
    apiFetch('/api/manager/brands').then(setBrands).catch(() => {})
    apiFetch('/api/manager/categories').then(setCategories).catch(() => {})
  }, [])

  const filtered = products.filter(p => {
    const q = search.toLowerCase()
    return !q || p.name.toLowerCase().includes(q) || p.brandName.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q)
  })

  const inp = 'w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]'

  function openAdd() {
    setForm(EMPTY_FORM)
    setFormErrors({})
    setVariants([])
    setImages([])
    setVariantForm(EMPTY_VARIANT_FORM)
    setImageForm(EMPTY_IMAGE_FORM)
    setSubError(null)
    setShowSpecs(false)
    setEditingId(null)
    setPanel('add')
  }

  async function openEdit(p) {
    setEditingId(p.id)
    setFormErrors({})
    setVariantForm(EMPTY_VARIANT_FORM)
    setImageForm(EMPTY_IMAGE_FORM)
    setSubError(null)
    setShowSpecs(false)
    setPanel('edit')
    try {
      const detail = await apiFetch(`/api/products/${p.id}`)
      applyDetail(detail)
    } catch (err) {
      showToast(err.message)
      closePanel()
    }
  }

  function applyDetail(detail) {
    setForm({
      name: detail.name || '',
      description: detail.description || '',
      brandId: detail.brandId || '',
      categoryId: detail.categoryId || '',
      screenSize: detail.screenSize ?? '',
      screenResolution: detail.screenResolution || '',
      rearCamera: detail.rearCamera || '',
      frontCamera: detail.frontCamera || '',
      chipset: detail.chipset || '',
      nfcSupported: !!detail.nfcSupported,
      batteryCapacity: detail.batteryCapacity ?? '',
      simType: detail.simType || '',
      operatingSystem: detail.operatingSystem || '',
    })
    setVariants(detail.variants || [])
    setImages(detail.images || [])
  }

  function closePanel() {
    setPanel(null)
    setEditingId(null)
  }

  function buildPayload() {
    return {
      name: form.name.trim(),
      description: form.description.trim() || null,
      brandId: form.brandId,
      categoryId: form.categoryId,
      screenSize: form.screenSize === '' ? null : Number(form.screenSize),
      screenResolution: form.screenResolution.trim() || null,
      rearCamera: form.rearCamera.trim() || null,
      frontCamera: form.frontCamera.trim() || null,
      chipset: form.chipset.trim() || null,
      nfcSupported: form.nfcSupported,
      batteryCapacity: form.batteryCapacity === '' ? null : Number(form.batteryCapacity),
      simType: form.simType.trim() || null,
      operatingSystem: form.operatingSystem.trim() || null,
    }
  }

  function validateBasic() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Vui lòng nhập tên sản phẩm'
    if (!form.brandId) errs.brandId = 'Vui lòng chọn thương hiệu'
    if (!form.categoryId) errs.categoryId = 'Vui lòng chọn danh mục'
    return errs
  }

  async function handleAdd() {
    const errs = validateBasic()
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    setSaving(true)
    try {
      const dto = await apiFetch('/api/manager/products', { method: 'POST', body: JSON.stringify(buildPayload()) })
      showToast('Đã thêm sản phẩm mới')
      loadProducts()
      setEditingId(dto.id)
      applyDetail(dto)
      setPanel('edit')
    } catch (err) {
      showToast(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveEdit() {
    const errs = validateBasic()
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    setSaving(true)
    try {
      const dto = await apiFetch(`/api/manager/products/${editingId}`, { method: 'PUT', body: JSON.stringify(buildPayload()) })
      applyDetail(dto)
      loadProducts()
      showToast('Đã cập nhật sản phẩm')
    } catch (err) {
      showToast(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDiscontinue(id) {
    setDiscontinuing(true)
    try {
      await apiFetch(`/api/manager/products/${id}/discontinue`, { method: 'PATCH' })
      setProducts(p => p.filter(x => x.id !== id))
      setDiscontinueId(null)
      if (editingId === id) closePanel()
      showToast('Đã ngừng kinh doanh sản phẩm')
    } catch (err) {
      showToast(err.message)
    } finally {
      setDiscontinuing(false)
    }
  }

  async function handleAddVariant() {
    if (!variantForm.ramGb || !variantForm.storageGb || !variantForm.color.trim() || !variantForm.price) {
      setSubError('Vui lòng điền đầy đủ thông tin phiên bản')
      return
    }
    setSubSaving(true)
    setSubError(null)
    try {
      const payload = {
        ramGb: Number(variantForm.ramGb),
        storageGb: Number(variantForm.storageGb),
        color: variantForm.color.trim(),
        price: Number(variantForm.price),
      }
      const dto = await apiFetch(`/api/manager/products/${editingId}/variants`, { method: 'POST', body: JSON.stringify(payload) })
      setVariants(v => [...v, dto])
      setVariantForm(EMPTY_VARIANT_FORM)
      loadProducts()
    } catch (err) {
      setSubError(err.message)
    } finally {
      setSubSaving(false)
    }
  }

  async function handleRemoveVariant(variantId) {
    setSubError(null)
    try {
      await apiFetch(`/api/manager/products/${editingId}/variants/${variantId}`, { method: 'DELETE' })
      setVariants(v => v.filter(x => x.id !== variantId))
      loadProducts()
    } catch (err) {
      setSubError(err.message)
    }
  }

  async function handleAddImage() {
    if (!imageForm.imageUrl.trim()) {
      setSubError('Vui lòng nhập URL ảnh')
      return
    }
    setSubSaving(true)
    setSubError(null)
    try {
      const payload = { name: imageForm.name.trim() || null, imageUrl: imageForm.imageUrl.trim() }
      const dto = await apiFetch(`/api/manager/products/${editingId}/images`, { method: 'POST', body: JSON.stringify(payload) })
      setImages(i => [...i, dto])
      setImageForm(EMPTY_IMAGE_FORM)
      loadProducts()
    } catch (err) {
      setSubError(err.message)
    } finally {
      setSubSaving(false)
    }
  }

  async function handleRemoveImage(imageId) {
    setSubError(null)
    try {
      await apiFetch(`/api/manager/products/${editingId}/images/${imageId}`, { method: 'DELETE' })
      setImages(i => i.filter(x => x.id !== imageId))
      loadProducts()
    } catch (err) {
      setSubError(err.message)
    }
  }

  const panelOpen = panel === 'add' || panel === 'edit'

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 px-8 py-7 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
            <p className="text-sm text-gray-500 mt-0.5">Thêm mới và quản lý sản phẩm, phiên bản, hình ảnh</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-[#E8420A] hover:bg-[#C4350A] text-white font-semibold py-2.5 px-4 rounded text-sm transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Thêm sản phẩm
          </button>
        </div>

        <div className="bg-white rounded border border-gray-200 px-5 py-3.5 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tên, thương hiệu, danh mục..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]" />
          </div>
          <span className="ml-auto text-xs text-gray-400 shrink-0">{filtered.length} / {products.length} sản phẩm</span>
        </div>

        {loading && <div className="bg-white rounded border border-gray-200 py-16 text-center text-gray-400 text-sm">Đang tải dữ liệu...</div>}
        {error && !loading && <div className="bg-red-50 border border-red-200 rounded px-5 py-4 text-red-600 text-sm">{error}</div>}

        {!loading && !error && (
          <div className="bg-white rounded border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Ảnh', 'Tên sản phẩm', 'Thương hiệu', 'Danh mục', 'Giá từ', 'Phiên bản', ''].map((h, i) => (
                    <th key={i} className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wide text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0
                  ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">Không tìm thấy sản phẩm nào</td></tr>
                  : filtered.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/70 transition-colors group">
                      <td className="px-4 py-3">
                        {p.imageUrl
                          ? <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded object-cover border border-gray-100" />
                          : <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-300 text-[10px]">N/A</div>}
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-800">{p.name || '—'}</td>
                      <td className="px-4 py-4 text-gray-600">{p.brandName || '—'}</td>
                      <td className="px-4 py-4 text-gray-600">{p.categoryName || '—'}</td>
                      <td className="px-4 py-4 text-gray-600">{formatCurrency(p.minPrice)}</td>
                      <td className="px-4 py-4">
                        {p.hasVariants
                          ? <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Có phiên bản</span>
                          : <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">Chưa có</span>}
                      </td>
                      <td className="px-4 py-4">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(p)} className="text-xs text-[#E8420A] hover:text-[#C4350A] font-medium cursor-pointer px-2 py-1 rounded hover:bg-orange-50">
                            Sửa →
                          </button>
                          <button onClick={() => setDiscontinueId(p.id)} className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer px-2 py-1 rounded hover:bg-red-50">
                            Ngừng kinh doanh
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}
      </div>

      {panelOpen && <div className="fixed inset-0 bg-black/30 z-40" onClick={closePanel} />}

      {panelOpen && (
        <div className="fixed top-0 right-0 h-full w-[520px] bg-white shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{panel === 'add' ? 'Thêm sản phẩm mới' : 'Sửa sản phẩm'}</h2>
              <p className="text-xs text-gray-400 mt-0.5">Điền đầy đủ thông tin bên dưới</p>
            </div>
            <button onClick={closePanel} className="p-2 hover:bg-gray-100 rounded cursor-pointer"><svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <div className="space-y-4">
              <Field label="Tên sản phẩm *" error={formErrors.name}>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="iPhone 15 Pro Max" className={inp} />
              </Field>
              <Field label="Mô tả">
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Mô tả sản phẩm..." className={inp} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Thương hiệu *" error={formErrors.brandId}>
                  <select value={form.brandId} onChange={e => setForm(f => ({ ...f, brandId: e.target.value }))} className={inp}>
                    <option value="">Chọn thương hiệu</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </Field>
                <Field label="Danh mục *" error={formErrors.categoryId}>
                  <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className={inp}>
                    <option value="">Chọn danh mục</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <button onClick={() => setShowSpecs(s => !s)} className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 cursor-pointer">
                Thông số kỹ thuật
                <svg className={`w-4 h-4 transition-transform ${showSpecs ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showSpecs && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Field label="Kích thước màn hình (inch)">
                    <input type="number" step="0.1" value={form.screenSize} onChange={e => setForm(f => ({ ...f, screenSize: e.target.value }))} className={inp} />
                  </Field>
                  <Field label="Độ phân giải màn hình">
                    <input value={form.screenResolution} onChange={e => setForm(f => ({ ...f, screenResolution: e.target.value }))} className={inp} />
                  </Field>
                  <Field label="Camera sau">
                    <input value={form.rearCamera} onChange={e => setForm(f => ({ ...f, rearCamera: e.target.value }))} className={inp} />
                  </Field>
                  <Field label="Camera trước">
                    <input value={form.frontCamera} onChange={e => setForm(f => ({ ...f, frontCamera: e.target.value }))} className={inp} />
                  </Field>
                  <Field label="Chipset">
                    <input value={form.chipset} onChange={e => setForm(f => ({ ...f, chipset: e.target.value }))} className={inp} />
                  </Field>
                  <Field label="Dung lượng pin (mAh)">
                    <input type="number" value={form.batteryCapacity} onChange={e => setForm(f => ({ ...f, batteryCapacity: e.target.value }))} className={inp} />
                  </Field>
                  <Field label="Loại SIM">
                    <input value={form.simType} onChange={e => setForm(f => ({ ...f, simType: e.target.value }))} className={inp} />
                  </Field>
                  <Field label="Hệ điều hành">
                    <input value={form.operatingSystem} onChange={e => setForm(f => ({ ...f, operatingSystem: e.target.value }))} className={inp} />
                  </Field>
                  <label className="flex items-center gap-2 text-sm text-gray-700 col-span-2">
                    <input type="checkbox" checked={form.nfcSupported} onChange={e => setForm(f => ({ ...f, nfcSupported: e.target.checked }))} className="w-4 h-4" />
                    Hỗ trợ NFC
                  </label>
                </div>
              )}
            </div>

            {panel === 'edit' && (
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Phiên bản (RAM / Bộ nhớ / Màu)</h3>
                  {subError && <p className="text-xs text-red-500 mb-2">{subError}</p>}
                  <div className="space-y-1.5 mb-2">
                    {variants.map(v => (
                      <div key={v.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 text-xs">
                        <span className="text-gray-700">{v.ramGb}GB / {v.storageGb}GB / {v.color} — {formatCurrency(v.price)}</span>
                        <button onClick={() => handleRemoveVariant(v.id)} className="text-red-500 hover:text-red-700 cursor-pointer font-medium">Xóa</button>
                      </div>
                    ))}
                    {variants.length === 0 && <p className="text-xs text-gray-400">Chưa có phiên bản nào</p>}
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    <input type="number" placeholder="RAM (GB)" value={variantForm.ramGb} onChange={e => setVariantForm(f => ({ ...f, ramGb: e.target.value }))} className={`${inp} text-xs px-2 py-1.5`} />
                    <input type="number" placeholder="Bộ nhớ (GB)" value={variantForm.storageGb} onChange={e => setVariantForm(f => ({ ...f, storageGb: e.target.value }))} className={`${inp} text-xs px-2 py-1.5`} />
                    <input placeholder="Màu sắc" value={variantForm.color} onChange={e => setVariantForm(f => ({ ...f, color: e.target.value }))} className={`${inp} text-xs px-2 py-1.5`} />
                    <input type="number" placeholder="Giá" value={variantForm.price} onChange={e => setVariantForm(f => ({ ...f, price: e.target.value }))} className={`${inp} text-xs px-2 py-1.5`} />
                  </div>
                  <button onClick={handleAddVariant} disabled={subSaving} className="mt-2 w-full py-1.5 border border-dashed border-gray-300 rounded text-xs font-medium text-gray-500 hover:border-[#E8420A] hover:text-[#E8420A] cursor-pointer disabled:opacity-60">
                    + Thêm phiên bản
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Hình ảnh</h3>
                  <div className="space-y-1.5 mb-2">
                    {images.map(img => (
                      <div key={img.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 text-xs gap-2">
                        <img src={img.imageUrl} alt={img.name || ''} className="w-8 h-8 rounded object-cover border border-gray-100 shrink-0" />
                        <span className="text-gray-700 truncate flex-1">{img.name || img.imageUrl}</span>
                        <button onClick={() => handleRemoveImage(img.id)} className="text-red-500 hover:text-red-700 cursor-pointer font-medium shrink-0">Xóa</button>
                      </div>
                    ))}
                    {images.length === 0 && <p className="text-xs text-gray-400">Chưa có hình ảnh nào</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <input placeholder="Tên ảnh (tùy chọn)" value={imageForm.name} onChange={e => setImageForm(f => ({ ...f, name: e.target.value }))} className={`${inp} text-xs px-2 py-1.5 col-span-1`} />
                    <input placeholder="URL ảnh" value={imageForm.imageUrl} onChange={e => setImageForm(f => ({ ...f, imageUrl: e.target.value }))} className={`${inp} text-xs px-2 py-1.5 col-span-2`} />
                  </div>
                  <button onClick={handleAddImage} disabled={subSaving} className="mt-2 w-full py-1.5 border border-dashed border-gray-300 rounded text-xs font-medium text-gray-500 hover:border-[#E8420A] hover:text-[#E8420A] cursor-pointer disabled:opacity-60">
                    + Thêm ảnh
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            <button onClick={closePanel} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Đóng</button>
            <button onClick={panel === 'add' ? handleAdd : handleSaveEdit} disabled={saving} className="flex-1 py-2.5 bg-[#E8420A] hover:bg-[#C4350A] disabled:opacity-60 text-white rounded text-sm font-semibold cursor-pointer transition-colors">
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      )}

      {discontinueId && (() => {
        const target = products.find(p => p.id === discontinueId)
        return (
          <>
            <div className="fixed inset-0 bg-black/50 z-[60]" />
            <div className="fixed inset-0 flex items-center justify-center z-[60]">
              <div className="bg-white rounded shadow-2xl w-[380px] p-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
                <h3 className="text-lg font-bold text-gray-900 text-center">Ngừng kinh doanh sản phẩm?</h3>
                <p className="text-sm text-gray-500 text-center mt-2">
                  Sản phẩm{target ? ` "${target.name}"` : ''} sẽ bị ẩn khỏi cửa hàng. Lịch sử đơn hàng liên quan vẫn được giữ nguyên
                </p>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setDiscontinueId(null)} disabled={discontinuing} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60 cursor-pointer">Hủy</button>
                  <button onClick={() => handleDiscontinue(discontinueId)} disabled={discontinuing} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded text-sm font-semibold cursor-pointer transition-colors">
                    {discontinuing ? 'Đang xử lý...' : 'Xác nhận'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )
      })()}

      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-xl z-[70]">{toast}</div>}
    </div>
  )
}
