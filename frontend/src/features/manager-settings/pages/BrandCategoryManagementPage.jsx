import { useState, useEffect } from 'react'
import { apiFetch } from '../../../services/api'
import Field from '../components/Field'

function normalizeBrand(dto) {
  return { id: dto.id, name: dto.name || '', logoUrl: dto.logoUrl || '', description: dto.description || '' }
}

function normalizeCategory(dto) {
  return { id: dto.id, name: dto.name || '', imageUrl: dto.imageUrl || '' }
}

const EMPTY_BRAND_FORM = { name: '', logoUrl: '', description: '' }
const EMPTY_CATEGORY_FORM = { name: '', imageUrl: '' }

const INP_CLASS = 'w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]'

function ImageUploader({ value, onChange, label, error }) {
  const [uploading, setUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  const handleFile = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setUploadError('Chỉ chấp nhận tệp tin hình ảnh')
      return
    }
    
    setUploading(true)
    setUploadError(null)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const data = await apiFetch('/api/manager/upload', {
        method: 'POST',
        body: formData,
      })
      if (data && data.url) {
        onChange(data.url)
      } else {
        setUploadError('Không nhận được URL ảnh từ server')
      }
    } catch (err) {
      setUploadError(err.message || 'Lỗi khi tải ảnh lên')
    } finally {
      setUploading(false)
    }
  }

  const onDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const onDragLeave = () => {
    setIsDragOver(false)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length) {
      handleFile(files[0])
    }
  }

  const onFileSelect = (e) => {
    const files = e.target.files
    if (files.length) {
      handleFile(files[0])
    }
  }

  return (
    <Field label={label} error={error || uploadError}>
      {showManualInput ? (
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <input
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="https://..."
              className={INP_CLASS}
            />
            <button
              type="button"
              onClick={() => setShowManualInput(false)}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded cursor-pointer shrink-0 transition-colors"
            >
              Chọn file
            </button>
          </div>
          <p className="text-[10px] text-gray-400">Dán link ảnh trực tiếp từ bên ngoài.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {value ? (
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded bg-gray-50/50">
              <img
                src={value}
                alt="Preview"
                className="w-16 h-16 rounded object-cover border border-gray-100 bg-white"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = 'https://placehold.co/100x100?text=Error'
                }}
              />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 font-mono truncate max-w-[220px]">{value}</span>
                <div className="flex items-center gap-2 mt-1">
                  <label className="text-xs text-[#E8420A] hover:text-[#C4350A] font-semibold cursor-pointer">
                    Thay ảnh
                    <input type="file" accept="image/*" className="hidden" onChange={onFileSelect} disabled={uploading} />
                  </label>
                  <span className="text-gray-300 text-xs">|</span>
                  <button
                    type="button"
                    onClick={() => onChange('')}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer bg-transparent border-none p-0"
                  >
                    Xóa
                  </button>
                  <span className="text-gray-300 text-xs">|</span>
                  <button
                    type="button"
                    onClick={() => setShowManualInput(true)}
                    className="text-xs text-gray-500 hover:text-gray-700 font-semibold cursor-pointer bg-transparent border-none p-0"
                  >
                    Nhập URL
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-lg p-5 transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                isDragOver ? 'border-[#E8420A] bg-orange-50/40' : 'border-gray-300 hover:border-gray-400 bg-gray-50/20'
              }`}
              onClick={() => document.getElementById(`file-input-${label}`).click()}
            >
              <input
                id={`file-input-${label}`}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileSelect}
                disabled={uploading}
              />
              {uploading ? (
                <div className="flex flex-col items-center space-y-2 py-2">
                  <svg className="animate-spin h-6 w-6 text-[#E8420A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-xs text-gray-500 font-medium">Đang tải ảnh lên...</span>
                </div>
              ) : (
                <>
                  <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs text-gray-600 font-medium">
                    Kéo thả ảnh vào đây hoặc <span className="text-[#E8420A] underline hover:text-[#C4350A]">chọn từ thiết bị</span>
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">Hỗ trợ PNG, JPG, JPEG, GIF...</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowManualInput(true)
                    }}
                    className="text-[11px] text-gray-500 hover:text-gray-700 font-semibold underline mt-3 bg-transparent border-none p-0 cursor-pointer"
                  >
                    Nhập URL thủ công
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </Field>
  )
}

export default function BrandCategoryManagementPage() {
  const [tab, setTab] = useState('brands') // 'brands' | 'categories'

  const [brands, setBrands]         = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [search, setSearch]         = useState('')

  const [panel, setPanel]           = useState(null) // 'add' | 'edit' | null
  const [editingId, setEditingId]   = useState(null)
  const [brandForm, setBrandForm]       = useState(EMPTY_BRAND_FORM)
  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving]         = useState(false)
  const [deleteId, setDeleteId]     = useState(null)
  const [removing, setRemoving]     = useState(false)
  const [toast, setToast]           = useState(null)

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 3200) }

  function loadAll() {
    setLoading(true)
    Promise.all([
      apiFetch('/api/manager/brands').then(data => setBrands(data.map(normalizeBrand))),
      apiFetch('/api/manager/categories').then(data => setCategories(data.map(normalizeCategory))),
    ])
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadAll() }, [])

  const items = tab === 'brands' ? brands : categories
  const filtered = items.filter(x => !search || x.name.toLowerCase().includes(search.toLowerCase()))

  const inp = INP_CLASS

  function openAdd() {
    setBrandForm(EMPTY_BRAND_FORM)
    setCategoryForm(EMPTY_CATEGORY_FORM)
    setFormErrors({})
    setPanel('add')
  }

  function openEdit(item) {
    setEditingId(item.id)
    if (tab === 'brands') setBrandForm({ name: item.name, logoUrl: item.logoUrl, description: item.description })
    else setCategoryForm({ name: item.name, imageUrl: item.imageUrl })
    setFormErrors({})
    setPanel('edit')
  }

  function closePanel() { setPanel(null); setEditingId(null) }

  function validate() {
    const errs = {}
    if (tab === 'brands') {
      if (!brandForm.name.trim()) errs.name = 'Vui lòng nhập tên thương hiệu'
      if (!brandForm.logoUrl.trim()) errs.logoUrl = 'Vui lòng chọn hoặc tải ảnh logo'
      if (!brandForm.description.trim()) errs.description = 'Vui lòng nhập mô tả'
    } else {
      if (!categoryForm.name.trim()) errs.name = 'Vui lòng nhập tên danh mục'
      if (!categoryForm.imageUrl.trim()) errs.imageUrl = 'Vui lòng chọn hoặc tải ảnh danh mục'
    }
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    const isBrand = tab === 'brands'
    const base = isBrand ? '/api/manager/brands' : '/api/manager/categories'
    const payload = isBrand
      ? { name: brandForm.name.trim(), logoUrl: brandForm.logoUrl.trim(), description: brandForm.description.trim() }
      : { name: categoryForm.name.trim(), imageUrl: categoryForm.imageUrl.trim() }

    setSaving(true)
    try {
      if (panel === 'add') {
        const dto = await apiFetch(base, { method: 'POST', body: JSON.stringify(payload) })
        if (isBrand) setBrands(p => [normalizeBrand(dto), ...p])
        else setCategories(p => [normalizeCategory(dto), ...p])
        showToast(isBrand ? 'Đã thêm thương hiệu' : 'Đã thêm danh mục')
      } else {
        const dto = await apiFetch(`${base}/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) })
        if (isBrand) setBrands(p => p.map(x => x.id === editingId ? normalizeBrand(dto) : x))
        else setCategories(p => p.map(x => x.id === editingId ? normalizeCategory(dto) : x))
        showToast(isBrand ? 'Đã cập nhật thương hiệu' : 'Đã cập nhật danh mục')
      }
      closePanel()
    } catch (err) {
      showToast(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(id) {
    const isBrand = tab === 'brands'
    const base = isBrand ? '/api/manager/brands' : '/api/manager/categories'
    setRemoving(true)
    try {
      await apiFetch(`${base}/${id}`, { method: 'DELETE' })
      if (isBrand) setBrands(p => p.filter(x => x.id !== id))
      else setCategories(p => p.filter(x => x.id !== id))
      setDeleteId(null)
      showToast(isBrand ? 'Đã xóa thương hiệu' : 'Đã xóa danh mục')
    } catch (err) {
      showToast(err.message)
    } finally {
      setRemoving(false)
    }
  }

  const target = items.find(x => x.id === deleteId)

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 px-8 py-7 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thương hiệu &amp; Danh mục</h1>
            <p className="text-sm text-gray-500 mt-0.5">Quản lý thương hiệu và danh mục sản phẩm</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-[#E8420A] hover:bg-[#C4350A] text-white font-semibold py-2.5 px-4 rounded text-sm transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            {tab === 'brands' ? 'Thêm thương hiệu' : 'Thêm danh mục'}
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-gray-200">
          <button onClick={() => { setTab('brands'); setSearch('') }} className={`px-4 py-2.5 text-sm font-semibold cursor-pointer border-b-2 -mb-px transition-colors ${tab === 'brands' ? 'border-[#E8420A] text-[#E8420A]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Thương hiệu ({brands.length})
          </button>
          <button onClick={() => { setTab('categories'); setSearch('') }} className={`px-4 py-2.5 text-sm font-semibold cursor-pointer border-b-2 -mb-px transition-colors ${tab === 'categories' ? 'border-[#E8420A] text-[#E8420A]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Danh mục ({categories.length})
          </button>
        </div>

        <div className="bg-white rounded border border-gray-200 px-5 py-3.5 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]" />
          </div>
          <span className="ml-auto text-xs text-gray-400 shrink-0">{filtered.length} / {items.length}</span>
        </div>

        {loading && <div className="bg-white rounded border border-gray-200 py-16 text-center text-gray-400 text-sm">Đang tải dữ liệu...</div>}
        {error && !loading && <div className="bg-red-50 border border-red-200 rounded px-5 py-4 text-red-600 text-sm">{error}</div>}

        {!loading && !error && (
          <div className="bg-white rounded border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {(tab === 'brands' ? ['Ảnh', 'Tên thương hiệu', 'Mô tả', ''] : ['Ảnh', 'Tên danh mục', '']).map((h, i) => (
                    <th key={i} className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wide text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0
                  ? <tr><td colSpan={4} className="text-center py-12 text-gray-400">Không tìm thấy dữ liệu nào</td></tr>
                  : filtered.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition-colors group">
                      <td className="px-4 py-3">
                        {(tab === 'brands' ? item.logoUrl : item.imageUrl)
                          ? <img src={tab === 'brands' ? item.logoUrl : item.imageUrl} alt={item.name} className="w-10 h-10 rounded object-cover border border-gray-100" />
                          : <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-300 text-[10px]">N/A</div>}
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-800">{item.name || '—'}</td>
                      {tab === 'brands' && <td className="px-4 py-4 text-gray-500 max-w-sm truncate">{item.description || '—'}</td>}
                      <td className="px-4 py-4">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(item)} className="text-xs text-[#E8420A] hover:text-[#C4350A] font-medium cursor-pointer px-2 py-1 rounded hover:bg-orange-50">
                            Sửa →
                          </button>
                          <button onClick={() => setDeleteId(item.id)} className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer px-2 py-1 rounded hover:bg-red-50">
                            Xóa
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

      {panel && <div className="fixed inset-0 bg-black/30 z-40" onClick={closePanel} />}

      {panel && (
        <div className="fixed top-0 right-0 h-full w-[440px] bg-white shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {panel === 'add' ? (tab === 'brands' ? 'Thêm thương hiệu mới' : 'Thêm danh mục mới') : (tab === 'brands' ? 'Sửa thương hiệu' : 'Sửa danh mục')}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Điền đầy đủ thông tin bên dưới</p>
            </div>
            <button onClick={closePanel} className="p-2 hover:bg-gray-100 rounded cursor-pointer"><svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {tab === 'brands' ? (
              <>
                <Field label="Tên thương hiệu *" error={formErrors.name}>
                  <input value={brandForm.name} onChange={e => setBrandForm(f => ({ ...f, name: e.target.value }))} placeholder="Apple" className={inp} />
                </Field>
                <ImageUploader
                  label="Logo thương hiệu *"
                  value={brandForm.logoUrl}
                  onChange={url => setBrandForm(f => ({ ...f, logoUrl: url }))}
                  error={formErrors.logoUrl}
                />
                <Field label="Mô tả *" error={formErrors.description}>
                  <textarea value={brandForm.description} onChange={e => setBrandForm(f => ({ ...f, description: e.target.value }))} rows={3} className={inp} />
                </Field>
              </>
            ) : (
              <>
                <Field label="Tên danh mục *" error={formErrors.name}>
                  <input value={categoryForm.name} onChange={e => setCategoryForm(f => ({ ...f, name: e.target.value }))} placeholder="Điện thoại" className={inp} />
                </Field>
                <ImageUploader
                  label="Ảnh danh mục *"
                  value={categoryForm.imageUrl}
                  onChange={url => setCategoryForm(f => ({ ...f, imageUrl: url }))}
                  error={formErrors.imageUrl}
                />
              </>
            )}
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            <button onClick={closePanel} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Huỷ</button>
            <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 bg-[#E8420A] hover:bg-[#C4350A] disabled:opacity-60 text-white rounded text-sm font-semibold cursor-pointer transition-colors">
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      )}

      {deleteId && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" />
          <div className="fixed inset-0 flex items-center justify-center z-[60]">
            <div className="bg-white rounded shadow-2xl w-[380px] p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
              <h3 className="text-lg font-bold text-gray-900 text-center">{tab === 'brands' ? 'Xóa thương hiệu?' : 'Xóa danh mục?'}</h3>
              <p className="text-sm text-gray-500 text-center mt-2">
                Bạn có chắc muốn xóa{target ? ` "${target.name}"` : ''}? Hành động này không thể hoàn tác
              </p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setDeleteId(null)} disabled={removing} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60 cursor-pointer">Hủy</button>
                <button onClick={() => handleRemove(deleteId)} disabled={removing} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded text-sm font-semibold cursor-pointer transition-colors">
                  {removing ? 'Đang xóa...' : 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-xl z-[70]">{toast}</div>}
    </div>
  )
}
