import { useState, useEffect, useCallback } from 'react'
import {
  getPromotions,
  getPromotionSummary,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from '../services/promotionService'
import PromotionFormModal from '../components/PromotionFormModal'
import PromotionDeleteModal from '../components/PromotionDeleteModal'
import PromotionPerformanceModal from '../components/PromotionPerformanceModal'

/* ── Status config ── */
const STATUS_CONFIG = {
  ACTIVE:   { label: 'Đang chạy',    bg: 'bg-green-100',  text: 'text-green-700'  },
  UPCOMING: { label: 'Sắp diễn ra',  bg: 'bg-yellow-100', text: 'text-yellow-600' },
  ENDED:    { label: 'Kết thúc',     bg: 'bg-gray-100',   text: 'text-gray-500'   },
}

const PROMO_CODES = [
  {
    code: 'TECHSUMMER24', discount: '-10%',
    used: 50, total: 100, expiry: '30/06/2024',
    codeBg: 'bg-orange-50', codeText: 'text-[#C4350A]',
    barColor: 'bg-[#E8420A]', pct: 50,
  },
  {
    code: 'WELCOME50', discount: '-50k',
    used: 85, total: null, expiry: 'Không giới hạn',
    codeBg: 'bg-orange-100', codeText: 'text-orange-700',
    barColor: 'bg-orange-500', pct: 100,
  },
]

function formatPeriod(startAt, endAt) {
  const fmt = (val) => {
    if (!val) return '—'
    if (Array.isArray(val)) {
      const [, mo, d] = val
      return `${String(d).padStart(2,'0')}/${String(mo).padStart(2,'0')}`
    }
    const dt = new Date(val)
    return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}`
  }
  return `${fmt(startAt)} - ${fmt(endAt)}`
}

function formatCurrency(val) {
  if (val == null) return '—'
  return Number(val).toLocaleString('vi-VN') + ' đ'
}

/* ── Toggle ── */
function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
        checked ? 'bg-[#E8420A]' : 'bg-gray-200'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  )
}

/* ── Dropdown ── */
function Dropdown({ label, options = [] }) {
  return (
    <div className="relative">
      <select className="appearance-none border border-gray-200 rounded px-3 py-2 pr-7 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer">
        <option>{label}</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

/* ── Main page ── */
export default function PromotionSettingsPage() {
  const [promotions, setPromotions] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loyalty, setLoyalty] = useState({ points: true, birthday: true, vip: false })

  const [formModal, setFormModal] = useState({ open: false, initialData: null })
  const [deleteModal, setDeleteModal] = useState({ open: false, promotion: null, loading: false })
  const [perfModal, setPerfModal] = useState({ open: false, promotionId: null })

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [list, sum] = await Promise.all([getPromotions(), getPromotionSummary()])
      setPromotions(list ?? [])
      setSummary(sum)
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleCreate = async (data) => {
    await createPromotion(data)
    setFormModal({ open: false, initialData: null })
    loadData()
  }

  const handleEdit = async (data) => {
    await updatePromotion(formModal.initialData.id, data)
    setFormModal({ open: false, initialData: null })
    loadData()
  }

  const handleDeleteConfirm = async () => {
    setDeleteModal((m) => ({ ...m, loading: true }))
    try {
      await deletePromotion(deleteModal.promotion.id)
      setDeleteModal({ open: false, promotion: null, loading: false })
      loadData()
    } catch (err) {
      setDeleteModal((m) => ({ ...m, loading: false }))
      alert(err.message || 'Xóa thất bại')
    }
  }

  const kpiCards = [
    {
      label: 'Chiến dịch đang chạy',
      value: summary ? String(summary.activeCount) : '—',
      iconBg: 'bg-orange-50', iconColor: 'text-[#E8420A]',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    },
    {
      label: 'Tổng chiến dịch',
      value: summary ? String(summary.totalCount) : '—',
      iconBg: 'bg-orange-100', iconColor: 'text-orange-500',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
    },
    {
      label: 'Tổng đơn hàng từ KM',
      value: summary ? summary.totalOrderCount.toLocaleString('vi-VN') : '—',
      iconBg: 'bg-pink-100', iconColor: 'text-pink-500',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    },
    {
      label: 'Doanh thu từ KM',
      value: summary ? formatCurrency(summary.totalEstimatedRevenue) : '—',
      iconBg: 'bg-orange-50', iconColor: 'text-[#E8420A]',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
  ]

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-3 flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search..." className="w-full pl-9 pr-4 py-2 bg-gray-100 border-0 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8420A]" />
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <img src="https://placehold.co/34x34/374151/ffffff?text=AD" alt="avatar" className="w-8 h-8 rounded-full object-cover cursor-pointer" />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-8 py-7 space-y-5">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cài đặt khuyến mãi</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý các chiến dịch giảm giá, mã khuyến mãi và ưu đãi khách hàng.</p>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3">{error}</div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          {kpiCards.map((card, i) => (
            <div key={i} className="bg-white rounded border border-gray-200 px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 font-medium">{card.label}</span>
                <span className={`w-8 h-8 flex items-center justify-center rounded ${card.iconBg} ${card.iconColor}`}>
                  {card.icon}
                </span>
              </div>
              <p className="text-2xl font-black text-gray-900 truncate">{card.value}</p>
            </div>
          ))}
        </div>

        {/* 2-column layout */}
        <div className="grid grid-cols-[1fr_290px] gap-5">
          {/* LEFT: Active Promotions */}
          <div className="bg-white rounded border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">Active Promotions</h2>
              <button
                onClick={() => setFormModal({ open: true, initialData: null })}
                className="flex items-center gap-1.5 bg-[#E8420A] hover:bg-[#C4350A] text-white font-semibold py-2 px-4 rounded text-sm transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Tạo khuyến mãi mới
              </button>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-[3rem_1fr_9rem_9rem_9rem_9rem] gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
              {['STT', 'TÊN CHIẾN DỊCH', 'GIẢM GIÁ', 'THỜI GIAN', 'TRẠNG THÁI', 'THAO TÁC'].map((h) => (
                <span key={h} className="text-xs font-bold text-gray-400 tracking-wider uppercase">{h}</span>
              ))}
            </div>

            {/* Table rows */}
            {loading ? (
              <div className="px-5 py-8 text-sm text-gray-400 text-center">Đang tải...</div>
            ) : promotions.length === 0 ? (
              <div className="px-5 py-8 text-sm text-gray-400 text-center">Chưa có chiến dịch nào</div>
            ) : (
              promotions.map((p, idx) => {
                const st = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.ENDED
                return (
                  <div key={p.id} className="grid grid-cols-[3rem_1fr_9rem_9rem_9rem_9rem] gap-2 px-5 py-4 border-b border-gray-100 last:border-0 items-center">
                    <span className="text-sm text-gray-500 font-medium">{idx + 1}</span>
                    <span className="text-sm font-semibold text-gray-800 truncate">{p.name}</span>
                    <span className="text-sm text-gray-600">-{p.discountPercent}%</span>
                    <span className="text-sm text-gray-600">{formatPeriod(p.startAt, p.endAt)}</span>
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded text-xs font-semibold w-fit ${st.bg} ${st.text}`}>
                      {st.label}
                    </span>
                    <div className="flex items-center gap-1">
                      {/* Edit */}
                      <button
                        onClick={() => setFormModal({ open: true, initialData: p })}
                        title="Chỉnh sửa"
                        className="p-1.5 text-gray-400 hover:text-[#E8420A] hover:bg-orange-50 rounded transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {/* Performance */}
                      <button
                        onClick={() => setPerfModal({ open: true, promotionId: p.id })}
                        title="Xem hiệu suất"
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => setDeleteModal({ open: true, promotion: p, loading: false })}
                        title="Xóa"
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* RIGHT column */}
          <div className="flex flex-col gap-4">
            {/* Mã Khuyến Mãi Hoạt Động */}
            <div className="bg-white rounded border border-gray-200 p-4">
              <h2 className="text-sm font-bold text-gray-800 mb-3">Mã Khuyến Mãi Hoạt Động</h2>

              <div className="relative mb-3">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Tìm mã..." className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8420A]" />
              </div>

              <div className="flex gap-2 mb-4">
                <Dropdown label="Loại mã" options={['% giảm', 'Số tiền']} />
                <Dropdown label="Trạng thái" options={['Đang dùng', 'Hết hạn']} />
              </div>

              <div className="space-y-3">
                {PROMO_CODES.map((pc) => (
                  <div key={pc.code} className="border border-gray-200 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-bold text-sm px-2.5 py-1 rounded ${pc.codeBg} ${pc.codeText}`}>
                        {pc.code}
                      </span>
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {pc.discount}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1.5">
                      Sử dụng: <span className="font-semibold">{pc.used}/{pc.total ?? '∞'}</span>
                    </p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">HSD: {pc.expiry}</span>
                      <button className="text-xs font-semibold text-[#E8420A] hover:text-[#C4350A] cursor-pointer">Copy</button>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${pc.barColor} rounded-full`} style={{ width: `${pc.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-3 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium py-2.5 rounded transition-colors cursor-pointer">
                Xem tất cả mã
              </button>
            </div>

            {/* Khách Hàng Thân Thiết */}
            <div className="bg-white rounded border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-orange-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </span>
                <h2 className="text-sm font-bold text-gray-800">Khách Hàng Thân Thiết</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Tích điểm đổi quà</p>
                    <p className="text-xs text-gray-500 mt-0.5">Áp dụng cho mọi đơn hàng</p>
                  </div>
                  <Toggle checked={loyalty.points} onChange={(v) => setLoyalty((p) => ({ ...p, points: v }))} />
                </div>
                <div className="border-t border-gray-100" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Giảm giá sinh nhật</p>
                    <p className="text-xs text-gray-500 mt-0.5">Tự động gửi mã -20%</p>
                  </div>
                  <Toggle checked={loyalty.birthday} onChange={(v) => setLoyalty((p) => ({ ...p, birthday: v }))} />
                </div>
                <div className="border-t border-gray-100" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Ưu đãi khách hàng VIP</p>
                    <p className="text-xs text-gray-500 mt-0.5">Miễn phí vận chuyển</p>
                  </div>
                  <Toggle checked={loyalty.vip} onChange={(v) => setLoyalty((p) => ({ ...p, vip: v }))} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PromotionFormModal
        isOpen={formModal.open}
        initialData={formModal.initialData}
        onClose={() => setFormModal({ open: false, initialData: null })}
        onSubmit={formModal.initialData ? handleEdit : handleCreate}
      />
      <PromotionDeleteModal
        isOpen={deleteModal.open}
        promotion={deleteModal.promotion}
        loading={deleteModal.loading}
        onClose={() => setDeleteModal({ open: false, promotion: null, loading: false })}
        onConfirm={handleDeleteConfirm}
      />
      <PromotionPerformanceModal
        isOpen={perfModal.open}
        promotionId={perfModal.promotionId}
        onClose={() => setPerfModal({ open: false, promotionId: null })}
      />
    </div>
  )
}
