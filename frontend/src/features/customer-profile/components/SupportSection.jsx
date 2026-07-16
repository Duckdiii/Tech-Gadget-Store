import { useState, useEffect, useCallback } from 'react'
import { supportService } from '../services/supportService'

const FAQ_DATA = [
  {
    id: 'order', category: 'Đơn hàng & Giao hàng',
    items: [
      { q: 'Tôi có thể theo dõi đơn hàng của mình ở đâu?', a: 'Bạn có thể theo dõi đơn hàng trong mục "Lịch sử mua hàng" trên trang hồ sơ cá nhân hoặc qua email xác nhận đơn hàng.' },
      { q: 'Thời gian giao hàng tiêu chuẩn là bao lâu?', a: 'Nội thành Hà Nội & TP.HCM: 2–4 giờ (giao hỏa tốc) hoặc 1–2 ngày (tiêu chuẩn). Các tỉnh thành khác: 2–5 ngày làm việc tùy khu vực.' },
      { q: 'Tôi có thể thay đổi địa chỉ giao hàng sau khi đặt không?', a: 'Bạn có thể thay đổi địa chỉ trong vòng 30 phút sau khi đặt hàng, với điều kiện đơn chưa được xác nhận bởi kho. Liên hệ hotline để được hỗ trợ nhanh nhất.' },
      { q: 'Phí vận chuyển được tính như thế nào?', a: 'Miễn phí vận chuyển cho đơn từ 500.000đ. Đơn dưới 500.000đ phí từ 20.000–40.000đ tùy khu vực.' },
    ],
  },
  {
    id: 'payment', category: 'Thanh toán',
    items: [
      { q: 'Các phương thức thanh toán nào được chấp nhận?', a: 'Chúng tôi chấp nhận ví MoMo, VNPay, và thanh toán khi nhận hàng (COD).' },
      { q: 'Thanh toán có an toàn không?', a: 'Hoàn toàn an toàn — giao dịch được xử lý qua cổng thanh toán của đối tác, hệ thống không lưu trữ số thẻ hay CVV của bạn.' },
    ],
  },
  {
    id: 'return', category: 'Đổi trả & Bảo hành',
    items: [
      { q: 'Chính sách đổi trả của cửa hàng như thế nào?', a: '15 ngày đổi trả miễn phí kể từ ngày nhận hàng nếu sản phẩm còn nguyên seal, đầy đủ phụ kiện và hóa đơn.' },
      { q: 'Sản phẩm của tôi bị lỗi, tôi cần làm gì?', a: 'Chụp ảnh/quay video sản phẩm lỗi, gửi yêu cầu hỗ trợ ở tab "Gửi yêu cầu". Đội ngũ kỹ thuật sẽ liên hệ trong vòng 24 giờ làm việc.' },
    ],
  },
  {
    id: 'account', category: 'Tài khoản & Thành viên',
    items: [
      { q: 'Điểm thành viên được tích lũy như thế nào?', a: 'Hạng thành viên dựa trên tổng chi tiêu tích lũy — xem chi tiết ở tab "Hạng thành viên & ưu đãi".' },
      { q: 'Tài khoản của tôi bị khóa, tôi phải làm gì?', a: 'Gửi yêu cầu hỗ trợ kèm thông tin xác minh, đội ngũ hỗ trợ sẽ xử lý trong 1–2 ngày làm việc.' },
    ],
  },
]

const SUPPORT_CATEGORIES = ['Đơn hàng & Giao hàng', 'Thanh toán', 'Đổi trả & Bảo hành', 'Khuyến mãi', 'Tài khoản', 'Sản phẩm & Tư vấn', 'Khác']

const TICKET_STATUS = {
  OPEN: { label: 'Mới', color: 'var(--accent)', bg: 'var(--accent-dim)' },
  IN_PROGRESS: { label: 'Đang xử lý', color: 'var(--warn)', bg: 'rgba(245,158,11,0.08)' },
  RESOLVED: { label: 'Đã giải quyết', color: 'var(--ok)', bg: 'rgba(34,197,94,0.08)' },
  CLOSED: { label: 'Đã đóng', color: 'var(--t3)', bg: 'var(--s2)' },
}

function FaqAccordion({ items }) {
  const [open, setOpen] = useState(null)
  return (
    <div className="divide-y" style={{ borderColor: 'var(--b1)' }}>
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors bg-transparent border-none cursor-pointer"
          >
            <span className="text-sm font-semibold pr-4 leading-snug" style={{ color: open === i ? 'var(--accent)' : 'var(--t1)' }}>{item.q}</span>
            <svg className="w-5 h-5 shrink-0 transition-transform duration-200" style={{ color: open === i ? 'var(--accent)' : 'var(--t3)', transform: open === i ? 'rotate(180deg)' : 'none' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {open === i && (
            <div className="px-5 pb-5">
              <p className="text-sm leading-relaxed rounded px-4 py-3" style={{ color: 'var(--t2)', backgroundColor: 'var(--s1)', border: '1px solid var(--b1)' }}>{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function SupportSection() {
  const [tab, setTab] = useState('faq')
  const [faqCat, setFaqCat] = useState('order')
  const [tickets, setTickets] = useState([])
  const [ticketsLoading, setTicketsLoading] = useState(true)
  const [ticketFilter, setTicketFilter] = useState('all')

  const FORM_BLANK = { subject: '', category: '', message: '' }
  const [form, setForm] = useState(FORM_BLANK)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const fetchTickets = useCallback(() => {
    setTicketsLoading(true)
    supportService.getMyTickets()
      .then(data => setTickets(data ?? []))
      .catch(() => setTickets([]))
      .finally(() => setTicketsLoading(false))
  }, [])

  useEffect(() => { fetchTickets() }, [fetchTickets])

  const setF = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  const validateForm = () => {
    const e = {}
    if (!form.subject.trim()) e.subject = 'Vui lòng nhập tiêu đề'
    if (!form.category) e.category = 'Vui lòng chọn danh mục'
    if (form.message.trim().length < 20) e.message = 'Mô tả tối thiểu 20 ký tự'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    setSubmitting(true)
    setSubmitError('')
    try {
      await supportService.createTicket(form.subject.trim(), form.category, form.message.trim())
      setForm(FORM_BLANK)
      setSubmitted(true)
      fetchTickets()
      setTimeout(() => { setSubmitted(false); setTab('tickets') }, 1800)
    } catch (err) {
      setSubmitError(err.message || 'Không gửi được yêu cầu, vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  const activeFaq = FAQ_DATA.find(c => c.id === faqCat)
  const filtTickets = ticketFilter === 'all' ? tickets : tickets.filter(t => t.status === ticketFilter)
  const openCount = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length

  return (
    <div className="space-y-5">
      {/* Contact channels — kênh thật, hoạt động thật */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a href="tel:18001234" className="rounded p-5 flex flex-col gap-3 no-underline" style={{ backgroundColor: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <div className="w-11 h-11 rounded text-white flex items-center justify-center shadow-sm" style={{ backgroundColor: '#16a34a' }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--t3)' }}>Hotline</p>
            <p className="text-sm font-black mt-0.5" style={{ color: 'var(--t1)' }}>1800 1234</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>Miễn phí · 8:00–22:00</p>
          </div>
        </a>
        <a href="mailto:support@techgadget.vn" className="rounded p-5 flex flex-col gap-3 no-underline" style={{ backgroundColor: 'var(--s1)', border: '1px solid var(--b1)' }}>
          <div className="w-11 h-11 rounded text-white flex items-center justify-center shadow-sm" style={{ backgroundColor: 'var(--t2)' }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--t3)' }}>Email</p>
            <p className="text-sm font-black mt-0.5" style={{ color: 'var(--t1)' }}>support@techgadget.vn</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>Phản hồi trong 24 giờ</p>
          </div>
        </a>
      </div>

      {/* Main panel */}
      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '16px' }} className="shadow-sm overflow-hidden">
        <div className="flex items-center px-2 pt-2 gap-1" style={{ borderBottom: '1px solid var(--b1)' }}>
          {[
            { id: 'faq', label: 'Câu hỏi thường gặp' },
            { id: 'new', label: 'Gửi yêu cầu' },
            { id: 'tickets', label: 'Lịch sử phiếu', badge: openCount },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap bg-transparent cursor-pointer"
              style={{ borderBottomColor: tab === t.id ? 'var(--accent)' : 'transparent', color: tab === t.id ? 'var(--accent)' : 'var(--t3)' }}
            >
              {t.label}
              {t.badge > 0 && (
                <span className="text-xs font-black px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--accent)' }}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* FAQ TAB */}
        {tab === 'faq' && (
          <div>
            <div className="flex items-center gap-2 px-6 py-4 overflow-x-auto" style={{ borderBottom: '1px solid var(--b1)' }}>
              {FAQ_DATA.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFaqCat(cat.id)}
                  className="shrink-0 px-4 py-2 rounded text-xs font-bold transition-colors border-none cursor-pointer"
                  style={faqCat === cat.id ? { backgroundColor: 'var(--accent)', color: 'white' } : { backgroundColor: 'var(--s2)', color: 'var(--t2)' }}
                >
                  {cat.category}
                </button>
              ))}
            </div>
            {activeFaq && <FaqAccordion items={activeFaq.items} />}
            <div className="px-6 py-5 flex items-center justify-between" style={{ backgroundColor: 'var(--s1)', borderTop: '1px solid var(--b1)' }}>
              <p className="text-sm" style={{ color: 'var(--t3)' }}>Không tìm thấy câu trả lời bạn cần?</p>
              <button onClick={() => setTab('new')} className="text-sm font-bold flex items-center gap-1.5 transition-colors border-none bg-transparent cursor-pointer" style={{ color: 'var(--accent)' }}>
                Gửi yêu cầu hỗ trợ
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* NEW TICKET TAB */}
        {tab === 'new' && (
          <div className="p-7">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5 shadow-sm" style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}>
                  <svg className="w-10 h-10" style={{ color: 'var(--ok)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-xl font-black" style={{ color: 'var(--t1)' }}>Đã gửi yêu cầu!</h3>
                <p className="text-sm mt-2" style={{ color: 'var(--t3)' }}>Chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.</p>
              </div>
            ) : (
              <div className="space-y-5 max-w-2xl">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--t2)' }}>Tiêu đề yêu cầu <span style={{ color: 'var(--err)' }}>*</span></label>
                  <input
                    value={form.subject}
                    onChange={setF('subject')}
                    placeholder="Mô tả ngắn gọn vấn đề bạn gặp phải..."
                    className="w-full rounded px-4 py-2.5 text-sm focus:outline-none transition-colors"
                    style={{ border: `1px solid ${formErrors.subject ? 'var(--err)' : 'var(--b1)'}`, backgroundColor: formErrors.subject ? 'rgba(239,68,68,0.04)' : 'var(--card)' }}
                  />
                  {formErrors.subject && <p className="text-xs mt-1" style={{ color: 'var(--err)' }}>{formErrors.subject}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--t2)' }}>Danh mục <span style={{ color: 'var(--err)' }}>*</span></label>
                  <select
                    value={form.category}
                    onChange={setF('category')}
                    className="w-full rounded px-4 py-2.5 text-sm focus:outline-none transition-colors"
                    style={{ border: `1px solid ${formErrors.category ? 'var(--err)' : 'var(--b1)'}`, backgroundColor: formErrors.category ? 'rgba(239,68,68,0.04)' : 'var(--card)' }}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {SUPPORT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {formErrors.category && <p className="text-xs mt-1" style={{ color: 'var(--err)' }}>{formErrors.category}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--t2)' }}>Nội dung chi tiết <span style={{ color: 'var(--err)' }}>*</span></label>
                  <textarea
                    value={form.message}
                    onChange={setF('message')}
                    rows={6}
                    placeholder="Mô tả chi tiết vấn đề bạn gặp phải: thời gian xảy ra, mã đơn hàng liên quan (nếu có), các bước đã thực hiện..."
                    className="w-full rounded px-4 py-3 text-sm focus:outline-none transition-colors resize-none leading-relaxed"
                    style={{ border: `1px solid ${formErrors.message ? 'var(--err)' : 'var(--b1)'}`, backgroundColor: formErrors.message ? 'rgba(239,68,68,0.04)' : 'var(--card)' }}
                  />
                  <div className="flex items-center justify-between mt-1">
                    {formErrors.message ? <p className="text-xs" style={{ color: 'var(--err)' }}>{formErrors.message}</p> : <p className="text-xs" style={{ color: 'var(--t3)' }}>Tối thiểu 20 ký tự</p>}
                    <p className="text-xs font-medium" style={{ color: form.message.length >= 20 ? 'var(--ok)' : 'var(--t3)' }}>{form.message.length} ký tự</p>
                  </div>
                </div>

                {submitError && (
                  <p className="text-xs font-semibold px-4 py-2.5 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.06)', color: 'var(--err)', border: '1px solid rgba(239,68,68,0.2)' }}>{submitError}</p>
                )}

                <div className="flex items-center justify-end pt-2">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-7 py-2.5 text-sm font-bold text-white rounded shadow-sm transition-colors border-none cursor-pointer disabled:opacity-50"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TICKETS TAB */}
        {tab === 'tickets' && (
          <div>
            <div className="flex items-center gap-2 px-6 py-4 overflow-x-auto" style={{ borderBottom: '1px solid var(--b1)' }}>
              {[
                { id: 'all', label: 'Tất cả', count: tickets.length },
                { id: 'OPEN', label: 'Mới', count: tickets.filter(t => t.status === 'OPEN').length },
                { id: 'IN_PROGRESS', label: 'Đang xử lý', count: tickets.filter(t => t.status === 'IN_PROGRESS').length },
                { id: 'RESOLVED', label: 'Đã giải quyết', count: tickets.filter(t => t.status === 'RESOLVED').length },
                { id: 'CLOSED', label: 'Đã đóng', count: tickets.filter(t => t.status === 'CLOSED').length },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setTicketFilter(f.id)}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded text-xs font-bold transition-colors border-none cursor-pointer"
                  style={ticketFilter === f.id ? { backgroundColor: 'var(--accent)', color: 'white' } : { backgroundColor: 'var(--s2)', color: 'var(--t2)' }}
                >
                  {f.label}
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black" style={ticketFilter === f.id ? { backgroundColor: 'rgba(255,255,255,0.25)', color: 'white' } : { backgroundColor: 'var(--card)', color: 'var(--t3)' }}>{f.count}</span>
                </button>
              ))}
              <button onClick={() => setTab('new')} className="shrink-0 flex items-center gap-1.5 ml-auto px-4 py-2 text-xs font-bold rounded transition-colors cursor-pointer" style={{ color: 'var(--accent)', border: '1px solid rgba(232,66,10,0.25)', backgroundColor: 'var(--card)' }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                Tạo phiếu mới
              </button>
            </div>

            {ticketsLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(2)].map((_, i) => <div key={i} className="h-20 rounded animate-pulse" style={{ backgroundColor: 'var(--s1)' }} />)}
              </div>
            ) : filtTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--s1)' }}>
                  <svg className="w-7 h-7" style={{ color: 'var(--t3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--t2)' }}>Không có phiếu nào</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--b1)' }}>
                {filtTickets.map(ticket => {
                  const st = TICKET_STATUS[ticket.status] || TICKET_STATUS.OPEN
                  return (
                    <div key={ticket.id} className="px-6 py-5">
                      <div className="flex items-start gap-4">
                        <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: st.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="text-xs font-black font-mono" style={{ color: 'var(--t3)' }}>#{ticket.id.slice(0, 8)}</span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: st.color, backgroundColor: st.bg }}>{st.label}</span>
                          </div>
                          <p className="text-sm font-bold leading-snug" style={{ color: 'var(--t1)' }}>{ticket.subject}</p>
                          <p className="text-xs mt-1.5" style={{ color: 'var(--t3)' }}>{ticket.category} · Tạo lúc {new Date(ticket.createdAt).toLocaleDateString('vi-VN')}</p>
                          {ticket.message && <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--t2)' }}>{ticket.message}</p>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
