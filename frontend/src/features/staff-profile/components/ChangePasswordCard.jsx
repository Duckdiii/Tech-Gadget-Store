const EYE_OPEN = 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
const EYE_CLOSED = 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'

const FIELDS = [
  { key: 'current', label: 'Mật khẩu hiện tại' },
  { key: 'next',    label: 'Mật khẩu mới' },
  { key: 'confirm', label: 'Xác nhận mật khẩu mới' },
]

export default function ChangePasswordCard({ pwdForm, setPwdForm, pwdErrors, pwdSuccess, pwdSubmitting, showPwd, toggleShow, onSubmit }) {
  const inp = 'w-full border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400'
  const len = pwdForm.next.length

  return (
    <div className="bg-white rounded border border-gray-200 px-8 py-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 bg-teal-100 rounded flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-800">Đổi mật khẩu</h3>
          <p className="text-xs text-gray-400 mt-0.5">Mật khẩu mới tối thiểu 8 ký tự</p>
        </div>
      </div>

      {pwdSuccess && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded px-4 py-3 mb-4">
          <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-sm font-semibold text-green-700">Đổi mật khẩu thành công!</p>
        </div>
      )}

      <div className="space-y-4">
        {FIELDS.map(({ key, label }) => (
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPwd[key] ? EYE_CLOSED : EYE_OPEN} /></svg>
              </button>
            </div>
            {pwdErrors[key] && <p className="text-xs text-red-500 mt-1">{pwdErrors[key]}</p>}
          </div>
        ))}
      </div>

      {/* Password strength */}
      {len > 0 && (
        <div className="mt-3">
          <div className="flex gap-1.5">
            {[1,2,3,4].map(i => {
              const filled = i <= (len < 6 ? 1 : len < 8 ? 2 : len < 12 ? 3 : 4)
              return <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${filled ? (len < 6 ? 'bg-red-400' : len < 8 ? 'bg-amber-400' : len < 12 ? 'bg-[#E8420A]' : 'bg-green-500') : 'bg-gray-100'}`} />
            })}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {len < 6 ? 'Quá yếu' : len < 8 ? 'Yếu' : len < 12 ? 'Trung bình' : 'Mạnh'}
          </p>
        </div>
      )}

      {pwdErrors.submit && <p className="text-xs text-red-600 font-semibold mt-3">{pwdErrors.submit}</p>}

      <button onClick={onSubmit} disabled={pwdSubmitting} className="mt-5 w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-55 text-white rounded text-sm font-bold cursor-pointer transition-colors">
        {pwdSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
      </button>
    </div>
  )
}
