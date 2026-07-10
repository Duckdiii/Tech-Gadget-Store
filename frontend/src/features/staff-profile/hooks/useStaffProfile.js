import { useState } from 'react'
import { staffProfileService } from '../services/staffProfileService'

const STATIC_INFO = {
  department: 'Kho vận',
  joinDate:   '20/04/2023',
  lastLogin:  '13/06/2024 · 08:31',
  bg:         'bg-teal-500',
}

export function useStaffProfile(user) {
  const name = user?.name || 'Nhân viên'
  const email = user?.email || ''
  const roleLabel = user?.role === 'manager' ? 'Quản lý kho' : 'Nhân viên kho'
  const initials = name.split(' ').filter(Boolean).slice(-2).map(w => w[0]).join('').toUpperCase() || 'NV'
  const username = email ? email.split('@')[0] : 'staff'

  const profile = {
    name,
    username,
    email,
    role: roleLabel,
    initials,
    ...STATIC_INFO,
  }

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
    pwdForm, setPwdForm,
    pwdErrors,
    pwdSuccess,
    pwdSubmitting,
    showPwd,
    handleChangePwd,
    toggleShow,
  }
}
