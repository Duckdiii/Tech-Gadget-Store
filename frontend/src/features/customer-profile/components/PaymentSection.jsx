import { useState, useEffect, useCallback } from 'react'
import { paymentPreferenceService } from '../services/paymentPreferenceService'

const METHOD_STYLE = {
  MOMO: { label: 'MoMo', desc: 'Ví điện tử phổ biến nhất Việt Nam', gradient: 'linear-gradient(135deg, #a1005c, #d6249f)' },
  VNPAY: { label: 'VNPay', desc: 'Thanh toán qua QR code / cổng VNPay', gradient: 'linear-gradient(135deg, #d32f2f, #1976d2)' },
  COD: { label: 'Thanh toán khi nhận hàng', desc: 'Trả tiền mặt cho shipper khi nhận hàng', gradient: 'linear-gradient(135deg, #16a34a, #059669)' },
}

export default function PaymentSection() {
  const [available, setAvailable] = useState([])
  const [preferred, setPreferred] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')

  const fetchData = useCallback(() => {
    setLoading(true)
    paymentPreferenceService.getPreferredMethod()
      .then(data => {
        setAvailable(data.available ?? [])
        setPreferred(data.preferred ?? null)
      })
      .catch(() => setError('Không tải được danh sách phương thức thanh toán.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200) }

  const handleSelect = async (method) => {
    if (method.type === preferred) return
    setSaving(method.type)
    setError('')
    try {
      const data = await paymentPreferenceService.updatePreferredMethod(method.type)
      setPreferred(data.preferred)
      showToast(`Đã đặt ${METHOD_STYLE[method.type]?.label || method.name} làm phương thức mặc định.`)
    } catch (err) {
      setError(err.message || 'Không cập nhật được lựa chọn, vui lòng thử lại.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-5">
      {toast && (
        <div className="flex items-center gap-2 text-sm font-semibold px-5 py-3 rounded shadow-sm" style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: 'var(--ok)' }}>
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          {toast}
        </div>
      )}

      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '16px' }} className="overflow-hidden shadow-sm">
        <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--b1)' }}>
          <h2 className="text-base font-bold" style={{ color: 'var(--t1)' }}>Phương thức thanh toán ưu tiên</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--t3)' }}>Chọn 1 cổng thanh toán để dùng làm mặc định — không cần lưu thông tin thẻ.</p>
        </div>

        {error && (
          <div className="mx-6 mt-4 px-4 py-2.5 text-xs font-semibold rounded" style={{ backgroundColor: 'rgba(239,68,68,0.06)', color: 'var(--err)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded animate-pulse" style={{ backgroundColor: 'var(--s1)' }} />)}
          </div>
        ) : available.length === 0 ? (
          <div className="py-16 text-center" style={{ color: 'var(--t3)' }}>
            <p className="text-sm font-medium">Hiện chưa có cổng thanh toán nào khả dụng.</p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 gap-3">
            {available.map(method => {
              const style = METHOD_STYLE[method.type] || { label: method.name, desc: method.description, gradient: 'linear-gradient(135deg, var(--t2), var(--t3))' }
              const isSelected = preferred === method.type
              return (
                <button
                  key={method.id}
                  onClick={() => handleSelect(method)}
                  disabled={saving === method.type}
                  className="flex items-center gap-4 px-5 py-4 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-60"
                  style={{
                    borderColor: isSelected ? 'var(--accent)' : 'var(--b1)',
                    backgroundColor: isSelected ? 'var(--accent-dim)' : 'var(--card)',
                  }}
                >
                  <div className="w-12 h-12 rounded-lg shrink-0 flex items-center justify-center text-white text-xs font-black shadow-sm" style={{ background: style.gradient }}>
                    {style.label.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: 'var(--t1)' }}>{style.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>{style.desc}</p>
                  </div>
                  <div className="shrink-0">
                    {saving === method.type ? (
                      <span className="text-xs font-semibold" style={{ color: 'var(--t3)' }}>Đang lưu...</span>
                    ) : isSelected ? (
                      <span className="flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        Đang dùng
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-3 py-1.5 rounded-full border" style={{ borderColor: 'var(--b1)', color: 'var(--t2)' }}>Chọn</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="rounded px-5 py-4 flex items-start gap-3" style={{ backgroundColor: 'var(--s1)', border: '1px solid var(--b1)' }}>
        <svg className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--t2)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        <div>
          <p className="text-xs font-bold mb-0.5" style={{ color: 'var(--t1)' }}>Vì sao không có mục "Thêm thẻ"?</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--t2)' }}>
            Để bảo vệ bạn khỏi rủi ro lộ thông tin thẻ, hệ thống không lưu trữ số thẻ hay mã CVV ở bất kỳ đâu. Bạn chỉ chọn cổng thanh toán ưu tiên tại đây — việc nhập thẻ (nếu có) luôn diễn ra trực tiếp và an toàn trên trang của ngân hàng/ví điện tử khi thanh toán.
          </p>
        </div>
      </div>
    </div>
  )
}
