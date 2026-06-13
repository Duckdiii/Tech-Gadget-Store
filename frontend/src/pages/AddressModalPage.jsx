import { useState } from 'react'
import { useNav } from '../hooks/useNav'

function SelectField({ label, required, value, onChange, placeholder, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent pr-8 cursor-pointer transition ${
            value ? 'text-gray-800' : 'text-gray-400'
          }`}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}

const PROVINCES = [
  { value: 'hcm', label: 'TP. Hồ Chí Minh' },
  { value: 'hn',  label: 'Hà Nội' },
  { value: 'dn',  label: 'Đà Nẵng' },
  { value: 'ct',  label: 'Cần Thơ' },
]
const DISTRICTS = [
  { value: 'q1', label: 'Quận 1' }, { value: 'q3', label: 'Quận 3' },
  { value: 'q7', label: 'Quận 7' }, { value: 'binhThanh', label: 'Bình Thạnh' },
]
const WARDS = [
  { value: 'p1', label: 'Phường 1' }, { value: 'p2', label: 'Phường 2' },
  { value: 'p3', label: 'Phường 3' }, { value: 'p4', label: 'Phường 4' },
]

function RadioOption({ id, checked, onSelect, icon, label }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className="flex items-center gap-2 cursor-pointer select-none"
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
        checked ? 'border-blue-700' : 'border-gray-400'
      }`}>
        {checked && <div className="w-2.5 h-2.5 rounded-full bg-blue-700" />}
      </div>
      {icon}
      <span className="text-sm text-gray-700">{label}</span>
    </button>
  )
}

export default function AddressModalPage() {
  const onNavigate = useNav()
  const [name,        setName]        = useState('')
  const [phone,       setPhone]       = useState('')
  const [province,    setProvince]    = useState('')
  const [district,    setDistrict]    = useState('')
  const [ward,        setWard]        = useState('')
  const [detail,      setDetail]      = useState('')
  const [addrType,    setAddrType]    = useState('home')
  const [isDefault,   setIsDefault]   = useState(false)

  return (
    /* Overlay background simulating blurred app behind */
    <div
      className="flex-1 flex items-center justify-center px-4 py-10"
      style={{ backgroundColor: '#8a9db5' }}
    >
      {/* ── Modal card ── */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[580px] overflow-hidden">

        {/* Header */}
        <div className="px-7 pt-6 pb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Thêm địa chỉ mới</h2>
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 cursor-pointer transition-colors text-xl leading-none font-light">
            ×
          </button>
        </div>
        <div className="border-t border-gray-200" />

        {/* Form body */}
        <div className="px-7 py-6 space-y-5">

          {/* Row 1: Name + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Họ và tên<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập họ và tên"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Số điện thoại<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Row 2: Province / District / Ward */}
          <div className="grid grid-cols-3 gap-3">
            <SelectField
              label="Tỉnh/Thành phố" required
              value={province} onChange={setProvince}
              placeholder="Chọn Tỉnh/Thành"
              options={PROVINCES}
            />
            <SelectField
              label="Quận/Huyện" required
              value={district} onChange={setDistrict}
              placeholder="Chọn Quận/Huyện"
              options={DISTRICTS}
            />
            <SelectField
              label="Phường/Xã" required
              value={ward} onChange={setWard}
              placeholder="Chọn Phường/Xã"
              options={WARDS}
            />
          </div>

          {/* Row 3: Detail address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Địa chỉ chi tiết<span className="text-red-500 ml-0.5">*</span>
            </label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Số nhà, tên đường, tòa nhà..."
              rows={4}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none transition"
            />
          </div>

          {/* Row 4: Address type */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Loại địa chỉ</p>
            <div className="flex items-center gap-8">
              <RadioOption
                id="home" checked={addrType === 'home'} onSelect={setAddrType}
                label="Nhà riêng"
                icon={
                  <svg className="w-4 h-4 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                }
              />
              <RadioOption
                id="office" checked={addrType === 'office'} onSelect={setAddrType}
                label="Văn phòng"
                icon={
                  <svg className="w-4 h-4 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* Row 5: Default checkbox */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 accent-blue-700 cursor-pointer"
            />
            <span className="text-sm text-gray-700">Đặt làm địa chỉ mặc định</span>
          </label>

        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-7 py-4 flex items-center justify-end gap-3">
          <button onClick={() => onNavigate('userProfile')} className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-6 rounded-xl text-sm transition-colors cursor-pointer">
            Hủy
          </button>
          <button onClick={() => onNavigate('userProfile')} className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-colors cursor-pointer">
            Thêm địa chỉ
          </button>
        </div>

      </div>
    </div>
  )
}
