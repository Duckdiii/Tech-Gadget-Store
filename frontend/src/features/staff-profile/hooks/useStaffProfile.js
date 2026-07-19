import { useEffect, useState } from 'react'
import { staffProfileService } from '../services/staffProfileService'

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('vi-VN') : null
}

function formatDateTime(value) {
  if (!value) return null
  const d = new Date(value)
  return `${d.toLocaleDateString('vi-VN')} · ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
}

function buildProfile(user, dto) {
  const name = dto?.fullName || user?.name || 'Nhân viên'
  const email = dto?.email || user?.email || ''
  const role = dto?.role || (user?.role === 'manager' ? 'MANAGER' : 'STAFF')
  const roleLabel = role === 'MANAGER' ? 'Quản lý kho' : 'Nhân viên kho'
  const initials = name.split(' ').filter(Boolean).slice(-2).map(w => w[0]).join('').toUpperCase() || 'NV'
  const username = email ? email.split('@')[0] : 'staff'

  return {
    name,
    username,
    email,
    role: roleLabel,
    initials,
    staffCode: dto?.staffCode || null,
    joinDate: formatDate(dto?.hireDate),
    lastLogin: formatDateTime(dto?.lastLoginAt),
    bg: 'bg-teal-500',
  }
}

export function useStaffProfile(user) {
  const [profileDto, setProfileDto] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    staffProfileService.getMyProfile()
      .then(dto => { if (!cancelled) setProfileDto(dto) })
      .catch(err => console.error('Lỗi tải hồ sơ cá nhân:', err))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const profile = buildProfile(user, profileDto)

  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' })
  const [pwdErrors, setPwdErrors] = useState({})
  const [pwdSuccess, setPwdSuccess] = useState(false)
  const [pwdSubmitting, setPwdSubmitting] = useState(false)
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false })

  async function handleChangePwd() {
    const e = {}
    if (!pwdForm.current.trim())          e.current  = 'Vui lòng nhập mật khẩu hiện tại'
    if (pwdForm.next.length < 8)          e.next     = 'Mật khẩu mới tối thiểu 8 ký tự'
    if (pwdForm.next !== pwdForm.confirm) e.confirm  = 'Mật khẩu xác nhận không khớp'
    if (Object.keys(e).length) { setPwdErrors(e); return }
    setPwdErrors({})
    setPwdSubmitting(true)
    try {
      await staffProfileService.changePassword({ current: pwdForm.current, next: pwdForm.next })
      setPwdSuccess(true)
      setPwdForm({ current: '', next: '', confirm: '' })
      setTimeout(() => setPwdSuccess(false), 4000)
    } catch (err) {
      setPwdErrors({ submit: err.message || 'Không thể đổi mật khẩu' })
    } finally {
      setPwdSubmitting(false)
    }
  }

  function toggleShow(field) { setShowPwd(s => ({ ...s, [field]: !s[field] })) }

  return {
    profile,
    profileLoading: loading,
    pwdForm, setPwdForm,
    pwdErrors,
    pwdSuccess,
    pwdSubmitting,
    showPwd,
    handleChangePwd,
    toggleShow,
  }
}
