import { useMembershipSection } from '../hooks/useMembershipSection'

const TIER_DISPLAY = {
  STANDARD: { label: 'Thành viên', color: 'bg-gray-400',   ring: 'ring-gray-300',   text: 'text-gray-600'   },
  BRONZE:   { label: 'Đồng',       color: 'bg-amber-700',  ring: 'ring-amber-400',  text: 'text-amber-800'  },
  SILVER:   { label: 'Bạc',        color: 'bg-slate-400',  ring: 'ring-slate-300',  text: 'text-slate-600'  },
  GOLD:     { label: 'Vàng',       color: 'bg-amber-400',  ring: 'ring-amber-300',  text: 'text-amber-600'  },
  DIAMOND:  { label: 'Kim Cương',  color: 'bg-purple-600', ring: 'ring-purple-300', text: 'text-purple-700' },
}

function formatVnd(value) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ'
}

export default function MembershipSection() {
  const { data, tiers, loading, error } = useMembershipSection()

  if (loading) {
    return <div className="bg-white rounded border border-gray-200 py-16 text-center text-gray-400 text-sm">Đang tải dữ liệu...</div>
  }
  if (error || !data) {
    return <div className="bg-red-50 border border-red-200 rounded px-5 py-4 text-red-600 text-sm">{error || 'Không thể tải thông tin hạng thành viên'}</div>
  }

  const display = TIER_DISPLAY[data.tier] || TIER_DISPLAY.STANDARD
  const nextDisplay = data.nextTier ? (TIER_DISPLAY[data.nextTier] || TIER_DISPLAY.STANDARD) : null
  const pct = data.nextTierMinSpending
    ? Math.min(100, Math.round((data.totalSpent / data.nextTierMinSpending) * 100))
    : 100
  const currentIndex = tiers.findIndex(t => t.tier === data.tier)

  return (
    <div className="space-y-5">
      {/* ── Current tier hero card ── */}
      <div className="rounded overflow-hidden shadow-sm border border-gray-200">
        <div className="bg-gradient-to-br from-[#0D0F14] via-gray-800 to-gray-900 px-8 py-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-white/70 mb-1">Hạng thành viên hiện tại</p>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl font-black text-white">{display.label}</span>
              </div>
              <p className="text-sm text-white/60 mt-1">Tổng chi tiêu tích lũy: <span className="font-bold text-white">{formatVnd(data.totalSpent)}</span></p>
            </div>
            <div className="text-right">
              <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>

          {nextDisplay ? (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-white/80">Tiến trình lên hạng <span className="text-white font-black">{nextDisplay.label}</span></p>
                <span className="text-sm font-black text-white">{pct}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div className="bg-white h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-white/60 mt-2">
                Cần thêm <span className="font-black text-white">{formatVnd(data.amountToNextTier)}</span> chi tiêu để lên hạng {nextDisplay.label}
              </p>
            </div>
          ) : (
            <p className="mt-6 text-sm text-white/70">Bạn đang ở hạng thành viên cao nhất 🎉</p>
          )}
        </div>

        {/* Benefits summary strip */}
        <div className="bg-white px-8 py-4 flex flex-wrap items-center gap-6 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-[#E8420A] font-semibold">
            <span className="w-9 h-9 rounded bg-orange-50 border border-orange-100 flex items-center justify-center text-xs font-black">{data.discountPercentage}%</span>
            Giảm giá mỗi đơn
          </div>
          {data.freeShipping && (
            <div className="flex items-center gap-2 text-sm text-[#E8420A] font-semibold">
              <span className="w-9 h-9 rounded bg-orange-50 border border-orange-100 flex items-center justify-center text-xs font-black">🚀</span>
              Miễn phí vận chuyển
            </div>
          )}
        </div>
      </div>

      {/* ── Tier roadmap ── */}
      <div className="bg-white rounded border border-gray-200 p-6 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-5">Lộ trình hạng thành viên</h3>
        <div className="relative">
          <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 z-0" />
          <div className="flex items-start justify-between relative z-10">
            {tiers.map((tier, i) => {
              const tDisplay = TIER_DISPLAY[tier.tier] || TIER_DISPLAY.STANDARD
              const isActive = tier.tier === data.tier
              const isPast   = currentIndex >= 0 && i < currentIndex
              return (
                <div key={tier.tier} className="flex flex-col items-center gap-2 w-1/5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black border-2
                    ${isActive ? `${tDisplay.color} text-white border-transparent ring-4 ${tDisplay.ring} shadow-md`
                      : isPast  ? `${tDisplay.color} text-white border-transparent opacity-80`
                      : 'bg-white border-gray-300 text-gray-400'}`}
                  >
                    {isPast || isActive ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs font-bold text-center ${isActive ? tDisplay.text : isPast ? 'text-gray-500' : 'text-gray-400'}`}>
                    {tDisplay.label}
                  </span>
                  {tier.minSpending > 0 && (
                    <span className="text-[10px] text-gray-400 text-center leading-tight">
                      {(tier.minSpending / 1000000).toFixed(0)}tr đ
                    </span>
                  )}
                  {isActive && <span className="text-[10px] font-black text-[#E8420A] bg-orange-50 px-1.5 py-0.5 rounded">Của bạn</span>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Benefits detail ── */}
      <div className="bg-white rounded border border-gray-200 p-6 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-5">Quyền lợi hạng {display.label}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-start gap-3 p-3.5 rounded bg-orange-50/50 border border-orange-100">
            <div className="w-6 h-6 rounded-full bg-[#E8420A] flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-800 leading-snug">Giảm {data.discountPercentage}% giá trị mỗi đơn hàng</p>
          </div>
          {data.freeShipping && (
            <div className="flex items-start gap-3 p-3.5 rounded bg-orange-50/50 border border-orange-100">
              <div className="w-6 h-6 rounded-full bg-[#E8420A] flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-800 leading-snug">Miễn phí vận chuyển mọi đơn hàng</p>
            </div>
          )}
        </div>
        {data.description && (
          <div className="mt-4 p-4 rounded bg-gray-50 border border-gray-200">
            <p className="text-sm text-gray-700">{data.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}
