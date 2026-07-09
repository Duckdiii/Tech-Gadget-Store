import { useState } from 'react'

const TABS = ['Thông tin chung', 'Thanh toán', 'Vận chuyển', 'Bảo mật']

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
        checked ? 'bg-[#E8420A]' : 'bg-gray-300'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  )
}

function FormLabel({ children, required }) {
  return (
    <label className="block text-xs font-bold text-gray-500 tracking-wider uppercase mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  )
}

export default function SystemConfigPage() {
  const [activeTab, setActiveTab] = useState('Thông tin chung')
  const [form, setForm] = useState({
    storeName: 'TechStore Vietnam',
    email: 'contact@techstore.vn',
    phone: '1900 1234',
    address: '123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh',
  })
  const [maintenance, setMaintenance] = useState(false)
  const [allowReview, setAllowReview] = useState(true)

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-3 flex items-center gap-4">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border-0 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8420A]"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <div className="flex items-center gap-1 text-sm">
            <button className="text-gray-600 hover:text-gray-900 font-medium cursor-pointer px-1">Support</button>
            <button className="text-[#E8420A] hover:text-[#C4350A] font-medium cursor-pointer px-1">Logout</button>
          </div>
          <img src="https://placehold.co/34x34/374151/ffffff?text=AD" alt="avatar" className="w-8 h-8 rounded-full object-cover cursor-pointer" />
        </div>
      </header>

      {/* Page content */}
      <div className="flex-1 px-8 py-7">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Cấu hình Hệ thống</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý thông tin cửa hàng và các thiết lập vận hành toàn hệ thống.</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-5 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-[#E8420A] text-[#E8420A]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Thông tin chung' && (
          <>
            {/* 2-column layout */}
            <div className="grid grid-cols-[1fr_280px] gap-6 mb-6">
              {/* LEFT column */}
              <div className="space-y-5">
                {/* Thông tin cửa hàng */}
                <div className="bg-white rounded border border-gray-200 px-6 py-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-5">Thông tin cửa hàng</h2>

                  {/* Tên cửa hàng */}
                  <div className="mb-4">
                    <FormLabel>Tên cửa hàng</FormLabel>
                    <input
                      type="text"
                      value={form.storeName}
                      onChange={handleChange('storeName')}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E8420A] focus:border-transparent"
                    />
                  </div>

                  {/* Email + Phone side by side */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <FormLabel>Email liên hệ</FormLabel>
                      <input
                        type="email"
                        value={form.email}
                        onChange={handleChange('email')}
                        className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E8420A] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <FormLabel>Số điện thoại</FormLabel>
                      <input
                        type="text"
                        value={form.phone}
                        onChange={handleChange('phone')}
                        className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E8420A] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Địa chỉ */}
                  <div>
                    <FormLabel>Địa chỉ chính</FormLabel>
                    <input
                      type="text"
                      value={form.address}
                      onChange={handleChange('address')}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E8420A] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Thiết lập hiển thị */}
                <div className="bg-white rounded border border-gray-200 px-6 py-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-5">Thiết lập hiển thị</h2>

                  {/* Bảo trì */}
                  <div className="flex items-start justify-between gap-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Bảo trì hệ thống</p>
                      <p className="text-xs text-gray-500 mt-0.5">Hiển thị trang thông báo bảo trì với khách hàng</p>
                    </div>
                    <Toggle checked={maintenance} onChange={setMaintenance} />
                  </div>

                  <div className="border-t border-gray-100" />

                  {/* Đánh giá */}
                  <div className="flex items-start justify-between gap-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Cho phép đánh giá sản phẩm</p>
                      <p className="text-xs text-gray-500 mt-0.5">Chỉ khách hàng đã mua mới được đánh giá</p>
                    </div>
                    <Toggle checked={allowReview} onChange={setAllowReview} />
                  </div>
                </div>
              </div>

              {/* RIGHT column */}
              <div className="space-y-4">
                {/* Logo upload */}
                <div className="bg-white rounded border border-gray-200 px-5 py-5">
                  <h2 className="text-base font-bold text-gray-900 mb-4">Logo thương hiệu</h2>

                  {/* Upload area */}
                  <div className="border-2 border-dashed border-gray-300 rounded p-8 flex flex-col items-center justify-center mb-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="text-gray-400 mb-1">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <svg className="w-5 h-5 text-gray-300 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>

                  <p className="text-xs text-gray-500 text-center mb-4 leading-relaxed">
                    Định dạng JPG, PNG hoặc SVG. Kích thước tối đa 2MB. Tỉ lệ 1:1 hoặc 16:9.
                  </p>

                  <button className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 rounded text-sm transition-colors cursor-pointer">
                    Tải ảnh lên
                  </button>
                </div>

                {/* Info box */}
                <div className="bg-orange-50 border border-orange-100 rounded px-4 py-4">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-[#E8420A] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-bold text-[#C4350A] mb-1">Lưu ý cập nhật</p>
                      <p className="text-xs text-[#C4350A] leading-relaxed">
                        Thay đổi thông tin cửa hàng có thể mất tối đa 5 phút để hiển thị trên toàn bộ các nền tảng frontend.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom actions */}
            <div className="border-t border-gray-200 pt-5 flex items-center justify-end gap-3">
              <button className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 px-6 rounded text-sm transition-colors cursor-pointer">
                Hủy
              </button>
              <button className="bg-[#0D0F14] hover:bg-[#0D0F14] text-white font-semibold py-2.5 px-6 rounded text-sm transition-colors cursor-pointer">
                Lưu thay đổi
              </button>
            </div>
          </>
        )}

        {activeTab !== 'Thông tin chung' && (
          <div className="flex items-center justify-center py-24 text-sm text-gray-400">
            Nội dung tab "{activeTab}" đang được xây dựng.
          </div>
        )}
      </div>
    </div>
  )
}
