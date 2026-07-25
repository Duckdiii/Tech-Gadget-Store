import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useStaffProfile } from './useStaffProfile'
import { staffProfileService } from '../services/staffProfileService'

vi.mock('../services/staffProfileService', () => ({
  staffProfileService: {
    getMyProfile: vi.fn(),
    changePassword: vi.fn(),
  },
}))

const USER = { name: 'Trần Thị Bích', email: 'bich@techstore.vn', role: 'staff' }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useStaffProfile', () => {
  it('dùng dữ liệu từ server (dto) khi tải thành công, tính đúng initials từ 2 từ cuối', async () => {
    staffProfileService.getMyProfile.mockResolvedValue({
      fullName: 'Trần Thị Bích', email: 'bich@techstore.vn', role: 'STAFF',
      staffCode: 'NV001', hireDate: '2024-01-01T00:00:00Z', lastLoginAt: '2026-01-01T08:00:00Z',
    })
    const { result } = renderHook(() => useStaffProfile(USER))
    await waitFor(() => expect(result.current.profileLoading).toBe(false))

    expect(result.current.profile.name).toBe('Trần Thị Bích')
    expect(result.current.profile.initials).toBe('TB')
    expect(result.current.profile.role).toBe('Nhân viên kho')
    expect(result.current.profile.staffCode).toBe('NV001')
  })

  it('fallback sang thông tin user khi API lỗi (dto vẫn null)', async () => {
    staffProfileService.getMyProfile.mockRejectedValue(new Error('Server lỗi'))
    const { result } = renderHook(() => useStaffProfile(USER))
    await waitFor(() => expect(result.current.profileLoading).toBe(false))

    expect(result.current.profile.name).toBe('Trần Thị Bích')
    expect(result.current.profile.email).toBe('bich@techstore.vn')
    expect(result.current.profile.staffCode).toBeNull()
  })

  it('handleChangePwd: validate báo đủ lỗi khi form không hợp lệ', async () => {
    staffProfileService.getMyProfile.mockResolvedValue({})
    const { result } = renderHook(() => useStaffProfile(USER))
    await waitFor(() => expect(result.current.profileLoading).toBe(false))
    act(() => result.current.setPwdForm({ current: '', next: '123', confirm: '456' }))

    await act(async () => { await result.current.handleChangePwd() })

    expect(result.current.pwdErrors).toEqual({
      current: 'Vui lòng nhập mật khẩu hiện tại',
      next: 'Mật khẩu mới tối thiểu 8 ký tự',
      confirm: 'Mật khẩu xác nhận không khớp',
    })
    expect(staffProfileService.changePassword).not.toHaveBeenCalled()
  })

  it('handleChangePwd: thành công thì reset form và tự tắt banner sau 4s', async () => {
    vi.useFakeTimers()
    staffProfileService.getMyProfile.mockResolvedValue({})
    staffProfileService.changePassword.mockResolvedValue(null)
    const { result } = renderHook(() => useStaffProfile(USER))
    await act(async () => { await vi.advanceTimersByTimeAsync(0) }) // flush getMyProfile
    act(() => result.current.setPwdForm({ current: 'old12345', next: 'new12345', confirm: 'new12345' }))

    await act(async () => { await result.current.handleChangePwd() })

    expect(staffProfileService.changePassword).toHaveBeenCalledWith({ current: 'old12345', next: 'new12345' })
    expect(result.current.pwdSuccess).toBe(true)
    expect(result.current.pwdForm).toEqual({ current: '', next: '', confirm: '' })

    await act(async () => { await vi.advanceTimersByTimeAsync(4000) })
    expect(result.current.pwdSuccess).toBe(false)

    vi.useRealTimers()
  })

  it('handleChangePwd: hiện lỗi submit khi API thất bại', async () => {
    staffProfileService.getMyProfile.mockResolvedValue({})
    staffProfileService.changePassword.mockRejectedValue(new Error('Mật khẩu hiện tại không đúng'))
    const { result } = renderHook(() => useStaffProfile(USER))
    await waitFor(() => expect(result.current.profileLoading).toBe(false))
    act(() => result.current.setPwdForm({ current: 'old12345', next: 'new12345', confirm: 'new12345' }))

    await act(async () => { await result.current.handleChangePwd() })

    expect(result.current.pwdErrors.submit).toBe('Mật khẩu hiện tại không đúng')
  })

  it('toggleShow: đổi đúng trạng thái ẩn/hiện của từng field', async () => {
    staffProfileService.getMyProfile.mockResolvedValue({})
    const { result } = renderHook(() => useStaffProfile(USER))
    await waitFor(() => expect(result.current.profileLoading).toBe(false))

    act(() => result.current.toggleShow('next'))

    expect(result.current.showPwd).toEqual({ current: false, next: true, confirm: false })
  })
})
