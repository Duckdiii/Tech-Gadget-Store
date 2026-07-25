import { useState, useMemo } from 'react'
import { useBundleService } from '../hooks/useBundleService'
import Field from '../components/Field'

const TYPE_LABELS = { WARRANTY: 'Bảo hành', SCREEN_PROTECTION: 'Dán màn hình' }

const vndCurrencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

function formatCurrency(value) {
  if (value === null || value === undefined) return '—'
  return vndCurrencyFormatter.format(value)
}

export default function BundleServiceManagementPage() {
  const {
    items,
    loading,
    error,
    search,
    setSearch,
    panel,
    form,
    setForm,
    formErrors,
    saving,
    deactivateId,
    setDeactivateId,
    deactivating,
    toast,
    openAdd,
    openEdit,
    closePanel,
    handleSubmit,
    handleDeactivate,
    target,
    handleToggleActive,
    handleBulkUpdateActive,
  } = useBundleService()

  const [tabFilter, setTabFilter] = useState('all') // 'all' | 'WARRANTY' | 'SCREEN_PROTECTION' | 'active' | 'inactive'
  const [selectedIds, setSelectedIds] = useState([])
  const [updatingBulk, setUpdatingBulk] = useState(false)
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const handleSelectAllToggle = () => {
    const allFilteredIds = finalFiltered.map(x => x.id)
    const selectedSet = new Set(selectedIds)
    const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedSet.has(id))
    if (isAllSelected) {
      const allFilteredSet = new Set(allFilteredIds)
      setSelectedIds(prev => prev.filter(id => !allFilteredSet.has(id)))
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...allFilteredIds])])
    }
  }

  const handleSelectRowToggle = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleBulkAction = async (newActive) => {
    setUpdatingBulk(true)
    try {
      await handleBulkUpdateActive(selectedIds, newActive)
      setSelectedIds([])
    } catch {
      // toast shown by hook
    } finally {
      setUpdatingBulk(false)
    }
  }

  const finalFiltered = items.filter(x => {
    if (search && !x.name.toLowerCase().includes(search.toLowerCase())) return false
    if (tabFilter === 'WARRANTY') return x.type === 'WARRANTY'
    if (tabFilter === 'SCREEN_PROTECTION') return x.type === 'SCREEN_PROTECTION'
    if (tabFilter === 'active') return x.active
    if (tabFilter === 'inactive') return !x.active
    return true
  })

  const inp = 'w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]'

  return (
    <div className="flex-1 flex flex-col min-h-dvh bg-gray-50">
      <div className="flex-1 px-8 py-7 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dịch vụ đi kèm</h1>
            <p className="text-sm text-gray-500 mt-0.5">Quản lý gói bảo hành, dán màn hình và các dịch vụ đi kèm khác</p>
          </div>
          <button aria-label="Thao tác" type="button" onClick={openAdd} className="flex items-center gap-2 bg-[#E8420A] hover:bg-[#C4350A] text-white font-semibold py-2.5 px-4 rounded text-sm transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Thêm dịch vụ
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-gray-200">
          {[
            { id: 'all', label: 'Tất cả dịch vụ' },
            { id: 'WARRANTY', label: 'Gói bảo hành' },
            { id: 'SCREEN_PROTECTION', label: 'Dán màn hình' },
            { id: 'active', label: 'Đang hoạt động' },
            { id: 'inactive', label: 'Đã ngừng' },
          ].map(t => {
            const isActive = tabFilter === t.id
            return (
              <button aria-label="Thao tác" type="button"
                key={t.id}
                onClick={() => { setTabFilter(t.id); setSearch(''); setSelectedIds([]) }}
                className={`px-4 py-2.5 text-sm font-semibold cursor-pointer border-b-2 -mb-px transition-colors ${
                  isActive
                    ? 'border-[#E8420A] text-[#E8420A]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        <div className="bg-white rounded border border-gray-200 px-5 py-3.5 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tên dịch vụ..." aria-label="Tìm kiếm dịch vụ" className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]" />
          </div>
          <span className="ml-auto text-xs text-gray-400 shrink-0">{finalFiltered.length} / {items.length} dịch vụ</span>
        </div>

        {selectedIds.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded px-5 py-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <span className="font-semibold">Đã chọn {selectedIds.length} dịch vụ</span>
              <span className="text-gray-300">|</span>
              <button aria-label="Bỏ chọn tất cả dịch vụ" type="button"
                onClick={() => setSelectedIds([])}
                className="text-xs text-[#E8420A] hover:underline font-semibold bg-transparent border-none p-0 cursor-pointer"
              >
                Bỏ chọn tất cả
              </button>
            </div>
            <div className="flex gap-2">
              <button aria-label="Kích hoạt hàng loạt dịch vụ" type="button"
                onClick={() => handleBulkAction(true)}
                disabled={updatingBulk}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold cursor-pointer transition-colors border-none disabled:opacity-50"
              >
                {updatingBulk ? 'Đang kích hoạt...' : 'Kích hoạt hàng loạt'}
              </button>
              <button aria-label="Ngừng hoạt động hàng loạt dịch vụ" type="button"
                onClick={() => handleBulkAction(false)}
                disabled={updatingBulk}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold cursor-pointer transition-colors border-none disabled:opacity-50"
              >
                {updatingBulk ? 'Đang ngừng...' : 'Ngừng hoạt động hàng loạt'}
              </button>
            </div>
          </div>
        )}

        {loading && <div className="bg-white rounded border border-gray-200 py-16 text-center text-gray-400 text-sm">Đang tải dữ liệu...</div>}
        {error && !loading && <div className="bg-red-50 border border-red-200 rounded px-5 py-4 text-red-600 text-sm">{error}</div>}

        {!loading && !error && (
          <div className="bg-white rounded border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3.5 w-10 text-left">
                    <input
                      type="checkbox"
                      aria-label="Chọn tất cả dịch vụ"
                      checked={finalFiltered.length > 0 && finalFiltered.every(x => selectedIdSet.has(x.id))}
                      onChange={handleSelectAllToggle}
                      className="rounded border-gray-300 text-[#E8420A] focus:ring-[#E8420A] cursor-pointer"
                    />
                  </th>
                  {['Tên dịch vụ', 'Loại', 'Giá', 'Thời hạn', 'Trạng thái', 'Thao tác'].map((h) => (
                    <th key={h} className={`px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wide ${h === 'Thao tác' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {finalFiltered.length === 0
                  ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">Không tìm thấy dịch vụ nào</td></tr>
                  : finalFiltered.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition-colors group">
                      <td className="px-4 py-4 w-10">
                        <input
                          type="checkbox"
                          aria-label={`Chọn dịch vụ ${item.name || item.id}`}
                          checked={selectedIdSet.has(item.id)}
                          onChange={() => handleSelectRowToggle(item.id)}
                          className="rounded border-gray-300 text-[#E8420A] focus:ring-[#E8420A] cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-800">{item.name || '—'}</td>
                      <td className="px-4 py-4 text-gray-600">{TYPE_LABELS[item.type] || item.type}</td>
                      <td className="px-4 py-4 text-gray-600">{formatCurrency(item.price)}</td>
                      <td className="px-4 py-4 text-gray-500">{item.durationMonths ? `${item.durationMonths} tháng` : 'Không thời hạn'}</td>
                      <td className="px-4 py-4">
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            aria-label={`Kích hoạt ${item.name}`}
                            checked={item.active}
                            onChange={() => handleToggleActive(item)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:bg-emerald-500"></div>
                          <span className="ml-2 text-xs font-semibold text-gray-700 w-8">
                            {item.active ? 'Bật' : 'Tắt'}
                          </span>
                        </label>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button aria-label={`Chỉnh sửa dịch vụ ${item.name}`} type="button"
                            onClick={() => openEdit(item)}
                            className="p-1.5 bg-gray-50 hover:bg-orange-50 text-gray-500 hover:text-[#E8420A] rounded transition-colors cursor-pointer border-none"
                            title="Chỉnh sửa"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {item.active ? (
                            <button aria-label={`Ngừng hoạt động dịch vụ ${item.name}`} type="button"
                              onClick={() => setDeactivateId(item.id)}
                              className="p-1.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors cursor-pointer border-none"
                              title="Ngừng hoạt động"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            </button>
                          ) : (
                            <div className="w-7 h-7" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {panel && <button type="button" aria-label="Đóng bảng dịch vụ" onClick={closePanel} className="fixed inset-0 bg-black/30 z-40 cursor-pointer border-none" />}

      {panel && (
        <div className="fixed top-0 right-0 h-full w-[440px] bg-white shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{panel === 'add' ? 'Thêm dịch vụ mới' : 'Sửa dịch vụ'}</h2>
              <p className="text-xs text-gray-400 mt-0.5">Điền đầy đủ thông tin bên dưới</p>
            </div>
            <button aria-label="Đóng" type="button" onClick={closePanel} className="p-2 hover:bg-gray-100 rounded cursor-pointer border-none bg-transparent"><svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <Field label="Tên dịch vụ *" error={formErrors.name}>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Bảo hành 12 tháng" aria-label="Tên dịch vụ" className={inp} />
            </Field>
            <Field label="Loại dịch vụ *">
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} aria-label="Loại dịch vụ" className={inp}>
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
                {form.price && !isNaN(Number(form.price)) && Number(form.price) >= 0 && (
                  <div className="text-[11px] text-emerald-600 mt-1 font-semibold">
                    Gợi ý hiển thị: {formatCurrency(Number(form.price))}
                  </div>
                )}
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
            <button aria-label="Đóng" type="button" onClick={closePanel} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Huỷ</button>
            <button aria-label="Thao tác" type="button" onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 bg-[#E8420A] hover:bg-[#C4350A] disabled:opacity-60 text-white rounded text-sm font-semibold cursor-pointer transition-colors">
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
                <button  type="button" onClick={() => setDeactivateId(null)} disabled={deactivating} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60 cursor-pointer">Hủy</button>
                <button aria-label="Thao tác" type="button" onClick={() => handleDeactivate(deactivateId)} disabled={deactivating} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded text-sm font-semibold cursor-pointer transition-colors">
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
