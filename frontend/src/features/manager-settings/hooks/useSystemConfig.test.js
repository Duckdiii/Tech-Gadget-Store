import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSystemConfig } from './useSystemConfig'
import { systemConfigService } from '../services/systemConfigService'

vi.mock('../services/systemConfigService', () => ({
  systemConfigService: {
    getSettings: vi.fn(),
    updateSettings: vi.fn(),
  },
}))

const SETTINGS = {
  storeName: 'TechStore', contactEmail: 'a@techstore.vn', contactPhone: '0900000000',
  address: '123 ABC', allowProductReviews: true,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useSystemConfig', () => {
  it('tải cấu hình cửa hàng lần đầu', async () => {
    systemConfigService.getSettings.mockResolvedValue(SETTINGS)
    const { result } = renderHook(() => useSystemConfig())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.form.storeName).toBe('TechStore')
    expect(result.current.allowReview).toBe(true)
  })

  it('handleSave: lưu thành công thì cập nhật lại form từ response và ghi savedAt', async () => {
    systemConfigService.getSettings.mockResolvedValue(SETTINGS)
    const { result } = renderHook(() => useSystemConfig())
    await waitFor(() => expect(result.current.loading).toBe(false))
    systemConfigService.updateSettings.mockResolvedValue({ ...SETTINGS, storeName: 'TechStore Mới' })

    await act(async () => { await result.current.handleSave() })

    expect(result.current.form.storeName).toBe('TechStore Mới')
    expect(result.current.savedAt).not.toBeNull()
  })

  it('handleSave: hiện lỗi khi lưu thất bại, không ghi savedAt', async () => {
    systemConfigService.getSettings.mockResolvedValue(SETTINGS)
    const { result } = renderHook(() => useSystemConfig())
    await waitFor(() => expect(result.current.loading).toBe(false))
    systemConfigService.updateSettings.mockRejectedValue(new Error('Không có quyền lưu cấu hình'))

    await act(async () => { await result.current.handleSave() })

    expect(result.current.error).toBe('Không có quyền lưu cấu hình')
    expect(result.current.savedAt).toBeNull()
  })

  it('handleCancel: tải lại cấu hình từ server, bỏ thay đổi chưa lưu', async () => {
    systemConfigService.getSettings.mockResolvedValue(SETTINGS)
    const { result } = renderHook(() => useSystemConfig())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.handleChange('storeName')({ target: { value: 'Thay đổi chưa lưu' } }))
    expect(result.current.form.storeName).toBe('Thay đổi chưa lưu')
    systemConfigService.getSettings.mockClear()

    await act(async () => { await result.current.handleCancel() })

    expect(systemConfigService.getSettings).toHaveBeenCalledTimes(1)
    expect(result.current.form.storeName).toBe('TechStore')
  })
})
