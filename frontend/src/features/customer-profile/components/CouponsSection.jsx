import { useState, useEffect, useCallback } from 'react'
import { couponService } from '../services/couponService'

function fmt(n) {
  return (n || 0).toLocaleString('vi-VN') + 'đ'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('vi-VN')
}

function valueLabel(c) {
  return c.discountType === 'PERCENT' ? `Giảm ${c.discountValue}%` : `Giảm ${fmt(c.discountValue)}`
}

const STATUS_LABELS = {
  ACTIVE: { label: 'Còn hiệu lực', color: 'var(--ok)', bg: 'rgba(34,197,94,0.08)' },
  USED: { label: 'Đã dùng', color: 'var(--t3)', bg: 'var(--s2)' },
  EXPIRED: { label: 'Hết hạn', color: 'var(--err)', bg: 'rgba(239,68,68,0.08)' },
}

export default function CouponsSection() {
  const [tab, setTab] = useState('available')
  const [available, setAvailable] = useState([])
  const [mine, setMine] = useState([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(null)
  const [copied, setCopied] = useState(null)
  const [error, setError] = useState('')

  const fetchAll = useCallback(() => {
    setLoading(true)
    Promise.all([
      couponService.getAvailableCoupons().catch(() => []),
      couponService.getMyCoupons().catch(() => []),
    ])
      .then(([avail, my]) => {
        setAvailable(avail ?? [])
        setMine(my ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleClaim = async (coupon) => {
    setClaiming(coupon.id)
    setError('')
    try {
      await couponService.claimCoupon(coupon.id)
      fetchAll()
    } catch (err) {
      setError(err.message || 'Không lưu được mã giảm giá.')
    } finally {
      setClaiming(null)
    }
  }

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(code)
    setTimeout(() => setCopied(null), 1800)
  }

  const activeMineCount = mine.filter(c => c.status === 'ACTIVE').length
  const usedMineCount = mine.filter(c => c.status === 'USED').length
  const expiredMineCount = mine.filter(c => c.status === 'EXPIRED').length

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Mã còn hiệu lực', value: activeMineCount, color: 'var(--ok)', bg: 'rgba(34,197,94,0.06)', border: 'rgba(34,197,94,0.2)' },
          { label: 'Mã đã sử dụng', value: usedMineCount, color: 'var(--t2)', bg: 'var(--s1)', border: 'var(--b1)' },
          { label: 'Mã hết hạn', value: expiredMineCount, color: 'var(--t3)', bg: 'var(--s1)', border: 'var(--b1)' },
        ].map((s, i) => (
          <div key={i} className="rounded border px-5 py-4 text-center" style={{ backgroundColor: s.bg, borderColor: s.border }}>
            <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-semibold mt-1" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '16px' }} className="overflow-hidden shadow-sm">
        {/* Tabs */}
        <div className="flex items-center px-2 pt-2 gap-1" style={{ borderBottom: '1px solid var(--b1)' }}>
          {[
            { id: 'available', label: 'Kho mã giảm giá', count: available.length },
            { id: 'mine', label: 'Mã của tôi', count: mine.length },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap bg-transparent cursor-pointer"
              style={{ borderBottomColor: tab === t.id ? 'var(--accent)' : 'transparent', color: tab === t.id ? 'var(--accent)' : 'var(--t3)' }}
            >
              {t.label}
              <span className="ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--s2)', color: 'var(--t2)' }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <div className="mx-5 mt-4 px-4 py-2.5 text-xs font-semibold rounded" style={{ backgroundColor: 'rgba(239,68,68,0.06)', color: 'var(--err)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-5 grid grid-cols-1 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded animate-pulse" style={{ backgroundColor: 'var(--s1)' }} />
            ))}
          </div>
        ) : tab === 'available' ? (
          available.length === 0 ? (
            <EmptyState text="Hiện chưa có mã giảm giá nào để lưu." />
          ) : (
            <div className="p-5 grid grid-cols-1 gap-4">
              {available.map(coupon => (
                <div key={coupon.id} className="rounded overflow-hidden border transition-shadow hover:shadow-md" style={{ borderColor: 'var(--b1)' }}>
                  <div className="flex">
                    <div className="w-3 shrink-0" style={{ background: 'linear-gradient(180deg, var(--accent-h), var(--accent-d))' }} />
                    <div className="flex-1 flex items-stretch">
                      <div className="flex-1 px-5 py-4">
                        <span className="inline-block text-xs font-black px-2.5 py-1 rounded mb-2" style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--accent)' }}>
                          {valueLabel(coupon)}
                        </span>
                        <p className="text-sm font-bold leading-snug" style={{ color: 'var(--t1)' }}>{coupon.name}</p>
                        {coupon.description && <p className="text-xs mt-1" style={{ color: 'var(--t3)' }}>{coupon.description}</p>}
                        <div className="flex items-center gap-3 mt-2.5 text-xs flex-wrap" style={{ color: 'var(--t3)' }}>
                          {coupon.minOrderAmount > 0 && (
                            <span>Đơn tối thiểu: <span className="font-semibold" style={{ color: 'var(--t2)' }}>{fmt(coupon.minOrderAmount)}</span></span>
                          )}
                          <span>HSD: <span className="font-semibold" style={{ color: 'var(--t2)' }}>{formatDate(coupon.endAt)}</span></span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="h-full w-px mx-1" style={{ borderLeft: '1px dashed var(--b1)' }} />
                        <div className="px-5 py-4 flex flex-col items-center justify-center gap-2.5 min-w-[120px]">
                          <span className="font-mono text-sm font-black tracking-widest" style={{ color: 'var(--t1)' }}>{coupon.code}</span>
                          {coupon.claimed ? (
                            <span className="text-xs font-bold px-4 py-1.5 rounded" style={{ backgroundColor: 'var(--s2)', color: 'var(--t3)' }}>Đã lưu</span>
                          ) : (
                            <button
                              onClick={() => handleClaim(coupon)}
                              disabled={claiming === coupon.id}
                              className="text-xs font-bold px-4 py-1.5 rounded transition-all border-none cursor-pointer text-white disabled:opacity-50"
                              style={{ backgroundColor: 'var(--accent)' }}
                            >
                              {claiming === coupon.id ? 'Đang lưu...' : 'Lưu mã'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : mine.length === 0 ? (
          <EmptyState text="Bạn chưa lưu mã giảm giá nào." />
        ) : (
          <>
            <div className="p-5 grid grid-cols-1 gap-4">
              {mine.map(coupon => {
                const st = STATUS_LABELS[coupon.status] || STATUS_LABELS.EXPIRED
                const isInactive = coupon.status !== 'ACTIVE'
                return (
                  <div key={coupon.id} className="rounded overflow-hidden border transition-shadow" style={{ borderColor: 'var(--b1)', opacity: isInactive ? 0.65 : 1 }}>
                    <div className="flex">
                      <div className="w-3 shrink-0" style={{ background: isInactive ? 'var(--b2)' : 'linear-gradient(180deg, var(--accent-h), var(--accent-d))' }} />
                      <div className="flex-1 flex items-stretch">
                        <div className="flex-1 px-5 py-4">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-xs font-black px-2.5 py-1 rounded" style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--accent)' }}>
                              {valueLabel(coupon)}
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: st.bg, color: st.color }}>{st.label}</span>
                          </div>
                          <p className="text-sm font-bold leading-snug" style={{ color: 'var(--t1)' }}>{coupon.name}</p>
                          {coupon.description && <p className="text-xs mt-1" style={{ color: 'var(--t3)' }}>{coupon.description}</p>}
                          <div className="flex items-center gap-3 mt-2.5 text-xs" style={{ color: 'var(--t3)' }}>
                            <span>HSD: <span className="font-semibold" style={{ color: 'var(--t2)' }}>{formatDate(coupon.endAt)}</span></span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="h-full w-px mx-1" style={{ borderLeft: '1px dashed var(--b1)' }} />
                          <div className="px-5 py-4 flex flex-col items-center justify-center gap-2.5 min-w-[120px]">
                            <span className="font-mono text-sm font-black tracking-widest" style={{ color: 'var(--t1)' }}>{coupon.code}</span>
                            {!isInactive ? (
                              <button
                                onClick={() => handleCopy(coupon.code)}
                                className="text-xs font-bold px-4 py-1.5 rounded transition-all border-none cursor-pointer text-white"
                                style={{ backgroundColor: copied === coupon.code ? 'var(--ok)' : 'var(--accent)' }}
                              >
                                {copied === coupon.code ? '✓ Đã sao chép' : 'Sao chép'}
                              </button>
                            ) : (
                              <span className="text-xs font-medium" style={{ color: 'var(--t3)' }}>Không khả dụng</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="px-5 pb-5">
              <p className="text-xs text-center rounded py-3" style={{ color: 'var(--t3)', backgroundColor: 'var(--s1)' }}>
                Mã giảm giá cần nhập thủ công tại trang <span className="font-semibold" style={{ color: 'var(--t2)' }}>Xác nhận đặt hàng</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div className="py-16 text-center" style={{ color: 'var(--t3)' }}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'var(--s1)' }}>
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
        </svg>
      </div>
      <p className="text-sm font-medium">{text}</p>
    </div>
  )
}
