import { useState } from 'react'
import { useAccountSection } from '../hooks/useAccountSection'
import AvatarPickerModal from './AvatarPickerModal'

function Field({ label, value, editing, children, verified }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
      <p className="w-44 text-sm font-semibold text-gray-500 shrink-0 pt-0.5">{label}</p>
      <div className="flex-1 min-w-0">
        {editing ? (
          children
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900">{value}</p>
            {verified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Đã xác minh
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AccountSection({ profile, onProfileUpdate }) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const {
    avatarSrc,
    info,
    draft,
    editing,
    setEditing,
    saved,
    handleSave,
    handleCancel,
    handleChangeField,
    pwSection,
    setPwSection,
    pw,
    pwVisible,
    pwSaved,
    pwError,
    setPwField,
    togglePwVisible,
    handleSavePw,
    twoFa,
    setTwoFa,
    handleAvatarSelect,
    genderLabel,
    dobDisplay,
    strength,
  } = useAccountSection({ profile, onProfileUpdate })

  const strengthLabel = ['', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh']
  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']

  return (
    <div className="space-y-5 text-gray-800">
      {/* ── Avatar + name hero ── */}
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-d)]" />
        <div className="px-8 pb-6 -mt-12 flex items-end gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-full ring-4 ring-white shadow-lg overflow-hidden bg-gradient-to-br from-[var(--accent)] to-[var(--accent-d)] flex items-center justify-center">
              {avatarSrc
                ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                : <span className="text-white text-3xl font-black">AJ</span>
              }
            </div>
            <button
              onClick={() => setIsPickerOpen(true)}
              className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--accent)] hover:bg-[var(--accent-d)] text-white rounded-full flex items-center justify-center shadow-md transition-colors border-2 border-white cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* Name block */}
          <div className="flex-1 pt-14">
            <h2 className="text-xl font-black text-gray-900">{info.firstName} {info.lastName}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{info.email}</p>
          </div>

          {/* Edit / Save buttons */}
          <div className="flex items-center gap-2 pt-14">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-bold text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Đã lưu
              </span>
            )}
            {editing ? (
              <>
                <button onClick={handleCancel} className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors cursor-pointer">Huỷ</button>
                <button onClick={handleSave} className="px-5 py-2 text-sm font-bold text-white bg-[var(--accent)] hover:bg-[var(--accent-d)] rounded transition-colors shadow-sm cursor-pointer border-none">Lưu thay đổi</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-gray-700 border border-gray-300 hover:border-[var(--accent)] hover:text-[var(--accent)] rounded transition-colors shadow-sm cursor-pointer bg-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Chỉnh sửa
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Personal information ── */}
      <div className="bg-white rounded border border-gray-200 shadow-sm">
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Thông tin cá nhân</h3>
            <p className="text-xs text-gray-400 mt-0.5">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
          </div>
          {editing && (
            <span className="text-xs font-semibold text-[var(--accent)] bg-orange-50 border border-orange-200 px-3 py-1 rounded">Đang chỉnh sửa</span>
          )}
        </div>

        <div className="px-8 py-2">
          <Field label="Họ" value={info.firstName} editing={editing}>
            <input value={draft.firstName} onChange={handleChangeField('firstName')} className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[var(--accent)]" placeholder="Nhập họ" />
          </Field>
          <Field label="Tên" value={info.lastName} editing={editing}>
            <input value={draft.lastName} onChange={handleChangeField('lastName')} className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[var(--accent)]" placeholder="Nhập tên" />
          </Field>
          <Field label="Số điện thoại" value={info.phone.replace(/^(\d{3})\d{4}(\d{2})$/, '$1·····$2')} editing={editing} verified>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 border border-gray-300 rounded px-3 py-2.5 bg-gray-50 text-sm text-gray-600 shrink-0">
                <span className="text-base">🇻🇳</span><span>+84</span>
              </div>
              <input value={draft.phone} onChange={handleChangeField('phone')} className="flex-1 border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[var(--accent)]" placeholder="Số điện thoại" maxLength={10} />
            </div>
          </Field>
          <Field label="Email" value={info.email} editing={editing} verified>
            <div className="flex gap-2">
              <input value={draft.email} onChange={handleChangeField('email')} type="email" className="flex-1 border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[var(--accent)]" placeholder="Địa chỉ email" />
              <button className="text-sm font-semibold text-[var(--accent)] border border-orange-200 hover:bg-orange-50 px-4 rounded transition-colors shrink-0 cursor-pointer bg-white">Xác minh</button>
            </div>
          </Field>
          <Field label="Ngày sinh" value={dobDisplay} editing={editing}>
            <input value={draft.dob} onChange={handleChangeField('dob')} type="date" className="border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[var(--accent)]" />
          </Field>
          <Field label="Giới tính" value={genderLabel[info.gender] ?? '—'} editing={editing}>
            <div className="flex gap-3">
              {[{ v: 'male', l: 'Nam' }, { v: 'female', l: 'Nữ' }, { v: 'other', l: 'Khác' }].map(g => (
                <label key={g.v} className={`flex items-center gap-2 px-4 py-2 rounded border cursor-pointer transition-colors text-sm font-medium ${draft.gender === g.v ? 'border-[var(--accent)] bg-orange-50 text-[var(--accent)]' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
                  <input type="radio" name="gender" value={g.v} checked={draft.gender === g.v} onChange={handleChangeField('gender')} className="hidden" />
                  {draft.gender === g.v
                    ? <span className="w-4 h-4 rounded-full bg-[var(--accent)] flex items-center justify-center"><span className="w-2 h-2 rounded-full bg-white" /></span>
                    : <span className="w-4 h-4 rounded-full border-2 border-gray-400" />
                  }
                  {g.l}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Giới thiệu" value={info.bio || <span className="text-gray-400 italic">Chưa có thông tin</span>} editing={editing}>
            <textarea value={draft.bio} onChange={handleChangeField('bio')} rows={3} className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[var(--accent)] resize-none" placeholder="Viết vài dòng giới thiệu về bản thân..." />
          </Field>
        </div>

        {editing && (
          <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between rounded-b">
            <p className="text-xs text-gray-400">Các trường có dấu <span className="text-green-600 font-bold">Đã xác minh</span> cần xác minh lại nếu thay đổi.</p>
            <div className="flex gap-2">
              <button onClick={handleCancel} className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors cursor-pointer bg-white">Huỷ bỏ</button>
              <button onClick={handleSave} className="px-6 py-2 text-sm font-bold text-white bg-[var(--accent)] hover:bg-[var(--accent-d)] rounded transition-colors shadow-sm cursor-pointer border-none">Lưu thay đổi</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Password change ── */}
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        <button onClick={() => setPwSection(v => !v)} className="w-full flex items-center justify-between px-8 py-5 hover:bg-gray-50/60 transition-colors bg-transparent border-none cursor-pointer text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900">Đổi mật khẩu</p>
              <p className="text-xs text-gray-400 mt-0.5">Đổi lần cuối 2 tháng trước</p>
            </div>
          </div>
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${pwSection ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {pwSection && (
          <div className="px-8 pb-6 border-t border-gray-100">
            <div className="pt-5 space-y-4 max-w-md">
              {[
                { key: 'current', label: 'Mật khẩu hiện tại',     placeholder: 'Nhập mật khẩu hiện tại' },
                { key: 'next',    label: 'Mật khẩu mới',           placeholder: 'Tối thiểu 8 ký tự' },
                { key: 'confirm', label: 'Xác nhận mật khẩu mới',  placeholder: 'Nhập lại mật khẩu mới' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f.label}</label>
                  <div className="relative">
                    <input type={pwVisible[f.key] ? 'text' : 'password'} value={pw[f.key]} onChange={setPwField(f.key)} placeholder={f.placeholder} className="w-full border border-gray-300 rounded px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[var(--accent)]" />
                    <button type="button" onClick={() => togglePwVisible(f.key)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors border-none bg-transparent cursor-pointer">
                      {pwVisible[f.key] ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
              {pw.next && (
                <div>
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColor[strength] : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-semibold ${['', 'text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-600'][strength]}`}>Độ mạnh: {strengthLabel[strength]}</p>
                </div>
              )}
              {pwError && <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3"><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{pwError}</div>}
              {pwSaved && <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-4 py-3"><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Đổi mật khẩu thành công!</div>}
              <button onClick={handleSavePw} className="px-6 py-2.5 text-sm font-bold text-white bg-[var(--accent)] hover:bg-[var(--accent-d)] rounded transition-colors shadow-sm border-none cursor-pointer">Xác nhận đổi mật khẩu</button>
            </div>
          </div>
        )}
      </div>

      {/* ── 2FA & Security ── */}
      <div className="bg-white rounded border border-gray-200 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Bảo mật tài khoản</h3>
            <p className="text-xs text-gray-400 mt-0.5">Bảo vệ tài khoản của bạn với lớp xác thực bổ sung</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded flex items-center justify-center ${twoFa ? 'bg-green-100' : 'bg-gray-100'}`}>
                <svg className={`w-5 h-5 ${twoFa ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18h.01M8 21h8a2 2 0 002-2v-1a7 7 0 00-14 0v1a2 2 0 002 2zM12 3a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Xác thực 2 bước (2FA)</p>
                <p className={`text-xs font-bold mt-0.5 ${twoFa ? 'text-green-600' : 'text-gray-400'}`}>{twoFa ? 'Đang bật — Xác thực qua SMS' : 'Chưa bật'}</p>
              </div>
            </div>
            <button onClick={() => setTwoFa(v => !v)} className={`relative w-12 h-6 rounded-full transition-colors duration-200 border-none cursor-pointer ${twoFa ? 'bg-[var(--accent)]' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${twoFa ? 'left-[26px]' : 'left-0.5'}`} />
            </button>
          </div>
          <div className="p-4 rounded bg-gray-50 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-900">Thiết bị đang đăng nhập</p>
              <button className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors border-none bg-transparent cursor-pointer">Đăng xuất tất cả</button>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Chrome · Windows 11', loc: 'Hà Nội, Việt Nam',  time: 'Hiện tại',    current: true  },
                { name: 'Safari · iPhone 15',  loc: 'TP. Hồ Chí Minh',  time: '2 ngày trước', current: false },
              ].map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">{d.name}</p>
                    <p className="text-xs text-gray-400">{d.loc} · {d.time}</p>
                  </div>
                  {d.current
                    ? <span className="text-[10px] font-black text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Thiết bị này</span>
                    : <button className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors border-none bg-transparent cursor-pointer">Đăng xuất</button>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <AvatarPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleAvatarSelect}
        currentAvatar={avatarSrc}
      />
    </div>
  )
}
