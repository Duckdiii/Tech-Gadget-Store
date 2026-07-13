import StoreNavbar from '../../../components/StoreNavbar'
import { useRecommendationExperiment } from '../hooks/useRecommendationExperiment'

const VARIANT_LABELS = {
  MF: 'Matrix Factorization (ML)',
  RULE_BASED_HOLDOUT: 'Rule-based (nhóm đối chứng)',
}

export default function RecommendationExperimentPage() {
  const { data, loading } = useRecommendationExperiment()

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
        <StoreNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--accent)' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50 text-gray-800">
      <StoreNavbar />

      <div className="flex-1 px-8 py-7 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">A/B Test — "Dành cho bạn"</h1>
          <p className="text-sm text-gray-500 mt-1">
            So sánh tỉ lệ khách bấm vào gợi ý (click-through rate) giữa model Matrix Factorization
            và nhóm đối chứng vẫn dùng rule-based, đo trên hành vi thật — không phải backtest offline.
          </p>
        </div>

        <div className="bg-white rounded border border-gray-200">
          <div className="grid grid-cols-4 gap-3 px-5 py-3 border-b border-gray-100">
            {['VARIANT', 'LƯỢT HIỆN', 'LƯỢT BẤM', 'CTR'].map((h) => (
              <span key={h} className="text-xs font-bold text-gray-400 tracking-wider uppercase text-left last:text-right">
                {h}
              </span>
            ))}
          </div>

          {data.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              Chưa có dữ liệu — cần có khách hàng đã có cache MF ghé "Dành cho bạn" ít nhất 1 lần.
            </div>
          ) : (
            data.map((row) => (
              <div key={row.variant} className="grid grid-cols-4 gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0 items-center text-left">
                <span className="text-sm font-semibold text-gray-800">{VARIANT_LABELS[row.variant] ?? row.variant}</span>
                <span className="text-sm text-gray-700">{row.shownCount.toLocaleString()}</span>
                <span className="text-sm text-gray-700">{row.clickedCount.toLocaleString()}</span>
                <span className="text-sm font-bold text-[#E8420A] text-right">{row.ctr.toFixed(1)}%</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
