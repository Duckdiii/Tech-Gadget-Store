import { useState } from 'react'

const FAQ_DATA = [
  {
    id: 'order', category: 'Đơn hàng & Giao hàng',
    items: [
      { q: 'Tôi có thể theo dõi đơn hàng của mình ở đâu?', a: 'Bạn có thể theo dõi đơn hàng trong mục "Lịch sử mua hàng" trên trang hồ sơ cá nhân hoặc qua email xác nhận đơn hàng. Mã vận đơn sẽ được gửi khi đơn được giao cho đơn vị vận chuyển.' },
      { q: 'Thời gian giao hàng tiêu chuẩn là bao lâu?', a: 'Nội thành Hà Nội & TP.HCM: 2–4 giờ (giao hỏa tốc) hoặc 1–2 ngày (tiêu chuẩn). Các tỉnh thành khác: 2–5 ngày làm việc tùy khu vực.' },
      { q: 'Tôi có thể thay đổi địa chỉ giao hàng sau khi đặt không?', a: 'Bạn có thể thay đổi địa chỉ trong vòng 30 phút sau khi đặt hàng, với điều kiện đơn chưa được xác nhận bởi kho. Liên hệ hotline 1800-1234 để được hỗ trợ nhanh nhất.' },
      { q: 'Phí vận chuyển được tính như thế nào?', a: 'Miễn phí vận chuyển cho đơn từ 500.000đ. Đơn dưới 500.000đ phí từ 20.000–40.000đ tùy khu vực. Thành viên Elite được miễn phí vận chuyển hỏa tốc.' },
    ],
  },
  {
    id: 'payment', category: 'Thanh toán',
    items: [
      { q: 'Các phương thức thanh toán nào được chấp nhận?', a: 'Chúng tôi chấp nhận: Thẻ Visa/Mastercard/JCB, Ví MoMo, ZaloPay, VNPay, và thanh toán khi nhận hàng (COD). Một số phương thức có thể không khả dụng tùy sản phẩm.' },
      { q: 'Thanh toán bằng thẻ có an toàn không?', a: 'Hoàn toàn an toàn. Giao dịch được mã hóa 256-bit SSL theo tiêu chuẩn PCI DSS. Chúng tôi không lưu trữ thông tin CVV của thẻ.' },
      { q: 'Tôi có thể trả góp 0% không?', a: 'Có, sản phẩm từ 3.000.000đ trở lên được hỗ trợ trả góp 0% qua thẻ tín dụng của 15+ ngân hàng đối tác. Chọn "Trả góp" ở bước thanh toán để xem điều kiện cụ thể.' },
    ],
  },
  {
    id: 'return', category: 'Đổi trả & Bảo hành',
    items: [
      { q: 'Chính sách đổi trả của cửa hàng như thế nào?', a: '15 ngày đổi trả miễn phí kể từ ngày nhận hàng nếu sản phẩm còn nguyên seal, đầy đủ phụ kiện và hóa đơn. Đổi máy mới trong 30 ngày nếu sản phẩm lỗi kỹ thuật do nhà sản xuất.' },
      { q: 'Sản phẩm của tôi bị lỗi, tôi cần làm gì?', a: 'Chụp ảnh/quay video sản phẩm lỗi, tạo phiếu yêu cầu trong mục "Hỗ trợ" hoặc gọi hotline 1800-1234. Đội ngũ kỹ thuật sẽ liên hệ trong vòng 24 giờ làm việc.' },
      { q: 'Thời gian bảo hành là bao lâu?', a: 'Tùy theo hãng và sản phẩm: Điện thoại 12–24 tháng, Laptop 12–24 tháng, Phụ kiện 6–12 tháng. Xem chi tiết trong phần "Tra cứu bảo hành" trên hồ sơ.' },
    ],
  },
  {
    id: 'account', category: 'Tài khoản & Thành viên',
    items: [
      { q: 'Điểm thành viên được tích lũy như thế nào?', a: 'Cứ mỗi 100.000đ chi tiêu bạn nhận được 1 điểm. Điểm được cộng sau khi đơn hàng hoàn thành (đã nhận hàng). Thành viên Elite nhân 3x điểm trên mỗi đơn.' },
      { q: 'Làm sao để lên hạng thành viên cao hơn?', a: 'Hạng thành viên dựa trên tổng chi tiêu tích lũy trong năm: Bạc ≥ 5tr, Vàng ≥ 20tr, Elite ≥ 50tr, Elite+ ≥ 100tr. Hạng được cập nhật ngay sau khi đạt ngưỡng.' },
      { q: 'Tài khoản của tôi bị khóa, tôi phải làm gì?', a: 'Liên hệ bộ phận hỗ trợ qua email support@techgadget.vn kèm thông tin xác minh. Thời gian xử lý trong vòng 1–2 ngày làm việc.' },
    ],
  },
]

const TICKETS_INIT = [
  { id: '#TKT-2604001', subject: 'Sản phẩm bị lỗi màn hình sau 3 ngày sử dụng', category: 'Đổi trả & Bảo hành', status: 'processing', priority: 'high',   created: '01/04/2026', lastReply: '03/04/2026', messages: 5 },
  { id: '#TKT-2603002', subject: 'Chưa nhận được hoàn tiền sau khi huỷ đơn',       category: 'Thanh toán',          status: 'resolved',   priority: 'medium', created: '15/03/2026', lastReply: '18/03/2026', messages: 4 },
  { id: '#TKT-2602001', subject: 'Không áp dụng được mã giảm giá ELITE10',         category: 'Khuyến mãi',          status: 'closed',     priority: 'low',    created: '08/02/2026', lastReply: '10/02/2026', messages: 3 },
]

const TICKET_STATUS = {
  open:       { label: 'Mới',            dot: 'bg-[#E8420A]',  text: 'text-[#E8420A]',  bg: 'bg-orange-50 border-orange-200' },
  processing: { label: 'Đang xử lý',    dot: 'bg-orange-400', text: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  resolved:   { label: 'Đã giải quyết', dot: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50 border-green-200'   },
  closed:     { label: 'Đã đóng',       dot: 'bg-gray-400',   text: 'text-gray-600',   bg: 'bg-gray-100 border-gray-200'    },
}

const SUPPORT_CATEGORIES = ['Đơn hàng & Giao hàng', 'Thanh toán', 'Đổi trả & Bảo hành', 'Khuyến mãi', 'Tài khoản', 'Sản phẩm & Tư vấn', 'Khác']

const priorityStyle = {
  low:    { label: 'Thấp',       color: 'bg-gray-100 text-gray-600 border-gray-200'        },
  medium: { label: 'Trung bình', color: 'bg-orange-50 text-[#E8420A] border-orange-200'    },
  high:   { label: 'Cao',        color: 'bg-orange-50 text-orange-700 border-orange-200'   },
  urgent: { label: 'Khẩn',       color: 'bg-red-50 text-red-700 border-red-200'            },
}

function FaqAccordion({ items }) {
  const [open, setOpen] = useState(null)
  return (
    <div className="divide-y divide-gray-100">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50/60 transition-colors bg-transparent border-none cursor-pointer"
          >
            <span className={`text-sm font-semibold pr-4 leading-snug ${open === i ? 'text-[#E8420A]' : 'text-gray-800'}`}>{item.q}</span>
            <svg className={`w-5 h-5 shrink-0 text-gray-400 transition-transform duration-200 ${open === i ? 'rotate-180 text-[#E8420A]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {open === i && (
            <div className="px-5 pb-5">
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 border border-gray-200 rounded px-4 py-3">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function SupportSection() {
  const [tab, setTab]           = useState('faq')
  const [faqCat, setFaqCat]     = useState('order')
  const [tickets, setTickets]   = useState(TICKETS_INIT)
  const [ticketFilter, setTicketFilter] = useState('all')
  const [toast, setToast]       = useState('')

  const FORM_BLANK = { subject: '', category: '', priority: 'medium', message: '', rating: 0 }
  const [form, setForm]         = useState(FORM_BLANK)
  const [formErrors, setFormErrors] = useState({})
  const [submitted, setSubmitted]   = useState(false)
  const [hoverStar, setHoverStar]   = useState(0)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }
  const setF = (k) => (e) => setForm(prev => ({ ...prev, [k]: typeof e === 'object' ? e.target.value : e }))

  const validateForm = () => {
    const e = {}
    if (!form.subject.trim())             e.subject  = 'Vui lòng nhập tiêu đề'
    if (!form.category)                   e.category = 'Vui lòng chọn danh mục'
    if (form.message.trim().length < 20)  e.message  = 'Mô tả tối thiểu 20 ký tự'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return
    const newTicket = {
      id: `#TKT-${Date.now().toString().slice(-7)}`,
      subject: form.subject, category: form.category,
      status: 'open', priority: form.priority,
      created: new Date().toLocaleDateString('vi-VN'),
      lastReply: new Date().toLocaleDateString('vi-VN'),
      messages: 1,
    }
    setTickets(prev => [newTicket, ...prev])
    setForm(FORM_BLANK)
    setSubmitted(true)
    showToast('Gửi yêu cầu thành công! Chúng tôi sẽ phản hồi trong 24 giờ.')
    setTimeout(() => { setSubmitted(false); setTab('tickets') }, 2000)
  }

  const activeFaq   = FAQ_DATA.find(c => c.id === faqCat)
  const filtTickets = ticketFilter === 'all' ? tickets : tickets.filter(t => t.status === ticketFilter)

  return (
    <div className="space-y-5 text-gray-800">
      {toast && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-5 py-3 rounded shadow-sm">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          {toast}
        </div>
      )}

      {/* ── Contact channels ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
            title: 'Hotline', value: '1800 1234', sub: 'Miễn phí · 8:00–22:00', color: 'bg-green-50 border-green-100', iconBg: 'bg-green-600', cta: 'Gọi ngay',
          },
          {
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
            title: 'Email', value: 'support@techgadget.vn', sub: 'Phản hồi trong 24 giờ', color: 'bg-gray-50 border-gray-200', iconBg: 'bg-gray-700', cta: 'Gửi email',
          },
          {
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 3H3a2 2 0 00-2 2v14a2 2 0 002 2h7l4 4 4-4h3a2 2 0 002-2V5a2 2 0 00-2-2z" /></svg>,
            title: 'Live Chat', value: 'Chat trực tuyến', sub: 'Phản hồi dưới 5 phút', color: 'bg-orange-50 border-orange-100', iconBg: 'bg-[#E8420A]', cta: 'Bắt đầu chat',
          },
        ].map((c, i) => (
          <div key={i} className={`rounded border p-5 ${c.color} flex flex-col gap-3`}>
            <div className={`w-11 h-11 rounded ${c.iconBg} text-white flex items-center justify-center shadow-sm`}>{c.icon}</div>
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{c.title}</p>
              <p className="text-sm font-black text-gray-900 mt-0.5">{c.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
            </div>
            <button className="w-full text-xs font-bold text-white py-2 rounded transition-colors shadow-sm bg-[#E8420A] hover:bg-[#c93808] border-none cursor-pointer">{c.cta}</button>
          </div>
        ))}
      </div>

      {/* ── Main panel ── */}
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center border-b border-gray-200 px-2 pt-2 gap-1">
          {[
            { id: 'faq',     label: 'Câu hỏi thường gặp',  icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            { id: 'new',     label: 'Gửi yêu cầu',         icon: 'M12 4v16m8-8H4' },
            { id: 'tickets', label: 'Lịch sử phiếu',       icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', badge: tickets.filter(t => t.status === 'open' || t.status === 'processing').length },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap bg-transparent border-x-0 border-t-0 cursor-pointer ${
                tab === t.id ? 'border-[#E8420A] text-[#E8420A]' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={t.icon} />
              </svg>
              {t.label}
              {t.badge > 0 && (
                <span className={`text-xs font-black px-1.5 py-0.5 rounded ${tab === t.id ? 'bg-orange-100 text-[#E8420A]' : 'bg-orange-100 text-orange-700'}`}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── FAQ TAB ── */}
        {tab === 'faq' && (
          <div>
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 overflow-x-auto">
              {FAQ_DATA.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFaqCat(cat.id)}
                  className={`shrink-0 px-4 py-2 rounded text-xs font-bold transition-colors border-none cursor-pointer ${ faqCat === cat.id ? 'bg-[#E8420A] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200' }`}
                >
                  {cat.category}
                </button>
              ))}
            </div>
            {activeFaq && <FaqAccordion items={activeFaq.items} />}
            <div className="px-6 py-5 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">Không tìm thấy câu trả lời bạn cần?</p>
              <button onClick={() => setTab('new')} className="text-sm font-bold text-[#E8420A] hover:text-[#c93808] flex items-center gap-1.5 transition-colors border-none bg-transparent cursor-pointer">
                Gửi yêu cầu hỗ trợ
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* ── NEW TICKET TAB ── */}
        {tab === 'new' && (
          <div className="p-7">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5 shadow-sm">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-xl font-black text-gray-900">Đã gửi yêu cầu!</h3>
                <p className="text-sm text-gray-500 mt-2">Chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.</p>
                <p className="text-xs text-gray-400 mt-1">Đang chuyển đến lịch sử phiếu...</p>
              </div>
            ) : (
              <div className="space-y-5 max-w-2xl">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Tiêu đề yêu cầu <span className="text-red-500">*</span></label>
                  <input value={form.subject} onChange={setF('subject')} placeholder="Mô tả ngắn gọn vấn đề bạn gặp phải..." className={`w-full border rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[#E8420A] transition-colors ${formErrors.subject ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                  {formErrors.subject && <p className="text-xs text-red-500 mt-1">{formErrors.subject}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Danh mục <span className="text-red-500">*</span></label>
                    <select value={form.category} onChange={setF('category')} className={`w-full border rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[#E8420A] transition-colors ${formErrors.category ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}>
                      <option value="">-- Chọn danh mục --</option>
                      {SUPPORT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {formErrors.category && <p className="text-xs text-red-500 mt-1">{formErrors.category}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Mức độ ưu tiên</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[{ v: 'low', l: 'Thấp' }, { v: 'medium', l: 'Trung bình' }, { v: 'high', l: 'Cao' }, { v: 'urgent', l: 'Khẩn' }].map(p => (
                        <label key={p.v} className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer transition-all text-xs font-bold ${
                          form.priority === p.v
                            ? priorityStyle[p.v].color + ' ring-1 ring-offset-1 ' + (p.v === 'urgent' ? 'ring-red-400' : p.v === 'high' ? 'ring-orange-400' : p.v === 'medium' ? 'ring-[#E8420A]/40' : 'ring-gray-400')
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}>
                          <input type="radio" name="priority" value={p.v} checked={form.priority === p.v} onChange={setF('priority')} className="hidden" />
                          <span className={`w-2 h-2 rounded-full ${form.priority === p.v ? (p.v === 'urgent' ? 'bg-red-500' : p.v === 'high' ? 'bg-orange-500' : p.v === 'medium' ? 'bg-[#E8420A]' : 'bg-gray-400') : 'bg-gray-300'}`} />
                          {p.l}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Nội dung chi tiết <span className="text-red-500">*</span></label>
                  <textarea value={form.message} onChange={setF('message')} rows={6} placeholder="Mô tả chi tiết vấn đề bạn gặp phải: thời gian xảy ra, mã đơn hàng liên quan (nếu có), các bước đã thực hiện..." className={`w-full border rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[#E8420A] transition-colors resize-none leading-relaxed ${formErrors.message ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                  <div className="flex items-center justify-between mt-1">
                    {formErrors.message ? <p className="text-xs text-red-500">{formErrors.message}</p> : <p className="text-xs text-gray-400">Tối thiểu 20 ký tự</p>}
                    <p className={`text-xs font-medium ${form.message.length >= 20 ? 'text-green-600' : 'text-gray-400'}`}>{form.message.length} ký tự</p>
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-200 rounded px-5 py-4 flex items-center gap-4 hover:border-[#E8420A]/40 hover:bg-orange-50/20 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Đính kèm ảnh / video</p>
                    <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, MP4 — tối đa 20MB mỗi file (tối đa 5 file)</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Đánh giá trải nghiệm gần đây <span className="text-gray-400 font-normal">(tuỳ chọn)</span></label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} type="button" onMouseEnter={() => setHoverStar(star)} onMouseLeave={() => setHoverStar(0)} onClick={() => setF('rating')(star)} className="transition-transform hover:scale-110 border-none bg-transparent cursor-pointer">
                        <svg className={`w-7 h-7 transition-colors ${star <= (hoverStar || form.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-200'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    ))}
                    {form.rating > 0 && <span className="text-sm font-semibold text-amber-600 ml-2">{['', 'Rất không hài lòng', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Rất hài lòng'][form.rating]}</span>}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-gray-400">Chúng tôi sẽ phản hồi qua email <span className="font-semibold text-gray-600">alex@example.com</span></p>
                  <button onClick={handleSubmit} className="flex items-center gap-2 px-7 py-2.5 text-sm font-bold text-white bg-[#E8420A] hover:bg-[#c93808] rounded shadow-sm transition-colors border-none cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    Gửi yêu cầu
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TICKETS TAB ── */}
        {tab === 'tickets' && (
          <div>
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 overflow-x-auto">
              {[
                { id: 'all',        label: 'Tất cả',         count: tickets.length },
                { id: 'open',       label: 'Mới',            count: tickets.filter(t => t.status === 'open').length },
                { id: 'processing', label: 'Đang xử lý',     count: tickets.filter(t => t.status === 'processing').length },
                { id: 'resolved',   label: 'Đã giải quyết',  count: tickets.filter(t => t.status === 'resolved').length },
                { id: 'closed',     label: 'Đã đóng',        count: tickets.filter(t => t.status === 'closed').length },
              ].map(f => (
                <button key={f.id} onClick={() => setTicketFilter(f.id)} className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded text-xs font-bold transition-colors border-none cursor-pointer ${ ticketFilter === f.id ? 'bg-[#E8420A] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200' }`}>
                  {f.label}
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${ticketFilter === f.id ? 'bg-white/20 text-white' : 'bg-white text-gray-500'}`}>{f.count}</span>
                </button>
              ))}
              <button onClick={() => setTab('new')} className="shrink-0 flex items-center gap-1.5 ml-auto px-4 py-2 text-xs font-bold text-[#E8420A] border border-orange-200 hover:bg-orange-50 rounded transition-colors bg-white cursor-pointer">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                Tạo phiếu mới
              </button>
            </div>

            {filtTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <p className="text-sm font-semibold text-gray-600">Không có phiếu nào</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filtTickets.map(ticket => {
                  const st = TICKET_STATUS[ticket.status]
                  const pr = priorityStyle[ticket.priority]
                  return (
                    <div key={ticket.id} className="px-6 py-5 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`w-2 h-2 rounded-full ${st.dot} mt-2 shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="text-xs font-black text-gray-400 font-mono">{ticket.id}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${st.text} ${st.bg}`}>{st.label}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${pr.color}`}>{pr.label}</span>
                          </div>
                          <p className="text-sm font-bold text-gray-900 leading-snug">{ticket.subject}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>
                              {ticket.category}
                            </span>
                            <span>·</span>
                            <span>Tạo: {ticket.created}</span>
                            <span>·</span>
                            <span>Cập nhật: {ticket.lastReply}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 3H3a2 2 0 00-2 2v14a2 2 0 002 2h7l4 4 4-4h3a2 2 0 002-2V5a2 2 0 00-2-2z" /></svg>
                              {ticket.messages} tin nhắn
                            </span>
                          </div>
                        </div>
                        <button className="shrink-0 text-xs font-bold text-[#E8420A] border border-orange-200 hover:bg-orange-50 px-4 py-2 rounded transition-colors bg-white cursor-pointer">Xem chi tiết</button>
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
