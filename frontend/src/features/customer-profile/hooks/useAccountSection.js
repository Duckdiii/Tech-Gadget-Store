import { useState, useEffect } from 'react'
import { profileService } from '../services/profileService'

const INIT_ACCOUNT_INFO = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  dob: '1998-06-01',
  gender: 'male',
  bio: '',
}

const GENDER_LABEL = { male: 'Nam', female: 'Nữ', other: 'Khác' }

export function useAccountSection({ profile, onProfileUpdate }) {
  const [avatarSrc, setAvatarSrc] = useState(null)

  useEffect(() => {
    const loadAvatar = () => {
      if (profile?.email) {
        const stored = localStorage.getItem(`customer_avatar_${profile.email}`)
        if (stored) setAvatarSrc(stored)
      }
    }
    loadAvatar()
    window.addEventListener('customer_avatar_changed', loadAvatar)
    return () => window.removeEventListener('customer_avatar_changed', loadAvatar)
  }, [profile])

  const INIT = INIT_ACCOUNT_INFO

  const [info, setInfo] = useState(INIT)
  const [draft, setDraft] = useState(INIT)
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) {
      const parts = (profile.fullName || '').trim().split(/\s+/)
      const lastName = parts.pop() || ''
      const firstName = parts.join(' ')
      const newInit = {
        firstName,
        lastName,
        phone: profile.phone || '',
        email: profile.email || '',
        dob: '1998-06-01',
        gender: 'male',
        bio: '',
      }
      setInfo(newInit)
      setDraft(newInit)
    }
  }, [profile])

  const handleSave = async () => {
    const fullName = `${draft.firstName} ${draft.lastName}`.trim()
    try {
      await profileService.updateProfile(fullName, draft.phone)
      setInfo(draft)
      setEditing(false)
      setSaved(true)
      if (onProfileUpdate) onProfileUpdate()
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      alert(err.message || 'Không thể lưu thông tin cá nhân')
    }
  }

  const handleCancel = () => {
    setDraft(info)
    setEditing(false)
  }

  const handleChangeField = (k) => (e) => setDraft(prev => ({ ...prev, [k]: e.target.value }))

  /* ── Password ── */
  const [pwSection, setPwSection] = useState(false)
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwVisible, setPwVisible] = useState({ current: false, next: false, confirm: false })
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState('')

  const setPwField = (k) => (e) => setPw(prev => ({ ...prev, [k]: e.target.value }))
  const togglePwVisible = (k) => setPwVisible(prev => ({ ...prev, [k]: !prev[k] }))

  const handleSavePw = () => {
    if (!pw.current) {
      setPwError('Vui lòng nhập mật khẩu hiện tại.')
      return
    }
    if (pw.next.length < 8) {
      setPwError('Mật khẩu mới phải có ít nhất 8 ký tự.')
      return
    }
    if (pw.next !== pw.confirm) {
      setPwError('Mật khẩu xác nhận không khớp.')
      return
    }
    setPwError('')
    setPwSaved(true)
    setPw({ current: '', next: '', confirm: '' })
    setTimeout(() => {
      setPwSaved(false)
      setPwSection(false)
    }, 2000)
  }

  /* ── 2FA ── */
  const [twoFa, setTwoFa] = useState(true)

  /* ── Avatar select ── */
  const handleAvatarSelect = (newAvatar) => {
    if (profile?.email) {
      localStorage.setItem(`customer_avatar_${profile.email}`, newAvatar)
      setAvatarSrc(newAvatar)
      window.dispatchEvent(new Event('customer_avatar_changed'))
    }
  }

  const genderLabel = GENDER_LABEL
  const dobDisplay = info.dob
    ? new Date(info.dob).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—'

  /* ── Strength meter ── */
  const strength = (() => {
    const v = pw.next
    if (!v) return 0
    let s = 0
    if (v.length >= 8) s += 1
    if (/[A-Z]/.test(v)) s += 1
    if (/[0-9]/.test(v)) s += 1
    if (/[^A-Za-z0-9]/.test(v)) s += 1
    return s
  })()

  return {
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
  }
}
