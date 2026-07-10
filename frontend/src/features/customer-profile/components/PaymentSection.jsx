import React, { useState } from 'react'

const CARDS_INIT = [
  { id: 1, type: 'visa',       number: '4111111111111234', holder: 'ALEX JOHNSON', expiry: '12/27', bank: 'Vietcombank',  isDefault: true  },
  { id: 2, type: 'mastercard', number: '5200830000001234', holder: 'ALEX JOHNSON', expiry: '08/26', bank: 'Techcombank', isDefault: false },
]

const WALLETS_INIT = [
  { id: 'momo',      name: 'MoMo',       linked: true,  phone: '0961234535', color: 'from-pink-500 to-fuchsia-600',   bg: 'bg-pink-50',   border: 'border-pink-200',   textColor: 'text-pink-700',   desc: 'Ví điện tử phổ biến nhất Việt Nam' },
  { id: 'zalopay',  name: 'ZaloPay',    linked: false, phone: null,          color: 'from-slate-500 to-slate-700',   bg: 'bg-slate-50',  border: 'border-slate-200',  textColor: 'text-slate-700',  desc: 'Thanh toán qua ứng dụng Zalo' },
  { id: 'vnpay',    name: 'VNPay',      linked: true,  phone: '0961234535', color: 'from-red-500 to-rose-600',       bg: 'bg-red-50',    border: 'border-red-200',    textColor: 'text-red-700',    desc: 'Cổng thanh toán trực tuyến VNPAY' },
  { id: 'shopeepay',name: 'ShopeePay', linked: false, phone: null,          color: 'from-orange-500 to-red-500',     bg: 'bg-orange-50', border: 'border-orange-200', textColor: 'text-orange-700', desc: 'Ví điện tử của Shopee' },
]

const CARD_BLANK = { number: '', holder: '', expiry: '', cvv: '', bank: '', isDefault: false }

const CARD_GRADIENTS = {
  visa:       'from-slate-700 via-slate-600 to-slate-800',
  mastercard: 'from-orange-500 via-red-500 to-rose-600',
  jcb:        'from-green-600 via-teal-600 to-emerald-700',
  unknown:    'from-gray-600 via-gray-500 to-gray-700',
}

function detectCardType(number) {
  const n = number.replace(/\s/g, '')
  if (/^4/.test(n))               return 'visa'
  if (/^5[1-5]/.test(n))         return 'mastercard'
  if (/^35(28|29|[3-8])/.test(n)) return 'jcb'
  return 'unknown'
}

function formatCardNumber(raw) {
  return raw.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function maskCardNumber(number) {
  const digits = number.replace(/\D/g, '')
  return `**** **** **** ${digits.slice(-4)}`
}

function CardLogo({ type, small }) {
  const sz = small ? 'text-xs' : 'text-sm'
  if (type === 'visa')
    return <span className={`font-black italic tracking-widest text-white ${sz}`} style={{ fontFamily: 'serif' }}>VISA</span>
  if (type === 'mastercard')
    return (
      <div className="flex items-center">
        <div className={`${small ? 'w-4 h-4' : 'w-5 h-5'} rounded-full bg-red-400 opacity-90`} />
        <div className={`${small ? 'w-4 h-4' : 'w-5 h-5'} rounded-full bg-yellow-400 opacity-90 -ml-2`} />
      </div>
    )
  if (type === 'jcb')
    return <span className={`font-black tracking-widest text-white bg-[#0D0F14] px-1.5 py-0.5 rounded ${sz}`}>JCB</span>
  return <span className={`font-bold text-white/70 ${sz}`}>CARD</span>
}

function AddCardModal({ onClose, onSave }) {
  const [form, setForm]         = useState(CARD_BLANK)
  const [cvvVisible, setCvvVisible] = useState(false)
  const [errors, setErrors]     = useState({})

  const cardType = detectCardType(form.number)
  const set = (k) => (v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleNumberChange = (e) => { set('number')(formatCardNumber(e.target.value)) }
  const handleExpiryChange = (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 4)
    if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2)
    set('expiry')(v)
  }

  const validate = () => {
    const e = {}
    const digits = form.number.replace(/\s/g, '')
    if (digits.length < 13)               e.number = 'Số thẻ không hợp lệ'
    if (!form.holder.trim())              e.holder = 'Vui lòng nhập tên chủ thẻ'
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) e.expiry = 'Định dạng MM/YY'
    if (form.cvv.length < 3)              e.cvv    = 'CVV không hợp lệ'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => { if (validate()) onSave({ ...form, type: cardType }) }
  const inputCls = (k) =>
    `w-full border rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[#E8420A] transition-colors ${errors[k] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`

  const displayNumber = form.number || '**** **** **** ****'
  const displayHolder = form.holder.toUpperCase() || 'TÊN CHỦ THẺ'
  const displayExpiry = form.expiry || 'MM/YY'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded shadow-2xl w-full max-w-lg max-h-[94vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t z-10">
          <div>
            <h2 className="text-base font-black text-gray-900">Thêm thẻ mới</h2>
            <p className="text-xs text-gray-400 mt-0.5">Hỗ trợ Visa, Mastercard và JCB</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors border-none cursor-pointer">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-7 py-6 space-y-6">
          <div className={`relative h-44 rounded bg-gradient-to-br ${CARD_GRADIENTS[cardType]} p-6 shadow-lg overflow-hidden select-none`}>
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -left-6 w-36 h-36 rounded-full bg-white/10" />
            <div className="w-10 h-7 rounded-md bg-yellow-300/80 mb-4 flex items-center justify-center">
              <div className="w-6 h-5 rounded-sm border border-yellow-500/50 grid grid-cols-2 gap-px p-0.5">
                {[...Array(4)].map((_, i) => <div key={i} className="bg-yellow-500/40 rounded-[1px]" />)}
              </div>
            </div>
            <p className="text-white font-mono text-lg font-bold tracking-widest drop-shadow mb-3">{displayNumber}</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-white/60 text-[10px] uppercase tracking-wider">Chủ thẻ</p>
                <p className="text-white text-sm font-bold truncate max-w-[180px]">{displayHolder}</p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-[10px] uppercase tracking-wider">Hết hạn</p>
                <p className="text-white text-sm font-bold">{displayExpiry}</p>
              </div>
              <div className="absolute top-5 right-6"><CardLogo type={cardType} /></div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Số thẻ <span className="text-red-500">*</span></label>
            <div className="relative">
              <input value={form.number} onChange={handleNumberChange} placeholder="0000 0000 0000 0000" className={`${inputCls('number')} pr-12 font-mono tracking-widest`} maxLength={19} />
              <div className="absolute right-3 top-1/2 -translate-y-1/2"><CardLogo type={cardType} small /></div>
            </div>
            {errors.number && <p className="text-xs text-red-500 mt-1">{errors.number}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Tên chủ thẻ <span className="text-red-500">*</span></label>
            <input value={form.holder} onChange={e => set('holder')(e.target.value.toUpperCase())} placeholder="NGUYEN VAN A" className={`${inputCls('holder')} uppercase tracking-wide`} />
            {errors.holder && <p className="text-xs text-red-500 mt-1">{errors.holder}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Ngày hết hạn <span className="text-red-500">*</span></label>
              <input value={form.expiry} onChange={handleExpiryChange} placeholder="MM/YY" className={`${inputCls('expiry')} font-mono tracking-wider`} maxLength={5} />
              {errors.expiry && <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">CVV / CVC <span className="text-red-500">*</span></label>
              <div className="relative">
                <input value={form.cvv} onChange={e => set('cvv')(e.target.value.replace(/\D/g, '').slice(0, 4))} type={cvvVisible ? 'text' : 'password'} placeholder="•••" className={`${inputCls('cvv')} pr-10 font-mono tracking-widest`} maxLength={4} />
                <button type="button" onClick={() => setCvvVisible(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {cvvVisible
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>}
                  </svg>
                </button>
              </div>
              {errors.cvv && <p className="text-xs text-red-500 mt-1">{errors.cvv}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Ngân hàng phát hành <span className="text-gray-400 font-normal">(tuỳ chọn)</span></label>
            <select value={form.bank} onChange={e => set('bank')(e.target.value)} className={inputCls('bank')}>
              <option value="">-- Chọn ngân hàng --</option>
              {['Vietcombank','VietinBank','BIDV','Agribank','Techcombank','MB Bank','ACB','VPBank','TPBank','Sacombank','HDBank','OCB'].map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div onClick={() => set('isDefault')(!form.isDefault)} className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${form.isDefault ? 'bg-[#E8420A] border-[#E8420A]' : 'border-gray-300 hover:border-[#E8420A]'}`}>
              {form.isDefault && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Đặt làm phương thức thanh toán mặc định</p>
              <p className="text-xs text-gray-400 mt-0.5">Thẻ này sẽ được chọn tự động khi thanh toán</p>
            </div>
          </label>

          <div className="flex items-start gap-2.5 bg-green-50 border border-green-200 rounded px-4 py-3">
            <svg className="w-4 h-4 text-green-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <p className="text-xs text-green-700 font-medium">Thông tin thẻ được mã hóa theo tiêu chuẩn PCI DSS. Chúng tôi không lưu trữ CVV.</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-gray-100 bg-gray-50/60 rounded-b sticky bottom-0">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors bg-white cursor-pointer">Huỷ bỏ</button>
          <button onClick={handleSave} className="px-6 py-2.5 text-sm font-bold text-white bg-[#E8420A] hover:bg-[#c93808] rounded shadow-sm transition-colors border-none cursor-pointer">Thêm thẻ</button>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSection() {
  const [tab, setTab]                   = useState('cards')
  const [cards, setCards]               = useState(CARDS_INIT)
  const [wallets, setWallets]           = useState(WALLETS_INIT)
  const [showAddCard, setShowAddCard]   = useState(false)
  const [deletingCardId, setDeletingCardId] = useState(null)
  const [toast, setToast]               = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200) }

  const handleAddCard = (form) => {
    const newCard = { ...form, id: Date.now(), type: detectCardType(form.number) }
    setCards(prev => {
      const list = form.isDefault ? prev.map(c => ({ ...c, isDefault: false })) : prev
      return [...list, newCard]
    })
    setShowAddCard(false)
    showToast('Thêm thẻ thành công!')
  }

  const handleDeleteCard = (id) => {
    setCards(prev => {
      const remaining = prev.filter(c => c.id !== id)
      if (remaining.length > 0 && !remaining.some(c => c.isDefault)) remaining[0].isDefault = true
      return remaining
    })
    setDeletingCardId(null)
    showToast('Đã xoá thẻ.')
  }

  const handleSetDefaultCard = (id) => {
    setCards(prev => prev.map(c => ({ ...c, isDefault: c.id === id })))
    showToast('Đã đặt làm thẻ mặc định!')
  }

  const handleToggleWallet = (id) => {
    setWallets(prev => prev.map(w => w.id === id ? { ...w, linked: !w.linked, phone: !w.linked ? '0961234535' : null } : w))
    const w = wallets.find(w => w.id === id)
    showToast(w?.linked ? `Đã huỷ liên kết ${w.name}.` : `Đã liên kết ${w.name} thành công!`)
  }

  const linkedCount = wallets.filter(w => w.linked).length

  return (
    <div className="space-y-5 text-gray-800">
      {toast && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-5 py-3 rounded shadow-sm">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          {toast}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Thẻ đã lưu',      value: cards.length,              color: 'bg-orange-50 border-orange-100 text-[#E8420A]'  },
          { label: 'Ví đã liên kết',   value: linkedCount,               color: 'bg-green-50 border-green-100 text-green-700' },
          { label: 'Tổng phương thức', value: cards.length + linkedCount, color: 'bg-gray-50 border-gray-200 text-gray-700' },
        ].map((s, i) => (
          <div key={i} className={`rounded border px-5 py-4 text-center ${s.color}`}>
            <p className="text-3xl font-black">{s.value}</p>
            <p className="text-xs font-semibold mt-1 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-2 pt-2">
          <div className="flex gap-1">
            {[
              { id: 'cards',   label: 'Thẻ ngân hàng', count: cards.length },
              { id: 'wallets', label: 'Ví điện tử',     count: linkedCount  },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap bg-transparent cursor-pointer ${ tab === t.id ? 'border-[#E8420A] text-[#E8420A]' : 'border-transparent text-gray-500 hover:text-gray-800' }`}>
                {t.label}
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${tab === t.id ? 'bg-orange-100 text-[#E8420A]' : 'bg-gray-100 text-gray-500'}`}>{t.count}</span>
              </button>
            ))}
          </div>
          {tab === 'cards' && (
            <button onClick={() => setShowAddCard(true)} className="flex items-center gap-1.5 mb-2 mr-2 px-4 py-2 text-sm font-bold text-white bg-[#E8420A] hover:bg-[#c93808] rounded shadow-sm transition-colors border-none cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              Thêm thẻ
            </button>
          )}
        </div>

        {tab === 'cards' && (
          <div className="p-6">
            {cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <p className="text-base font-semibold text-gray-600">Chưa có thẻ nào</p>
                <p className="text-sm text-gray-400 mt-1">Thêm thẻ để thanh toán nhanh hơn</p>
                <button onClick={() => setShowAddCard(true)} className="mt-5 flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#E8420A] hover:bg-[#c93808] rounded transition-colors shadow-sm border-none cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  Thêm thẻ đầu tiên
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5">
                {cards.map(card => (
                  <div key={card.id} className="space-y-3">
                    <div className={`relative h-40 rounded bg-gradient-to-br ${CARD_GRADIENTS[card.type]} p-5 shadow-md overflow-hidden ${card.isDefault ? 'ring-2 ring-[#E8420A] ring-offset-2' : ''}`}>
                      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
                      <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-white/10" />
                      {card.isDefault && <div className="absolute top-3 right-3"><span className="text-[10px] font-black bg-white/30 text-white border border-white/40 px-2 py-0.5 rounded-full backdrop-blur-sm">Mặc định</span></div>}
                      <div className="w-8 h-5 rounded bg-yellow-300/80 mb-3 flex items-center justify-center">
                        <div className="w-5 h-4 border border-yellow-500/40 rounded-sm grid grid-cols-2 gap-px p-0.5">{[...Array(4)].map((_, i) => <div key={i} className="bg-yellow-500/40 rounded-[1px]" />)}</div>
                      </div>
                      <p className="text-white font-mono text-sm font-bold tracking-widest drop-shadow">{maskCardNumber(card.number)}</p>
                      <div className="flex items-end justify-between mt-2">
                        <div>
                          <p className="text-white/60 text-[9px] uppercase tracking-wider">Chủ thẻ</p>
                          <p className="text-white text-xs font-bold truncate max-w-[100px]">{card.holder}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/60 text-[9px] uppercase tracking-wider">Hết hạn</p>
                          <p className="text-white text-xs font-bold">{card.expiry}</p>
                        </div>
                        <div className="absolute bottom-4 right-5"><CardLogo type={card.type} small /></div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded border border-gray-200 px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-700 capitalize">{card.type.toUpperCase()}{card.bank ? ` · ${card.bank}` : ''}</span>
                        {card.isDefault
                          ? <span className="text-xs font-black text-[#E8420A] bg-orange-100 border border-orange-200 px-2 py-0.5 rounded">Mặc định</span>
                          : <button onClick={() => handleSetDefaultCard(card.id)} className="text-xs font-semibold text-gray-500 hover:text-[#E8420A] transition-colors border-none bg-transparent cursor-pointer">Đặt mặc định</button>
                        }
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setDeletingCardId(card.id)} className="flex-1 text-xs font-semibold text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 py-1.5 rounded transition-colors bg-white cursor-pointer">Xoá thẻ</button>
                      </div>
                      {deletingCardId === card.id && (
                        <div className="mt-2 flex items-center gap-2 bg-red-50 border border-red-200 rounded px-3 py-2">
                          <p className="text-xs font-semibold text-red-700 flex-1">Xác nhận xoá thẻ này?</p>
                          <button onClick={() => setDeletingCardId(null)} className="text-xs font-bold text-gray-500 px-2 py-1 hover:bg-white rounded border border-gray-200 transition-colors bg-transparent cursor-pointer">Huỷ</button>
                          <button onClick={() => handleDeleteCard(card.id)} className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition-colors border-none cursor-pointer">Xoá</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <button onClick={() => setShowAddCard(true)} className="h-40 rounded border-2 border-dashed border-gray-300 hover:border-[#E8420A] hover:bg-orange-50/30 flex flex-col items-center justify-center gap-2 transition-all group bg-transparent cursor-pointer">
                  <div className="w-10 h-10 rounded bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-[#E8420A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-400 group-hover:text-[#E8420A] transition-colors">Thêm thẻ mới</span>
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'wallets' && (
          <div className="divide-y divide-gray-100">
            {wallets.map(wallet => (
              <div key={wallet.id} className={`flex items-center gap-5 px-6 py-5 hover:bg-gray-50/60 transition-colors ${wallet.linked ? 'bg-white' : ''}`}>
                <div className={`w-14 h-14 rounded bg-gradient-to-br ${wallet.color} flex items-center justify-center shrink-0 shadow-md`}>
                  <span className="text-white text-xs font-black leading-tight text-center px-1">{wallet.name}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-gray-900">{wallet.name}</p>
                    {wallet.linked && <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${wallet.bg} ${wallet.border} ${wallet.textColor}`}>Đã liên kết</span>}
                  </div>
                  <p className="text-xs text-gray-400">{wallet.desc}</p>
                  {wallet.linked && wallet.phone && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      <span className="text-xs text-gray-500 font-medium">{wallet.phone.replace(/^(\d{3})\d{4}(\d{2})$/, '$1·····$2')}</span>
                    </div>
                  )}
                </div>
                <button onClick={() => handleToggleWallet(wallet.id)} className={`shrink-0 px-5 py-2 text-sm font-bold rounded border transition-colors cursor-pointer ${ wallet.linked ? 'border-gray-300 text-gray-600 bg-white hover:bg-gray-100 hover:text-red-600 hover:border-red-200' : 'border-[#E8420A] text-[#E8420A] bg-white hover:bg-[#E8420A] hover:text-white' }`}>
                  {wallet.linked ? 'Huỷ liên kết' : 'Liên kết'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded px-5 py-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        <div>
          <p className="text-xs font-bold text-gray-800 mb-0.5">Bảo mật thanh toán</p>
          <p className="text-xs text-gray-600">Thông tin thẻ và ví được mã hóa 256-bit SSL. Chúng tôi không lưu trữ mã CVV. Mọi giao dịch đều yêu cầu xác thực OTP.</p>
        </div>
      </div>

      {showAddCard && <AddCardModal onClose={() => setShowAddCard(false)} onSave={handleAddCard} />}
    </div>
  )
}
