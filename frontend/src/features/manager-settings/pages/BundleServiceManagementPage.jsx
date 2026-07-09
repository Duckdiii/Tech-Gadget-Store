import { useState, useEffect } from 'react'
import { apiFetch } from '../../../services/api'

const TYPE_LABELS = { WARRANTY: 'Bảo hành', SCREEN_PROTECTION: 'Dán màn hình' }

function normalizeBundleService(dto) {
  return {
    id: dto.id,
    name: dto.name || '',
    type: dto.type || 'WARRANTY',
    description: dto.description || '',
    price: dto.price,
    durationMonths: dto.durationMonths,
    active: !!dto.active,
  }
}

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

const EMPTY_FORM = { name: '', type: 'WARRANTY', description: '', price: '', durationMonths: '', active: true }

export default function BundleServiceManagementPage() {
  const [items, setItems]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [search, setSearch]         = useState('')

  const [panel, setPanel]           = useState(null) // 'add' | 'edit' | null
  const [editingId, setEditingId]   = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving]         = useState(false)
  const [deactivateId, setDeactivateId] = useState(null)
  const [deactivating, setDeactivating] = useState(false)
  const [toast, setToast]           = useState(null)

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 3200) }

  function loadAll() {
    setLoading(true)
    apiFetch('/api/manager/bundle-services')
      .then(data => setItems(data.map(normalizeBundleService)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadAll() }, [])

  const filtered = items.filter(x => !search || x.name.toLowerCase().includes(search.toLowerCase()))
  const inp = 'w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]'

  function openAdd() { setForm(EMPTY_FORM); setFormErrors({}); setPanel('add') }
  function openEdit(item) {
    setEditingId(item.id)
    setForm({
      name: item.name, type: item.type, description: item.description,
      price: item.price ?? '', durationMonths: item.durationMonths ?? '', active: item.active,
    })
    setFormErrors({})
    setPanel('edit')
  }
  function closePanel() { setPanel(null); setEditingId(null) }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Vui lòng nhập tên dịch vụ'
    if (!form.description.trim()) errs.description = 'Vui lòng nhập mô tả'
    if (form.price === '' || Number(form.price) < 0) errs.price = 'Vui lòng nhập giá hợp lệ'
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    const payload = {
      name: form.name.trim(),
      type: form.type,
      description: form.description.trim(),
      price: Number(form.price),
      durationMonths: form.durationMonths === '' ? null : Number(form.durationMonths),
      active: form.active,
    }

    setSaving(true)
    try {
      if (panel === 'add') {
        const dto = await apiFetch('/api/manager/bundle-services', { method: 'POST', body: JSON.stringify(payload) })
        setItems(p => [normalizeBundleService(dto), ...p])
        showToast('Đã thêm dịch vụ đi kèm')
      } else {
        const dto = await apiFetch(`/api/manager/bundle-services/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) })
        setItems(p => p.map(x => x.id === editingId ? normalizeBundleService(dto) : x))
        showToast('Đã cập nhật dịch vụ đi kèm')
      }
      closePanel()
    } catch (err) {
      showToast(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate(id) {
    setDeactivating(true)
    try {
      await apiFetch(`/api/manager/bundle-services/${id}`, { method: 'DELETE' })
      setItems(p => p.map(x => x.id === id ? { ...x, active: false } : x))
      setDeactivateId(null)
      showToast('Đã ngừng dịch vụ đi kèm')
    } catch (err) {
      showToast(err.message)
    } finally {
      setDeactivating(false)
    }
  }

  const target = items.find(x => x.id === deactivateId)

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 px-8 py-7 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dịch vụ đi kèm</h1>
            <p className="text-sm text-gray-500 mt-0.5">Quản lý gói bảo hành, dán màn hình và các dịch vụ đi kèm khác</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-[#E8420A] hover:bg-[#C4350A] text-white font-semibold py-2.5 px-4 rounded text-sm transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Thêm dịch vụ
          </button>
        </div>

        <div className="bg-white rounded border border-gray-200 px-5 py-3.5 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tên dịch vụ..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]" />
          </div>
          <span className="ml-auto text-xs text-gray-400 shrink-0">{filtered.length} / {items.length} dịch vụ</span>
        </div>

        {loading && <div className="bg-white rounded border border-gray-200 py-16 text-center text-gray-400 text-sm">Đang tải dữ liệu...</div>}
        {error && !loading && <div className="bg-red-50 border border-red-200 rounded px-5 py-4 text-red-600 text-sm">{error}</div>}

        {!loading && !error && (
          <div className="bg-white rounded border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Tên dịch vụ', 'Loại', 'Giá', 'Thời hạn', 'Trạng thái', ''].map((h, i) => (
                    <th key={i} className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wide text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0
                  ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">Không tìm thấy dịch vụ nào</td></tr>
                  : filtered.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition-colors group">
                      <td className="px-4 py-4 font-semibold text-gray-800">{item.name || '—'}</td>
                      <td className="px-4 py-4 text-gray-600">{TYPE_LABELS[item.type] || item.type}</td>
                      <td className="px-4 py-4 text-gray-600">{formatCurrency(item.price)}</td>
                      <td className="px-4 py-4 text-gray-500">{item.durationMonths ? `${item.durationMonths} tháng` : '—'}</td>
                      <td className="px-4 py-4">
                        {item.active
                          ? <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Đang hoạt động</span>
                          : <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">Đã ngừng</span>}
                      </td>
                      <td className="px-4 py-4">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(item)} className="text-xs text-[#E8420A] hover:text-[#C4350A] font-medium cursor-pointer px-2 py-1 rounded hover:bg-orange-50">
                            Sửa →
                          </button>
                          {item.active && (
                            <button onClick={() => setDeactivateId(item.id)} className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer px-2 py-1 rounded hover:bg-red-50">
                              Ngừng
                            </button>
                          )}
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
              <h2 className="text-lg font-bold text-gray-900">{panel === 'add' ? 'Thêm dịch vụ mới' : 'Sửa dịch vụ'}</h2>
              <p className="text-xs text-gray-400 mt-0.5">Điền đầy đủ thông tin bên dưới</p>
            </div>
            <button onClick={closePanel} className="p-2 hover:bg-gray-100 rounded cursor-pointer"><svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <Field label="Tên dịch vụ *" error={formErrors.name}>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Bảo hành 12 tháng" className={inp} />
            </Field>
            <Field label="Loại dịch vụ *">
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inp}>
                <option value="WARRANTY">Bảo hành</option>
                <option value="SCREEN_PROTECTION">Dán màn hình</option>
              </select>
            </Field>
            <Field label="Mô tả *" error={formErrors.description}>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className={inp} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Giá (VND) *" error={formErrors.price}>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className={inp} />
              </Field>
              <Field label="Thời hạn (tháng)">
                <input type="number" value={form.durationMonths} onChange={e => setForm(f => ({ ...f, durationMonths: e.target.value }))} className={inp} />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="w-4 h-4" />
              Đang hoạt động (hiển thị cho khách hàng chọn)
            </label>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            <button onClick={closePanel} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Huỷ</button>
            <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 bg-[#E8420A] hover:bg-[#C4350A] disabled:opacity-60 text-white rounded text-sm font-semibold cursor-pointer transition-colors">
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      )}

      {deactivateId && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" />
          <div className="fixed inset-0 flex items-center justify-center z-[60]">
            <div className="bg-white rounded shadow-2xl w-[380px] p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
              <h3 className="text-lg font-bold text-gray-900 text-center">Ngừng dịch vụ đi kèm?</h3>
              <p className="text-sm text-gray-500 text-center mt-2">
                Dịch vụ{target ? ` "${target.name}"` : ''} sẽ không còn hiển thị cho khách hàng chọn. Bạn có thể bật lại bất cứ lúc nào bằng cách sửa và tick "Đang hoạt động"
              </p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setDeactivateId(null)} disabled={deactivating} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60 cursor-pointer">Hủy</button>
                <button onClick={() => handleDeactivate(deactivateId)} disabled={deactivating} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded text-sm font-semibold cursor-pointer transition-colors">
                  {deactivating ? 'Đang xử lý...' : 'Xác nhận'}
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
