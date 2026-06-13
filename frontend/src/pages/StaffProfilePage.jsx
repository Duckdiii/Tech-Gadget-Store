import { useState } from 'react'

const PROFILE = {
  name:       'Lê Hoàng Dũng',
  username:   'staff.le',
  email:      'hoang.dung@techstore.vn',
  phone:      '0923 456 789',
  role:       'Quản lý kho',
  department: 'Kho vận',
  joinDate:   '20/04/2023',
  lastLogin:  '13/06/2024 · 08:31',
  initials:   'LD',
  bg:         'bg-teal-500',
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center py-3 border-b border-gray-50 last:border-0">
      <span className="w-36 text-xs font-medium text-gray-400 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value || '—'}</span>
    </div>
  )
}

export default function StaffProfilePage() {
  const [pwdForm, setPwdForm]   = useState({ current:'', next:'', confirm:'' })
  const [pwdErrors, setPwdErrors] = useState({})
  const [pwdSuccess, setPwdSuccess] = useState(false)
  const [showPwd, setShowPwd]   = useState({ current:false, next:false, confirm:false })

  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400'

  function handleChangePwd() {
    const e = {}
    if (!pwdForm.current.trim())          e.current  = 'Vui lòng nhập mật khẩu hiện tại'
    if (pwdForm.next.length < 8)          e.next     = 'Mật khẩu mới tối thiểu 8 ký tự'
    if (pwdForm.next !== pwdForm.confirm) e.confirm  = 'Mật khẩu xác nhận không khớp'
    if (Object.keys(e).length) { setPwdErrors(e); return }
    setPwdErrors({})
    setPwdSuccess(true)
    setPwdForm({ current:'', next:'', confirm:'' })
    setTimeout(() => setPwdSuccess(false), 4000)
  }

  function toggleShow(field) { setShowPwd(s => ({ ...s, [field]: !s[field] })) }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-8 py-3.5 flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Thông tin cá nhân</h1>
          <p className="text-xs text-gray-400 mt-0.5">Xem và cập nhật thông tin tài khoản của bạn</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="relative p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">LD</div>
        </div>
      </header>

      <div className="flex-1 px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-5">

          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-br from-teal-600 to-teal-800 px-8 py-8 flex items-center gap-5">
              <div className={`w-20 h-20 ${PROFILE.bg} rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shrink-0`}>
                {PROFILE.initials}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{PROFILE.name}</h2>
                <p className="text-teal-200 mt-0.5">@{PROFILE.username}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-semibold bg-white/20 text-white px-2.5 py-1 rounded-full">{PROFILE.role}</span>
                  <span className="text-xs font-semibold bg-white/20 text-white px-2.5 py-1 rounded-full">{PROFILE.department}</span>
                </div>
              </div>
            </div>

            <div className="px-8 py-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Thông tin chi tiết</h3>
              <InfoRow label="Email"              value={PROFILE.email}     />
              <InfoRow label="Số điện thoại"      value={PROFILE.phone}     />
              <InfoRow label="Chức vụ"             value={PROFILE.role}      />
              <InfoRow label="Phòng ban"           value={PROFILE.department}/>
              <InfoRow label="Ngày vào làm"        value={PROFILE.joinDate}  />
              <InfoRow label="Đăng nhập gần đây"   value={PROFILE.lastLogin} />
            </div>
          </div>

          {/* Change password */}
          <div className="bg-white rounded-2xl border border-gray-200 px-8 py-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Đổi mật khẩu</h3>
                <p className="text-xs text-gray-400 mt-0.5">Mật khẩu mới tối thiểu 8 ký tự</p>
              </div>
            </div>

            {pwdSuccess && (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
                <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-sm font-semibold text-green-700">Đổi mật khẩu thành công!</p>
              </div>
            )}

            <div className="space-y-4">
              {[
                { key:'current', label:'Mật khẩu hiện tại' },
                { key:'next',    label:'Mật khẩu mới' },
                { key:'confirm', label:'Xác nhận mật khẩu mới' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
                  <div className="relative">
                    <input
                      type={showPwd[key] ? 'text' : 'password'}
                      value={pwdForm[key]}
                      onChange={e => setPwdForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder="••••••••"
                      className={inp + ' pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => toggleShow(key)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showPwd[key]
                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      }
                    </button>
                  </div>
                  {pwdErrors[key] && <p className="text-xs text-red-500 mt-1">{pwdErrors[key]}</p>}
                </div>
              ))}
            </div>

            {/* Password strength */}
            {pwdForm.next.length > 0 && (
              <div className="mt-3">
                <div className="flex gap-1.5">
                  {[1,2,3,4].map(i => {
                    const len = pwdForm.next.length
                    const filled = i <= (len < 6 ? 1 : len < 8 ? 2 : len < 12 ? 3 : 4)
                    return <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${filled ? (len < 6 ? 'bg-red-400' : len < 8 ? 'bg-amber-400' : len < 12 ? 'bg-blue-400' : 'bg-green-500') : 'bg-gray-100'}`} />
                  })}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  {pwdForm.next.length < 6 ? 'Quá yếu' : pwdForm.next.length < 8 ? 'Yếu' : pwdForm.next.length < 12 ? 'Trung bình' : 'Mạnh'}
                </p>
              </div>
            )}

            <button onClick={handleChangePwd} className="mt-5 w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold cursor-pointer transition-colors">
              Cập nhật mật khẩu
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
