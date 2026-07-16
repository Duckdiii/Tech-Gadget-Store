import { useState } from 'react'
import { useAddressSection } from '../hooks/useAddressSection'

const PROVINCES = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng',
  'Bình Dương', 'Đồng Nai', 'Khánh Hòa', 'Quảng Ninh', 'Nghệ An',
  'Thừa Thiên Huế', 'Lâm Đồng', 'Bà Rịa - Vũng Tàu', 'Long An', 'Tiền Giang',
]

const DISTRICTS = {
  'Hà Nội':            ['Quận Ba Đình', 'Quận Hoàn Kiếm', 'Quận Đống Đa', 'Quận Hai Bà Trưng', 'Quận Cầu Giấy', 'Quận Thanh Xuân', 'Quận Hoàng Mai', 'Huyện Đông Anh'],
  'TP. Hồ Chí Minh':  ['Quận 1', 'Quận 3', 'Quận 5', 'Quận 7', 'Quận Bình Thạnh', 'Quận Gò Vấp', 'Quận Tân Bình', 'Thành phố Thủ Đức'],
  'Đà Nẵng':           ['Quận Hải Châu', 'Quận Thanh Khê', 'Quận Sơn Trà', 'Quận Ngũ Hành Sơn', 'Quận Liên Chiểu', 'Quận Cẩm Lệ'],
  'Cần Thơ':           ['Quận Ninh Kiều', 'Quận Bình Thủy', 'Quận Cái Răng', 'Quận Ô Môn', 'Huyện Phong Điền'],
  'Hải Phòng':         ['Quận Hồng Bàng', 'Quận Lê Chân', 'Quận Ngô Quyền', 'Quận Kiến An', 'Quận Hải An'],
}

const WARDS = {
  'Quận Cầu Giấy':   ['Phường Dịch Vọng', 'Phường Dịch Vọng Hậu', 'Phường Mai Dịch', 'Phường Nghĩa Đô', 'Phường Quan Hoa', 'Phường Trung Hòa', 'Phường Yên Hòa'],
  'Quận Hoàn Kiếm':  ['Phường Hàng Bạc', 'Phường Hàng Gai', 'Phường Lý Thái Tổ', 'Phường Phan Chu Trinh', 'Phường Tràng Tiền'],
  'Quận 1':           ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cô Giang', 'Phường Đa Kao', 'Phường Nguyễn Thái Bình'],
  'Quận Bình Thạnh': ['Phường 1', 'Phường 3', 'Phường 5', 'Phường 11', 'Phường 13', 'Phường 17', 'Phường 21', 'Phường 22', 'Phường 25', 'Phường 26', 'Phường 27', 'Phường 28'],
  'Quận Hải Châu':   ['Phường Bình Hiên', 'Phường Hải Châu 1', 'Phường Hải Châu 2', 'Phường Nam Dương', 'Phường Phước Ninh', 'Phường Thạch Thang'],
}

const ADDR_BLANK = { name: '', phone: '', province: '', district: '', ward: '', detail: '', type: 'home', isDefault: false }

function AddressModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial ?? ADDR_BLANK)
  const [errors, setErrors] = useState({})

  const set = (k) => (e) => setForm(prev => {
    const next = { ...prev, [k]: e.target.value }
    if (k === 'province') { next.district = ''; next.ward = '' }
    if (k === 'district') { next.ward = '' }
    return next
  })

  const availableDistricts = DISTRICTS[form.province] ?? []
  const availableWards     = WARDS[form.district]    ?? []

  const validate = () => {
    const e = {}
    if (!form.name.trim())     e.name     = 'Vui lòng nhập họ tên'
    if (!form.phone.trim())    e.phone    = 'Vui lòng nhập số điện thoại'
    if (!form.province)        e.province = 'Vui lòng chọn tỉnh/thành phố'
    if (!form.district)        e.district = 'Vui lòng chọn quận/huyện'
    if (!form.ward)            e.ward     = 'Vui lòng chọn phường/xã'
    if (!form.detail.trim())   e.detail   = 'Vui lòng nhập địa chỉ cụ thể'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => { if (validate()) onSave(form) }

  const inputCls = (key) =>
    `w-full border rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[var(--accent)] transition-colors ${
      errors[key] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t z-10">
          <div>
            <h2 className="text-base font-black text-gray-900">{initial ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Điền đầy đủ thông tin để đặt hàng chính xác</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors border-none cursor-pointer">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-7 py-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Họ và tên <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={set('name')} placeholder="Nguyễn Văn A" className={inputCls('name')} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Số điện thoại <span className="text-red-500">*</span></label>
              <input value={form.phone} onChange={set('phone')} placeholder="0901234567" maxLength={10} className={inputCls('phone')} />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Tỉnh / Thành phố <span className="text-red-500">*</span></label>
            <select value={form.province} onChange={set('province')} className={inputCls('province')}>
              <option value="">-- Chọn tỉnh/thành phố --</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {errors.province && <p className="text-xs text-red-500 mt-1">{errors.province}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Quận / Huyện <span className="text-red-500">*</span></label>
              <select value={form.district} onChange={set('district')} disabled={!form.province} className={inputCls('district') + (!form.province ? ' opacity-50 cursor-not-allowed' : '')}>
                <option value="">-- Chọn quận/huyện --</option>
                {availableDistricts.length > 0
                  ? availableDistricts.map(d => <option key={d} value={d}>{d}</option>)
                  : form.province && <option value={form.district || '_custom'}>{form.district || '(Nhập tay bên dưới)'}</option>
                }
              </select>
              {availableDistricts.length === 0 && form.province && (
                <input value={form.district} onChange={set('district')} placeholder="Nhập quận/huyện" className={`${inputCls('district')} mt-2`} />
              )}
              {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Phường / Xã <span className="text-red-500">*</span></label>
              <select value={form.ward} onChange={set('ward')} disabled={!form.district} className={inputCls('ward') + (!form.district ? ' opacity-50 cursor-not-allowed' : '')}>
                <option value="">-- Chọn phường/xã --</option>
                {availableWards.length > 0
                  ? availableWards.map(w => <option key={w} value={w}>{w}</option>)
                  : form.district && <option value={form.ward || '_custom'}>{form.ward || '(Nhập tay bên dưới)'}</option>
                }
              </select>
              {availableWards.length === 0 && form.district && (
                <input value={form.ward} onChange={set('ward')} placeholder="Nhập phường/xã" className={`${inputCls('ward')} mt-2`} />
              )}
              {errors.ward && <p className="text-xs text-red-500 mt-1">{errors.ward}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Địa chỉ cụ thể <span className="text-red-500">*</span></label>
            <input value={form.detail} onChange={set('detail')} placeholder="Số nhà, tên đường, tên tòa nhà..." className={inputCls('detail')} />
            {errors.detail && <p className="text-xs text-red-500 mt-1">{errors.detail}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Loại địa chỉ</label>
            <div className="flex gap-3">
              {[
                { v: 'home',   l: 'Nhà riêng',  icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                { v: 'office', l: 'Công ty',     icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                { v: 'other',  l: 'Khác',        icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
              ].map(t => (
                <label key={t.v} className={`flex-1 flex items-center gap-2.5 px-4 py-3 rounded border cursor-pointer transition-all ${
                  form.type === t.v
                    ? 'border-[var(--accent)] bg-orange-50 text-[var(--accent)]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}>
                  <input type="radio" name="addrType" value={t.v} checked={form.type === t.v} onChange={set('type')} className="hidden" />
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={t.icon} />
                  </svg>
                  <span className="text-sm font-semibold">{t.l}</span>
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setForm(prev => ({ ...prev, isDefault: !prev.isDefault }))}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                form.isDefault ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-gray-300 hover:border-[var(--accent)]'
              }`}
            >
              {form.isDefault && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Đặt làm địa chỉ mặc định</p>
              <p className="text-xs text-gray-400 mt-0.5">Địa chỉ này sẽ được chọn tự động khi đặt hàng</p>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-gray-100 bg-gray-50/60 rounded-b sticky bottom-0">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors bg-white cursor-pointer">Huỷ bỏ</button>
          <button onClick={handleSave} className="px-6 py-2.5 text-sm font-bold text-white bg-[var(--accent)] hover:bg-[var(--accent-d)] rounded shadow-sm transition-colors border-none cursor-pointer">{initial ? 'Lưu thay đổi' : 'Thêm địa chỉ'}</button>
        </div>
      </div>
    </div>
  )
}

const typeInfo = {
  home:   { label: 'Nhà riêng', color: 'bg-orange-50 text-[var(--accent)] border-orange-200', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  office: { label: 'Công ty',   color: 'bg-purple-50 text-purple-700 border-purple-200', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  other:  { label: 'Khác',      color: 'bg-gray-50 text-gray-600 border-gray-200',   icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
}

export default function AddressSection({ profile }) {
  const {
    addresses,
    modal,
    setModal,
    deletingId,
    setDeletingId,
    toast,
    handleSave,
    handleDelete,
    handleSetDefault,
  } = useAddressSection({ profile })

  return (
    <div className="space-y-4 text-gray-800">
      {toast && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-5 py-3 rounded shadow-sm">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          {toast}
        </div>
      )}

      <div className="bg-white rounded border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <h3 className="text-base font-bold text-gray-900">Sổ địa chỉ</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {addresses.length === 0 ? 'Chưa có địa chỉ nào' : `${addresses.length} địa chỉ đã lưu`}
            </p>
          </div>
          <button
            onClick={() => setModal('add')}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[var(--accent)] hover:bg-[var(--accent-d)] rounded shadow-sm transition-colors border-none cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Thêm địa chỉ mới
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-t border-gray-100">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-base font-semibold text-gray-600">Bạn chưa có địa chỉ nào</p>
            <p className="text-sm text-gray-400 mt-1">Thêm địa chỉ để đặt hàng nhanh hơn</p>
            <button
              onClick={() => setModal('add')}
              className="mt-5 flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[var(--accent)] hover:bg-[var(--accent-d)] rounded transition-colors shadow-sm border-none cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Thêm địa chỉ đầu tiên
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {addresses.map(addr => {
              const ti = typeInfo[addr.type] ?? typeInfo.other
              const fullAddr = [addr.detail, addr.ward, addr.district, addr.province].filter(Boolean).join(', ')
              return (
                <div key={addr.id} className={`px-6 py-5 transition-colors ${addr.isDefault ? 'bg-orange-50/40' : 'hover:bg-gray-50/60'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded border flex items-center justify-center shrink-0 ${ti.color}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={ti.icon} />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-bold text-gray-900">{addr.name}</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-sm text-gray-500">{addr.phone}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${ti.color}`}>{ti.label}</span>
                        {addr.isDefault && (
                          <span className="text-xs font-black text-[var(--accent)] bg-orange-100 border border-orange-200 px-2 py-0.5 rounded">Mặc định</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{fullAddr}</p>
                      <div className="flex items-center gap-1 mt-3">
                        <button onClick={() => setModal({ editId: addr.id })} className="text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-d)] hover:bg-orange-50 border border-orange-200 px-3 py-1.5 rounded transition-colors bg-white cursor-pointer">Chỉnh sửa</button>
                        {!addr.isDefault && (
                          <button onClick={() => handleSetDefault(addr.id)} className="text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded transition-colors bg-white cursor-pointer">Đặt làm mặc định</button>
                        )}
                        <button onClick={() => setDeletingId(addr.id)} className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded transition-colors ml-1 bg-white cursor-pointer">Xoá</button>
                      </div>
                    </div>
                  </div>
                  {deletingId === addr.id && (
                    <div className="mt-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded px-4 py-3">
                      <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-sm font-semibold text-red-700 flex-1">Xác nhận xoá địa chỉ này?</p>
                      <button onClick={() => setDeletingId(null)} className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded hover:bg-white border border-gray-200 transition-colors bg-transparent cursor-pointer">Huỷ</button>
                      <button onClick={() => handleDelete(addr.id)} className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded transition-colors border-none cursor-pointer">Xoá</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded px-5 py-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-amber-800 font-medium leading-relaxed">
          Địa chỉ <span className="font-black">mặc định</span> sẽ được tự động chọn khi bạn đặt hàng. Bạn vẫn có thể thay đổi địa chỉ giao hàng ở bước xác nhận đơn.
        </p>
      </div>

      {modal && (
        <AddressModal
          initial={modal !== 'add' ? addresses.find(a => a.id === modal.editId) : null}
          onClose={() => { setModal(null); setDeletingId(null) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
