import { useState } from 'react'

const INITIAL_ITEMS = [
  { id: 1, name: 'iPhone 15 Pro Max 256GB', unit: 'Cái', qty: 50, unitPrice: 28500000 },
  { id: 2, name: 'MacBook Pro M3 14-inch', unit: 'Cái', qty: 20, unitPrice: 38000000 },
  { id: 3, name: '', unit: '', qty: 0, unitPrice: 0 },
]

let nextId = 4

function SearchIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

export default function ImportStockPage() {
  const [items, setItems] = useState(INITIAL_ITEMS)
  const [note, setNote] = useState('')

  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const updated = { ...item, [field]: value }
        if (field === 'name' && value && !item.unit) updated.unit = 'Cái'
        if (field === 'name' && !value) updated.unit = ''
        return updated
      })
    )
  }

  const addItem = () => {
    setItems((prev) => [...prev, { id: nextId++, name: '', unit: '', qty: 0, unitPrice: 0 }])
  }

  const filledItems = items.filter((i) => i.name.trim() !== '')
  const totalQty = items.reduce((sum, i) => sum + (Number(i.qty) || 0), 0)
  const totalAmount = items.reduce((sum, i) => sum + (Number(i.qty) || 0) * (Number(i.unitPrice) || 0), 0)

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
        <span className="text-lg font-bold text-[#C4350A] shrink-0">TechStore Warehouse</span>

        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border-0 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8420A]"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Bell */}
          <button className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          {/* Settings */}
          <button className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          {/* Avatar */}
          <img
            src="https://placehold.co/34x34/374151/ffffff?text=NV"
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover cursor-pointer"
          />
        </div>
      </header>

      {/* Page content */}
      <div className="flex-1 px-8 py-7 space-y-5">
        {/* Page title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tạo phiếu nhập kho</h1>
          <p className="text-sm text-gray-500 mt-1">
            Nhập thông tin sản phẩm và nhà cung cấp để tạo phiếu mới.
          </p>
        </div>

        {/* Section 1: Thông tin chung */}
        <div className="bg-white rounded border border-gray-200 px-6 py-5">
          <h2 className="text-base font-bold text-gray-800 mb-5">Thông tin chung</h2>
          <div className="grid grid-cols-4 gap-5">
            {/* Mã phiếu */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2">
                Mã phiếu
              </label>
              <input
                type="text"
                value="PN-2023-0045"
                readOnly
                className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm text-gray-700 bg-gray-50 focus:outline-none cursor-default"
              />
            </div>

            {/* Nhà cung cấp */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2">
                Nhà cung cấp <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E8420A] appearance-none cursor-pointer bg-white">
                  <option value="">Chọn nhà cung cấp</option>
                  <option value="apple">Apple Vietnam</option>
                  <option value="samsung">Samsung Vietnam</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Ngày nhập */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2">
                Ngày nhập <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                defaultValue="2023-10-24"
                className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer"
              />
            </div>

            {/* Người thực hiện */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2">
                Người thực hiện
              </label>
              <input
                type="text"
                defaultValue="Nguyễn Văn A"
                className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm text-gray-700 bg-gray-50 focus:outline-none cursor-default"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Section 2: Danh sách sản phẩm nhập */}
        <div className="bg-white rounded border border-gray-200 px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-800">Danh sách sản phẩm nhập</h2>
            <button
              onClick={addItem}
              className="flex items-center gap-2 bg-[#E8420A] hover:bg-[#C4350A] text-white font-semibold py-2 px-4 rounded text-sm transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Thêm sản phẩm
            </button>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[3.5rem_1fr_7rem_7rem_9rem_9rem] gap-2 border-b border-gray-200 pb-3 mb-1">
            {['STT', 'TÊN SẢN PHẨM', 'ĐƠN VỊ TÍNH', 'SỐ LƯỢNG', 'ĐƠN GIÁ NHẬP', 'THÀNH TIỀN'].map((h) => (
              <span key={h} className="text-xs font-bold text-gray-500 tracking-wider uppercase last:text-right">
                {h}
              </span>
            ))}
          </div>

          {/* Table rows */}
          <div className="space-y-1">
            {items.map((item, index) => {
              const isEmpty = item.name.trim() === ''
              const lineTotal = (Number(item.qty) || 0) * (Number(item.unitPrice) || 0)

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[3.5rem_1fr_7rem_7rem_9rem_9rem] gap-2 items-center py-2.5 border-b border-gray-100 last:border-0"
                >
                  {/* STT */}
                  <span className="text-sm text-gray-500 font-medium">{index + 1}</span>

                  {/* Tên sản phẩm */}
                  <div className="relative">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      placeholder="Chọn hoặc nhập tên s..."
                      className={`w-full pr-8 pl-3 py-2 text-sm rounded focus:outline-none focus:ring-2 focus:ring-[#E8420A] ${
                        isEmpty
                          ? 'border border-dashed border-gray-300 text-gray-400 placeholder-gray-400'
                          : 'border border-gray-300 text-gray-800'
                      }`}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                      <SearchIcon />
                    </span>
                  </div>

                  {/* Đơn vị tính */}
                  <span className="text-sm text-gray-700 px-2">
                    {item.unit || ''}
                  </span>

                  {/* Số lượng */}
                  <input
                    type="number"
                    value={item.qty === 0 && isEmpty ? '' : item.qty}
                    onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E8420A] text-center"
                  />

                  {/* Đơn giá nhập */}
                  <input
                    type="number"
                    value={item.unitPrice === 0 && isEmpty ? '' : item.unitPrice}
                    onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E8420A] text-right"
                  />

                  {/* Thành tiền */}
                  <span className="text-sm font-semibold text-gray-800 text-right">
                    {lineTotal.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom: Ghi chú + Tóm tắt */}
        <div className="grid grid-cols-[1fr_320px] gap-5">
          {/* Ghi chú */}
          <div className="bg-white rounded border border-gray-200 px-6 py-5">
            <h2 className="text-base font-bold text-gray-800 mb-4">Ghi chú</h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú cho phiếu nhập kho này (không bắt buộc)..."
              rows={6}
              className="w-full border border-gray-200 rounded px-3 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8420A] resize-none"
            />
          </div>

          {/* Tóm tắt */}
          <div className="bg-white rounded border border-gray-200 px-6 py-5 flex flex-col">
            <h2 className="text-base font-bold text-gray-800 mb-5">Tóm tắt</h2>

            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tổng số lượng:</span>
                <span className="text-sm font-semibold text-gray-800">{totalQty}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Số loại sản phẩm:</span>
                <span className="text-sm font-semibold text-gray-800">{filledItems.length}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4 mb-5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-base font-bold text-gray-800">Tổng tiền:</span>
                <span className="text-2xl font-black text-[#E8420A]">
                  {totalAmount.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            <button className="w-full bg-[#0D0F14] hover:bg-[#0D0F14] text-white font-semibold py-3 px-4 rounded transition-colors cursor-pointer text-sm flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Hoàn tất nhập kho
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
