import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAccountSection } from './useAccountSection'
import { profileService } from '../services/profileService'

vi.mock('../services/profileService', () => ({
  profileService: { updateProfile: vi.fn() },
}))

const PROFILE = { fullName: 'Nguyễn Đức Duy', phone: '0912345678', email: 'duy@example.com' }

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(window, 'alert').mockImplementation(() => {})
  localStorage.clear()
})

describe('useAccountSection', () => {
  it('khởi tạo info/draft từ profile.fullName (tách từ cuối làm lastName)', () => {
    const { result } = renderHook(() => useAccountSection({ profile: PROFILE, onProfileUpdate: vi.fn() }))

    expect(result.current.info).toEqual({
      firstName: 'Nguyễn Đức', lastName: 'Duy', phone: '0912345678', email: 'duy@example.com',
      dob: '1998-06-01', gender: 'male', bio: '',
    })
    expect(result.current.draft).toEqual(result.current.info)
  })

  it('handleSave: lưu thành công thì cập nhật info, gọi onProfileUpdate, tự tắt banner sau 2.5s', async () => {
    vi.useFakeTimers()
    profileService.updateProfile.mockResolvedValue(null)
    const onProfileUpdate = vi.fn()
    const { result } = renderHook(() => useAccountSection({ profile: PROFILE, onProfileUpdate }))

    act(() => result.current.handleChangeField('firstName')({ target: { value: 'Nguyễn Văn' } }))
    await act(async () => { await result.current.handleSave() })

    expect(profileService.updateProfile).toHaveBeenCalledWith('Nguyễn Văn Duy', '0912345678')
    expect(result.current.info.firstName).toBe('Nguyễn Văn')
    expect(result.current.editing).toBe(false)
    expect(result.current.saved).toBe(true)
    expect(onProfileUpdate).toHaveBeenCalled()

    await act(async () => { await vi.advanceTimersByTimeAsync(2500) })
    expect(result.current.saved).toBe(false)

    vi.useRealTimers()
  })

  it('handleSave: hiện alert khi lưu thất bại', async () => {
    profileService.updateProfile.mockRejectedValue(new Error('Email đã tồn tại'))
    const { result } = renderHook(() => useAccountSection({ profile: PROFILE, onProfileUpdate: vi.fn() }))

    await act(async () => { await result.current.handleSave() })

    expect(window.alert).toHaveBeenCalledWith('Email đã tồn tại')
  })

  it('handleCancel: revert draft về info, không giữ thay đổi chưa lưu', () => {
    const { result } = renderHook(() => useAccountSection({ profile: PROFILE, onProfileUpdate: vi.fn() }))
    act(() => result.current.handleChangeField('firstName')({ target: { value: 'Thay đổi' } }))
    expect(result.current.draft.firstName).toBe('Thay đổi')

    act(() => result.current.handleCancel())

    expect(result.current.draft.firstName).toBe('Nguyễn Đức')
    expect(result.current.editing).toBe(false)
  })

  it('handleSavePw: báo lỗi khi thiếu mật khẩu hiện tại', () => {
    const { result } = renderHook(() => useAccountSection({ profile: PROFILE, onProfileUpdate: vi.fn() }))
    act(() => result.current.handleSavePw())
    expect(result.current.pwError).toBe('Vui lòng nhập mật khẩu hiện tại.')
  })

  it('handleSavePw: báo lỗi khi mật khẩu mới ngắn hơn 8 ký tự', () => {
    const { result } = renderHook(() => useAccountSection({ profile: PROFILE, onProfileUpdate: vi.fn() }))
    act(() => result.current.setPwField('current')({ target: { value: 'old12345' } }))
    act(() => result.current.setPwField('next')({ target: { value: '123' } }))
    act(() => result.current.handleSavePw())
    expect(result.current.pwError).toBe('Mật khẩu mới phải có ít nhất 8 ký tự.')
  })

  it('handleSavePw: báo lỗi khi xác nhận không khớp', () => {
    const { result } = renderHook(() => useAccountSection({ profile: PROFILE, onProfileUpdate: vi.fn() }))
    act(() => result.current.setPwField('current')({ target: { value: 'old12345' } }))
    act(() => result.current.setPwField('next')({ target: { value: 'newpass123' } }))
    act(() => result.current.setPwField('confirm')({ target: { value: 'khac123456' } }))
    act(() => result.current.handleSavePw())
    expect(result.current.pwError).toBe('Mật khẩu xác nhận không khớp.')
  })

  it('handleSavePw: thành công thì xoá form và tự đóng section sau 2s', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useAccountSection({ profile: PROFILE, onProfileUpdate: vi.fn() }))
    act(() => result.current.setPwSection(true))
    act(() => result.current.setPwField('current')({ target: { value: 'old12345' } }))
    act(() => result.current.setPwField('next')({ target: { value: 'newpass123' } }))
    act(() => result.current.setPwField('confirm')({ target: { value: 'newpass123' } }))

    act(() => result.current.handleSavePw())

    expect(result.current.pwSaved).toBe(true)
    expect(result.current.pw).toEqual({ current: '', next: '', confirm: '' })

    await act(async () => { await vi.advanceTimersByTimeAsync(2000) })
    expect(result.current.pwSaved).toBe(false)
    expect(result.current.pwSection).toBe(false)

    vi.useRealTimers()
  })

  it('strength: tính đúng độ mạnh mật khẩu mới (0-4 theo độ dài/hoa/số/ký tự đặc biệt)', () => {
    const { result } = renderHook(() => useAccountSection({ profile: PROFILE, onProfileUpdate: vi.fn() }))
    expect(result.current.strength).toBe(0)

    act(() => result.current.setPwField('next')({ target: { value: 'abcdefgh' } }))
    expect(result.current.strength).toBe(1)

    act(() => result.current.setPwField('next')({ target: { value: 'Abcdefg1!' } }))
    expect(result.current.strength).toBe(4)
  })

  it('handleAvatarSelect: lưu vào localStorage theo email và cập nhật avatarSrc', () => {
    const { result } = renderHook(() => useAccountSection({ profile: PROFILE, onProfileUpdate: vi.fn() }))

    act(() => result.current.handleAvatarSelect('avatar-2.png'))

    expect(localStorage.getItem('customer_avatar_duy@example.com')).toBe('avatar-2.png')
    expect(result.current.avatarSrc).toBe('avatar-2.png')
  })
})
