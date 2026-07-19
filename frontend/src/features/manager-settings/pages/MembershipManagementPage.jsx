import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../../../services/api'
import Field from '../components/Field'

const TIER_OPTIONS = ['STANDARD', 'BRONZE', 'SILVER', 'GOLD', 'DIAMOND']
const TIER_LABELS = { STANDARD: 'Thành viên', BRONZE: 'Đồng', SILVER: 'Bạc', GOLD: 'Vàng', DIAMOND: 'Kim Cương' }

function normalizeMembership(dto) {
  return {
    id: dto.id,
    tier: dto.tier,
    minSpending: dto.minSpending,
    maxSpending: dto.maxSpending,
    discountPercentage: dto.benefit?.discountPercentage ?? 0,
    freeShipping: !!dto.benefit?.freeShipping,
    description: dto.benefit?.description || '',
    customersIds: dto.customersIds || [],
  }
}

function formatCurrency(value) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

const EMPTY_FORM = { tier: 'STANDARD', minSpending: '', maxSpending: '', discountPercentage: '', freeShipping: false, description: '' }

export default function MembershipManagementPage() {
  const [items, setItems]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  const [panel, setPanel]           = useState(null) // 'add' | 'edit' | null
  const [editingId, setEditingId]   = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving]         = useState(false)
  const [deleteId, setDeleteId]     = useState(null)
  const [removing, setRemoving]     = useState(false)
  const [toast, setToast]           = useState(null)

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 3200) }

  function loadAll() {
    setLoading(true)
    apiFetch('/api/manager/memberships')
      .then(data => setItems(data.map(normalizeMembership).sort((a, b) => (a.minSpending || 0) - (b.minSpending || 0))))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadAll() }, [])

  const inp = 'w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]'

  function openAdd() { setForm(EMPTY_FORM); setFormErrors({}); setPanel('add') }
  function openEdit(item) {
    setEditingId(item.id)
    setForm({
      tier: item.tier,
      minSpending: item.minSpending ?? '',
      maxSpending: item.maxSpending ?? '',
      discountPercentage: item.discountPercentage ?? '',
      freeShipping: item.freeShipping,
      description: item.description,
    })
    setFormErrors({})
    setPanel('edit')
  }
  function closePanel() { setPanel(null); setEditingId(null) }

  function validate() {
    const errs = {}
    if (form.discountPercentage === '' || Number(form.discountPercentage) < 0 || Number(form.discountPercentage) > 100) {
      errs.discountPercentage = 'Vui lòng nhập % giảm giá từ 0 đến 100'
    }
    if (!form.description.trim()) errs.description = 'Vui lòng nhập mô tả quyền lợi'
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    const payload = {
      tier: form.tier,
      minSpending: form.minSpending === '' ? null : Number(form.minSpending),
      maxSpending: form.maxSpending === '' ? null : Number(form.maxSpending),
      benefit: {
        discountPercentage: Number(form.discountPercentage),
        freeShipping: form.freeShipping,
        description: form.description.trim(),
      },
    }

    setSaving(true)
    try {
      if (panel === 'add') {
        const dto = await apiFetch('/api/manager/memberships', { method: 'POST', body: JSON.stringify(payload) })
        setItems(p => [...p, normalizeMembership(dto)].sort((a, b) => (a.minSpending || 0) - (b.minSpending || 0)))
        showToast('Đã thêm hạng thành viên')
      } else {
        const dto = await apiFetch(`/api/manager/memberships/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) })
        setItems(p => p.map(x => x.id === editingId ? normalizeMembership(dto) : x))
        showToast('Đã cập nhật hạng thành viên')
      }
      closePanel()
    } catch (err) {
      showToast(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(id) {
    setRemoving(true)
    try {
      await apiFetch(`/api/manager/memberships/${id}`, { method: 'DELETE' })
      setItems(p => p.filter(x => x.id !== id))
      setDeleteId(null)
      showToast('Đã xóa hạng thành viên')
    } catch (err) {
      showToast(err.message)
    } finally {
      setRemoving(false)
    }
  }

  const target = items.find(x => x.id === deleteId)
  const usedTiers = new Set(items.map(x => x.tier))
  const availableTiers = panel === 'add' ? TIER_OPTIONS.filter(t => !usedTiers.has(t)) : TIER_OPTIONS

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 px-8 py-7 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hạng thành viên</h1>
            <p className="text-sm text-gray-500 mt-0.5">Cấu hình ngưỡng chi tiêu và quyền lợi cho từng hạng thành viên</p>
          </div>
          {availableTiers.length > 0 && (
            <button onClick={openAdd} className="flex items-center gap-2 bg-[#E8420A] hover:bg-[#C4350A] text-white font-semibold py-2.5 px-4 rounded text-sm transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              Thêm hạng
            </button>
          )}
        </div>

        {loading && <div className="bg-white rounded border border-gray-200 py-16 text-center text-gray-400 text-sm">Đang tải dữ liệu...</div>}
        {error && !loading && <div className="bg-red-50 border border-red-200 rounded px-5 py-4 text-red-600 text-sm">{error}</div>}

        {!loading && !error && (
          <>
            {/* Hàng thẻ Hạng thành viên thiết kế Gradient cao cấp */}
            <div className="grid grid-cols-5 gap-4">
              {TIER_OPTIONS.map(tier => {
                const item = items.find(x => x.tier === tier)
                const count = item ? (item.customersIds?.length || 0) : 0
                
                let cardBg = ""
                let iconColor = ""
                if (tier === 'STANDARD') {
                  cardBg = "from-slate-500 to-slate-700"
                  iconColor = "text-slate-300"
                } else if (tier === 'BRONZE') {
                  cardBg = "from-amber-600 to-amber-800"
                  iconColor = "text-amber-300"
                } else if (tier === 'SILVER') {
                  cardBg = "from-zinc-400 to-zinc-600"
                  iconColor = "text-zinc-200"
                } else if (tier === 'GOLD') {
                  cardBg = "from-yellow-500 via-amber-500 to-yellow-600"
                  iconColor = "text-yellow-200"
                } else if (tier === 'DIAMOND') {
                  cardBg = "from-indigo-600 via-purple-600 to-pink-600"
                  iconColor = "text-pink-200"
                }

                return (
                  <div
                    key={tier}
                    className={`relative rounded-xl p-5 bg-gradient-to-br ${cardBg} text-white shadow-md transition-all hover:shadow-lg ${
                      !item ? 'opacity-50 border border-dashed border-gray-300' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider opacity-90">{TIER_LABELS[tier]}</span>
                      <svg className={`w-5 h-5 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a.75.75 0 00-.708.522L4.63 7H3a1 1 0 010-2h.63l.708-2.122a1.75 1.75 0 013.364 0l.708 2.122H9a1 1 0 010 2H7.369l-.93-2.788a.25.25 0 00-.236-.174zM16.267 3.455a.75.75 0 00-.708.522L14.63 7H13a1 1 0 010-2h.63l.708-2.122a1.75 1.75 0 013.364 0l.708 2.122H19a1 1 0 010 2h-1.631l-.93-2.788a.25.25 0 00-.236-.174zM2 9a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zm1 4a2 2 0 00-2 2v1a2 2 0 002 2h14a2 2 0 002-2v-1a2 2 0 00-2-2H3z" clipRule="evenodd" />
                      </svg>
                    </div>

                    {item ? (
                      <div className="mt-4 space-y-2">
                        <div>
                          <div className="text-[10px] opacity-75 font-medium uppercase">Ngưỡng chi tiêu</div>
                          <div className="text-sm font-bold truncate">
                            {formatCurrency(item.minSpending)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] opacity-75 font-medium uppercase">Ưu đãi</div>
                          <div className="text-xs font-semibold">
                            Giảm {item.discountPercentage}% {item.freeShipping && '+ Freeship'}
                          </div>
                        </div>
                        <div className="pt-2 border-t border-white/20 mt-2 flex items-center justify-between">
                          <span className="text-[10px] opacity-75 font-medium uppercase">Hội viên</span>
                          <Link
                            to="/customers-management"
                            state={{ prefilledTier: tier }}
                            className="text-xs font-bold bg-white/20 hover:bg-white/35 px-2 py-0.5 rounded transition-colors text-white"
                            title="Click để xem danh sách hội viên"
                          >
                            {count} hội viên
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-8 text-center text-xs opacity-75 font-semibold py-4">
                        Chưa cấu hình hạng
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="bg-white rounded border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Hạng', 'Ngưỡng chi tiêu', 'Giảm giá', 'Miễn ship', 'Mô tả quyền lợi', 'Thao tác'].map((h, i) => (
                      <th key={i} className={`px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wide ${h === 'Thao tác' ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.length === 0
                    ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">Chưa có hạng thành viên nào</td></tr>
                    : items.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50/70 transition-colors group">
                        <td className="px-4 py-4 font-semibold text-gray-800">{TIER_LABELS[item.tier] || item.tier}</td>
                        <td className="px-4 py-4 text-gray-600">
                          {formatCurrency(item.minSpending)} – {item.maxSpending ? formatCurrency(item.maxSpending) : 'không giới hạn'}
                        </td>
                        <td className="px-4 py-4 text-gray-600">{item.discountPercentage}%</td>
                        <td className="px-4 py-4">
                          {item.freeShipping
                            ? <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Có</span>
                            : <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">Không</span>}
                        </td>
                        <td className="px-4 py-4 text-gray-500 max-w-xs truncate">{item.description || '—'}</td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEdit(item)}
                              className="p-1.5 bg-gray-50 hover:bg-orange-50 text-gray-500 hover:text-[#E8420A] rounded transition-colors cursor-pointer border-none"
                              title="Chỉnh sửa"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteId(item.id)}
                              className="p-1.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors cursor-pointer border-none"
                              title="Xóa"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {panel && <div className="fixed inset-0 bg-black/30 z-40" onClick={closePanel} />}

      {panel && (
        <div className="fixed top-0 right-0 h-full w-[440px] bg-white shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{panel === 'add' ? 'Thêm hạng thành viên' : 'Sửa hạng thành viên'}</h2>
              <p className="text-xs text-gray-400 mt-0.5">Điền đầy đủ thông tin bên dưới</p>
            </div>
            <button onClick={closePanel} className="p-2 hover:bg-gray-100 rounded cursor-pointer"><svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <Field label="Hạng *">
              <select value={form.tier} disabled={panel === 'edit'} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))} className={`${inp} disabled:bg-gray-100 disabled:text-gray-400`}>
                {availableTiers.map(t => <option key={t} value={t}>{TIER_LABELS[t]}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Chi tiêu tối thiểu (VND)">
                <input type="number" value={form.minSpending} onChange={e => setForm(f => ({ ...f, minSpending: e.target.value }))} placeholder="0" className={inp} />
              </Field>
              <Field label="Chi tiêu tối đa (VND)">
                <input type="number" value={form.maxSpending} onChange={e => setForm(f => ({ ...f, maxSpending: e.target.value }))} placeholder="Không giới hạn" className={inp} />
              </Field>
            </div>
            <Field label="Giảm giá (%) *" error={formErrors.discountPercentage}>
              <input type="number" value={form.discountPercentage} onChange={e => setForm(f => ({ ...f, discountPercentage: e.target.value }))} className={inp} />
            </Field>
            <Field label="Mô tả quyền lợi *" error={formErrors.description}>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className={inp} />
            </Field>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.freeShipping} onChange={e => setForm(f => ({ ...f, freeShipping: e.target.checked }))} className="w-4 h-4" />
              Miễn phí vận chuyển
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

      {deleteId && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" />
          <div className="fixed inset-0 flex items-center justify-center z-[60]">
            <div className="bg-white rounded shadow-2xl w-[380px] p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
              <h3 className="text-lg font-bold text-gray-900 text-center">Xóa hạng thành viên?</h3>
              <p className="text-sm text-gray-500 text-center mt-2">
                Bạn có chắc muốn xóa hạng{target ? ` "${TIER_LABELS[target.tier] || target.tier}"` : ''}? Hành động này không thể hoàn tác
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
