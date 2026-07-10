import React, { useState } from 'react'
import StockBar from './StockBar'

const STATUS_CONFIG = {
  sap_het:  { label: 'Sắp hết',   bg: 'bg-orange-100', text: 'text-orange-600', barColor: 'bg-red-500' },
  con_hang: { label: 'Còn hàng',  bg: 'bg-green-100',  text: 'text-green-700',  barColor: 'bg-green-500' },
  het_hang: { label: 'Hết hàng',  bg: 'bg-gray-200',   text: 'text-gray-500',   barColor: 'bg-gray-300' },
}

export default function InventoryTab({ productsList, loading }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const filtered = productsList.filter((p) => {
    const q = search.toLowerCase()
    return (
      (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) &&
      (!category || p.category === category) &&
      (!statusFilter || p.status === statusFilter)
    )
  })

  return (
    <>
      {/* Title row */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tồn kho</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Tổng: 12,450 sản phẩm · <span className="text-red-500 font-semibold">Sắp hết: 45 SKU</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded text-sm cursor-pointer transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Xuất CSV
          </button>
          <button className="flex items-center gap-2 bg-[#E8420A] hover:bg-[#C4350A] text-white font-semibold py-2 px-4 rounded text-sm cursor-pointer transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tên sản phẩm hoặc SKU..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A] bg-white" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer bg-white">
          <option value="">Tất cả danh mục</option>
          {['Smartphones','Laptops','Accessories','Tablets'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer bg-white">
          <option value="">Trạng thái kho</option>
          <option value="sap_het">Sắp hết</option>
          <option value="con_hang">Còn hàng</option>
          <option value="het_hang">Hết hàng</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-[3.5rem_1fr_9rem_8rem_8rem_12rem_8rem_4rem] gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
          {['ẢNH','SẢN PHẨM','SKU','DANH MỤC','GIÁ (VNĐ)','MỨC TỒN KHO','TRẠNG THÁI',''].map((h,i) => (
            <span key={i} className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{h}</span>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">Không tìm thấy sản phẩm nào.</div>
        ) : filtered.map((p) => {
          const cfg = STATUS_CONFIG[p.status] || { label: 'N/A', bg: 'bg-gray-100', text: 'text-gray-600', barColor: 'bg-gray-200' }
          return (
            <div key={p.id} className={`grid grid-cols-[3.5rem_1fr_9rem_8rem_8rem_12rem_8rem_4rem] gap-2 px-5 py-4 border-b border-gray-50 last:border-0 items-center ${p.faded ? 'opacity-50' : ''}`}>
              <img src={p.img} alt={p.name} className="w-10 h-10 rounded object-cover" />
              <span className="text-sm font-semibold text-gray-800">{p.name}</span>
              <span className="text-xs font-mono text-gray-500">{p.sku}</span>
              <span className="text-sm text-gray-600">{p.category}</span>
              <span className="text-sm font-medium text-gray-800">{p.price.toLocaleString('vi-VN')}</span>
              <StockBar stock={p.stock} maxStock={p.maxStock} barColor={cfg.barColor} />
              <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded ${cfg.bg} ${cfg.text}`}>
                {cfg.label}
              </span>
              <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded cursor-pointer transition-colors border-none bg-transparent">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          )
        })}
        <div className="px-5 py-4 flex items-center justify-between border-t border-gray-100">
          <span className="text-sm text-gray-400">Hiển thị {filtered.length} / 12,450 sản phẩm</span>
          <div className="flex items-center gap-1">
            {[1,2,3,'...',415].map((n,i) => (
              typeof n === 'number' && n !== 415 ? (
                <button key={i} onClick={() => setPage(n)} className={`w-8 h-8 rounded text-sm font-medium cursor-pointer border-none bg-transparent ${page===n ? 'bg-[#E8420A] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{n}</button>
              ) : n === '...' ? (
                <span key={i} className="w-8 h-8 flex items-center justify-center text-gray-300 text-sm">…</span>
              ) : (
                <button key={i} onClick={() => setPage(415)} className={`w-8 h-8 rounded text-sm font-medium cursor-pointer border-none bg-transparent ${page===415 ? 'bg-[#E8420A] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>415</button>
              )
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
