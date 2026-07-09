import { useState, useEffect } from 'react'
import { apiFetch } from '../../../services/api'

function normalizeSupplier(dto) {
  return {
    id:                    dto.id,
    name:                  dto.name || '',
    phone:                 dto.phone || '',
    email:                 dto.email || '',
    address:               dto.address || '',
    hasActiveSupplyOrders: !!dto.hasActiveSupplyOrders,
  }
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

const EMPTY_FORM = { name: '', phone: '', email: '', address: '' }

export default function SupplierManagementPage() {
  const [suppliers, setSuppliers]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [search, setSearch]         = useState('')
  const [panel, setPanel]           = useState(null)
  const [editingId, setEditingId]   = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving]         = useState(false)
  const [deleteId, setDeleteId]     = useState(null)
  const [removing, setRemoving]     = useState(false)
  const [toast, setToast]           = useState(null)

  useEffect(() => {
    apiFetch('/api/manager/suppliers')
      .then(data => setSuppliers(data.map(normalizeSupplier)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = suppliers.filter(s => {
    const q = search.toLowerCase()
    return !q || s.name.toLowerCase().includes(q) || s.phone.includes(q) || s.email.toLowerCase().includes(q)
  })

  const inp = 'w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]'

  const editingSupplier = editingId !== null ? suppliers.find(s => s.id === editingId) : null
  const editLocked = !!editingSupplier?.hasActiveSupplyOrders

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 3200) }
  function openAdd()      { setForm(EMPTY_FORM); setFormErrors({}); setPanel('add') }
  function openEdit(s)    { setEditingId(s.id); setForm({ name: s.name, phone: s.phone, email: s.email, address: s.address }); setFormErrors({}); setPanel('edit') }
  function closePanel()   { setPanel(null); setEditingId(null) }

  async function handleAdd() {
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim() || !form.address.trim()) {
      setFormErrors({
        name:    !form.name.trim()    ? 'Please fill in all required fields' : undefined,
        phone:   !form.phone.trim()   ? 'Please fill in all required fields' : undefined,
        email:   !form.email.trim()   ? 'Please fill in all required fields' : undefined,
        address: !form.address.trim() ? 'Please fill in all required fields' : undefined,
      })
      showToast('Please fill in all required fields')
      return
    }

    const payload = {
      name:    form.name.trim(),
      phone:   form.phone.trim(),
      email:   form.email.trim(),
      address: form.address.trim(),
    }

    setSaving(true)
    try {
      const dto = await apiFetch('/api/manager/suppliers', { method: 'POST', body: JSON.stringify(payload) })
      setSuppliers(p => [normalizeSupplier(dto), ...p])
      closePanel()
      showToast('Supplier added successfully')
    } catch (err) {
      showToast(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveEdit() {
    const payload = {
      name:    form.name.trim(),
      phone:   form.phone.trim(),
      email:   form.email.trim(),
      address: form.address.trim(),
    }

    setSaving(true)
    try {
      const dto = await apiFetch(`/api/manager/suppliers/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) })
      setSuppliers(p => p.map(s => s.id === editingId ? normalizeSupplier(dto) : s))
      closePanel()
      showToast('Supplier updated successfully')
    } catch (err) {
      showToast(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(id) {
    setRemoving(true)
    try {
      await apiFetch(`/api/manager/suppliers/${id}`, { method: 'DELETE' })
      setSuppliers(p => p.filter(s => s.id !== id))
      setDeleteId(null)
      showToast('Supplier removed successfully')
    } catch (err) {
      showToast(err.message)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 px-8 py-7 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nhà cung cấp</h1>
            <p className="text-sm text-gray-500 mt-0.5">Thêm mới và quản lý nhà cung cấp</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-[#E8420A] hover:bg-[#C4350A] text-white font-semibold py-2.5 px-4 rounded text-sm transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Thêm nhà cung cấp
          </button>
        </div>

        <div className="bg-white rounded border border-gray-200 px-5 py-3.5 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tên, SĐT, email..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]" />
          </div>
          <span className="ml-auto text-xs text-gray-400 shrink-0">{filtered.length} / {suppliers.length} nhà cung cấp</span>
        </div>

        {loading && <div className="bg-white rounded border border-gray-200 py-16 text-center text-gray-400 text-sm">Đang tải dữ liệu...</div>}
        {error && !loading && <div className="bg-red-50 border border-red-200 rounded px-5 py-4 text-red-600 text-sm">{error}</div>}

        {!loading && !error && (
          <div className="bg-white rounded border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Tên nhà cung cấp', 'Số điện thoại', 'Email', 'Địa chỉ', ''].map((h, i) => (
                    <th key={i} className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wide text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0
                  ? <tr><td colSpan={5} className="text-center py-12 text-gray-400">Không tìm thấy nhà cung cấp nào</td></tr>
                  : filtered.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50/70 transition-colors group">
                      <td className="px-4 py-4 font-semibold text-gray-800">
                        {s.name || '—'}
                        {s.hasActiveSupplyOrders && (
                          <span className="ml-2 inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 align-middle">Đang có đơn hàng</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-gray-600">{s.phone || '—'}</td>
                      <td className="px-4 py-4 text-gray-600">{s.email || '—'}</td>
                      <td className="px-4 py-4 text-gray-500">{s.address || '—'}</td>
                      <td className="px-4 py-4">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(s)} className="text-xs text-[#E8420A] hover:text-[#C4350A] font-medium cursor-pointer px-2 py-1 rounded hover:bg-orange-50">
                            Sửa →
                          </button>
                          <button onClick={() => setDeleteId(s.id)} className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer px-2 py-1 rounded hover:bg-red-50">
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

      {panel === 'add' && (
        <div className="fixed top-0 right-0 h-full w-[440px] bg-white shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div><h2 className="text-lg font-bold text-gray-900">Thêm nhà cung cấp mới</h2><p className="text-xs text-gray-400 mt-0.5">Điền đầy đủ thông tin bên dưới</p></div>
            <button onClick={closePanel} className="p-2 hover:bg-gray-100 rounded cursor-pointer"><svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <Field label="Tên nhà cung cấp *" error={formErrors.name}>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Tech Corp" className={inp} />
            </Field>
            <Field label="Số điện thoại *" error={formErrors.phone}>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0901234567" className={inp} />
            </Field>
            <Field label="Email *" error={formErrors.email}>
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="contact@techcorp.com" type="email" className={inp} />
            </Field>
            <Field label="Địa chỉ *" error={formErrors.address}>
              <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Tech Street" className={inp} />
            </Field>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            <button onClick={closePanel} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Huỷ</button>
            <button onClick={handleAdd} disabled={saving} className="flex-1 py-2.5 bg-[#E8420A] hover:bg-[#C4350A] disabled:opacity-60 text-white rounded text-sm font-semibold cursor-pointer transition-colors">
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      )}

      {panel === 'edit' && (
        <div className="fixed top-0 right-0 h-full w-[440px] bg-white shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div><h2 className="text-lg font-bold text-gray-900">Sửa nhà cung cấp</h2><p className="text-xs text-gray-400 mt-0.5">Cập nhật thông tin bên dưới</p></div>
            <button onClick={closePanel} className="p-2 hover:bg-gray-100 rounded cursor-pointer"><svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {editLocked && (
              <div className="bg-amber-50 border border-amber-200 rounded px-3 py-2.5 text-xs text-amber-700 font-medium">
                Some fields cannot be edited while there are Supply Orders
              </div>
            )}
            <Field label="Tên nhà cung cấp *" error={formErrors.name}>
              <input value={form.name} disabled={editLocked} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Tech Corp" className={`${inp} disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`} />
            </Field>
            <Field label="Số điện thoại *" error={formErrors.phone}>
              <input value={form.phone} disabled={editLocked} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0901234567" className={`${inp} disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`} />
            </Field>
            <Field label="Email *" error={formErrors.email}>
              <input value={form.email} disabled={editLocked} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="contact@techcorp.com" type="email" className={`${inp} disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`} />
            </Field>
            <Field label="Địa chỉ *" error={formErrors.address}>
              <input value={form.address} disabled={editLocked} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Tech Street" className={`${inp} disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`} />
            </Field>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            <button onClick={closePanel} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Huỷ</button>
            <button onClick={handleSaveEdit} disabled={saving} className="flex-1 py-2.5 bg-[#E8420A] hover:bg-[#C4350A] disabled:opacity-60 text-white rounded text-sm font-semibold cursor-pointer transition-colors">
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      )}

      {deleteId && (() => {
        const target = suppliers.find(s => s.id === deleteId)
        return (
          <>
            <div className="fixed inset-0 bg-black/50 z-[60]" />
            <div className="fixed inset-0 flex items-center justify-center z-[60]">
              <div className="bg-white rounded shadow-2xl w-[380px] p-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
                <h3 className="text-lg font-bold text-gray-900 text-center">Xóa nhà cung cấp?</h3>
                <p className="text-sm text-gray-500 text-center mt-2">
                  Are you sure you want to remove this supplier{target ? ` "${target.name}"` : ''}? This action cannot be undone
                </p>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setDeleteId(null)} disabled={removing} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60 cursor-pointer">Cancel</button>
                  <button onClick={() => handleRemove(deleteId)} disabled={removing} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded text-sm font-semibold cursor-pointer transition-colors">
                    {removing ? 'Đang xóa...' : 'Confirm'}
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
