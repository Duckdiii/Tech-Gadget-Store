import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAddressSection } from './useAddressSection'
import { profileService } from '../services/profileService'

vi.mock('../services/profileService', () => ({
  profileService: {
    getAddresses: vi.fn(),
    addAddress: vi.fn(),
    updateAddress: vi.fn(),
    deleteAddress: vi.fn(),
  },
}))

const PROFILE = { fullName: 'Nguyễn Đức Duy', phone: '0912345678' }
const RAW_ADDRESSES = [
  { id: 'a1', province: 'HCM', district: 'Q1', ward: 'P1', street: '123 Lê Lợi', type: 'home', isDefault: true },
]

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(window, 'alert').mockImplementation(() => {})
})

async function setupWithData() {
  profileService.getAddresses.mockResolvedValue(RAW_ADDRESSES)
  const { result } = renderHook(() => useAddressSection({ profile: PROFILE }))
  await waitFor(() => expect(result.current.loading).toBe(false))
  return result
}

describe('useAddressSection', () => {
  it('tải và map đúng địa chỉ, dùng tên/sđt profile làm mặc định khi địa chỉ không có', async () => {
    const result = await setupWithData()

    expect(result.current.addresses).toEqual([{
      id: 'a1', name: 'Nguyễn Đức Duy', phone: '0912345678',
      province: 'HCM', district: 'Q1', ward: 'P1', detail: '123 Lê Lợi',
      type: 'home', isDefault: true,
    }])
  })

  it('handleSave (modal="add"): gọi addAddress, hiện toast, tải lại và đóng modal', async () => {
    const result = await setupWithData()
    profileService.addAddress.mockResolvedValue(null)
    act(() => result.current.setModal('add'))

    const form = { detail: '456 Nguyễn Huệ', ward: 'P2', district: 'Q3', province: 'HCM', name: 'Duy', phone: '0900000000', type: 'office', isDefault: false }
    await act(async () => { await result.current.handleSave(form) })

    expect(profileService.addAddress).toHaveBeenCalledWith({
      street: '456 Nguyễn Huệ', ward: 'P2', district: 'Q3', province: 'HCM',
      name: 'Duy', phone: '0900000000', type: 'office', isDefault: false,
    })
    expect(result.current.toast).toBe('Thêm địa chỉ thành công!')
    expect(result.current.modal).toBeNull()
  })

  it('handleSave (modal={editId}): gọi updateAddress đúng id', async () => {
    const result = await setupWithData()
    profileService.updateAddress.mockResolvedValue(null)
    act(() => result.current.setModal({ editId: 'a1' }))

    const form = { detail: '789 Trần Hưng Đạo', ward: 'P3', district: 'Q5', province: 'HCM', name: 'Duy', phone: '0911111111', type: 'home', isDefault: true }
    await act(async () => { await result.current.handleSave(form) })

    expect(profileService.updateAddress).toHaveBeenCalledWith('a1', expect.objectContaining({ street: '789 Trần Hưng Đạo' }))
    expect(result.current.toast).toBe('Cập nhật địa chỉ thành công!')
  })

  it('handleSave: hiện alert khi lưu thất bại', async () => {
    const result = await setupWithData()
    profileService.addAddress.mockRejectedValue(new Error('Địa chỉ không hợp lệ'))
    act(() => result.current.setModal('add'))

    await act(async () => {
      await result.current.handleSave({ detail: '', ward: '', district: '', province: '', name: '', phone: '', type: 'home', isDefault: false })
    })

    expect(window.alert).toHaveBeenCalledWith('Địa chỉ không hợp lệ')
  })

  it('handleDelete: gọi deleteAddress, hiện toast, tải lại và bỏ chọn deletingId', async () => {
    const result = await setupWithData()
    profileService.deleteAddress.mockResolvedValue(null)
    act(() => result.current.setDeletingId('a1'))

    await act(async () => { await result.current.handleDelete('a1') })

    expect(profileService.deleteAddress).toHaveBeenCalledWith('a1')
    expect(result.current.toast).toBe('Đã xoá địa chỉ.')
    expect(result.current.deletingId).toBeNull()
  })

  it('handleSetDefault: gọi updateAddress với isDefault=true, giữ nguyên các field khác', async () => {
    const result = await setupWithData()
    profileService.updateAddress.mockResolvedValue(null)

    await act(async () => { await result.current.handleSetDefault('a1') })

    expect(profileService.updateAddress).toHaveBeenCalledWith('a1', {
      street: '123 Lê Lợi', ward: 'P1', district: 'Q1', province: 'HCM',
      name: 'Nguyễn Đức Duy', phone: '0912345678', type: 'home', isDefault: true,
    })
    expect(result.current.toast).toBe('Đã đặt làm địa chỉ mặc định!')
  })
})
