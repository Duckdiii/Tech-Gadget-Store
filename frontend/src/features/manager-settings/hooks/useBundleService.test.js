import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useBundleService } from './useBundleService'
import { settingsService } from '../services/settingsService'

vi.mock('../services/settingsService', () => ({
  settingsService: {
    getBundleServices: vi.fn(),
    createBundleService: vi.fn(),
    updateBundleService: vi.fn(),
    deleteBundleService: vi.fn(),
  },
}))

const RAW_ITEMS = [
  {
    id: 'b1', name: 'Bảo hành mở rộng', type: 'WARRANTY', description: 'Bảo hành thêm 12 tháng',
    price: 500000, durationMonths: 12, active: true,
  },
]

async function setupWithData() {
  settingsService.getBundleServices.mockResolvedValue(RAW_ITEMS)
  const { result } = renderHook(() => useBundleService())
  await waitFor(() => expect(result.current.loading).toBe(false))
  return result
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useBundleService', () => {
  it('tải và chuẩn hoá danh sách dịch vụ đi kèm', async () => {
    const result = await setupWithData()
    expect(result.current.items).toEqual([{
      id: 'b1', name: 'Bảo hành mở rộng', type: 'WARRANTY', description: 'Bảo hành thêm 12 tháng',
      price: 500000, durationMonths: 12, active: true,
    }])
  })

  it('filtered: lọc theo tên, không phân biệt hoa thường', async () => {
    const result = await setupWithData()
    act(() => result.current.setSearch('bảo hành'))
    expect(result.current.filtered).toHaveLength(1)
    act(() => result.current.setSearch('không tồn tại'))
    expect(result.current.filtered).toHaveLength(0)
  })

  it('validate: báo đủ lỗi khi để trống form (mở panel add)', async () => {
    const result = await setupWithData()
    act(() => result.current.openAdd())

    await act(async () => { await result.current.handleSubmit() })

    expect(result.current.formErrors).toEqual({
      name: 'Vui lòng nhập tên dịch vụ',
      description: 'Vui lòng nhập mô tả',
      price: 'Vui lòng nhập giá hợp lệ',
    })
    expect(settingsService.createBundleService).not.toHaveBeenCalled()
  })

  it('handleSubmit (add): thêm dịch vụ mới vào đầu danh sách', async () => {
    const result = await setupWithData()
    act(() => result.current.openAdd())
    act(() => result.current.setForm({
      ...result.current.form, name: 'Lắp đặt tận nơi', description: 'Hỗ trợ lắp đặt', price: '200000',
    }))
    settingsService.createBundleService.mockResolvedValue({
      id: 'b2', name: 'Lắp đặt tận nơi', type: 'WARRANTY', description: 'Hỗ trợ lắp đặt',
      price: 200000, durationMonths: null, active: true,
    })

    await act(async () => { await result.current.handleSubmit() })

    expect(result.current.items[0].id).toBe('b2')
    expect(result.current.items).toHaveLength(2)
    expect(result.current.panel).toBeNull()
  })

  it('handleSubmit (edit): cập nhật đúng item trong danh sách', async () => {
    const result = await setupWithData()
    act(() => result.current.openEdit(result.current.items[0]))
    act(() => result.current.setForm({ ...result.current.form, price: '600000' }))
    settingsService.updateBundleService.mockResolvedValue({ ...RAW_ITEMS[0], price: 600000 })

    await act(async () => { await result.current.handleSubmit() })

    expect(result.current.items[0].price).toBe(600000)
    expect(settingsService.updateBundleService).toHaveBeenCalledWith('b1', expect.objectContaining({ price: 600000 }))
  })

  it('handleDeactivate: gọi API xoá và set active=false cho item đó', async () => {
    const result = await setupWithData()
    settingsService.deleteBundleService.mockResolvedValue(null)

    await act(async () => { await result.current.handleDeactivate('b1') })

    expect(settingsService.deleteBundleService).toHaveBeenCalledWith('b1')
    expect(result.current.items[0].active).toBe(false)
    expect(result.current.deactivateId).toBeNull()
  })

  it('handleToggleActive: bật lại dịch vụ đã ngừng', async () => {
    const result = await setupWithData()
    const inactiveItem = { ...result.current.items[0], active: false }
    settingsService.updateBundleService.mockResolvedValue({ ...RAW_ITEMS[0], active: true })

    await act(async () => { await result.current.handleToggleActive(inactiveItem) })

    expect(settingsService.updateBundleService).toHaveBeenCalledWith('b1', expect.objectContaining({ active: true }))
    expect(result.current.items[0].active).toBe(true)
  })

  it('handleBulkUpdateActive: cập nhật hàng loạt nhiều dịch vụ cùng lúc', async () => {
    settingsService.getBundleServices.mockResolvedValue([
      { id: 'b1', name: 'A', type: 'WARRANTY', description: 'd', price: 1, durationMonths: 1, active: true },
      { id: 'b2', name: 'B', type: 'WARRANTY', description: 'd', price: 1, durationMonths: 1, active: true },
    ])
    const { result } = renderHook(() => useBundleService())
    await waitFor(() => expect(result.current.loading).toBe(false))
    settingsService.updateBundleService.mockImplementation((id, payload) => Promise.resolve({ id, ...payload }))

    await act(async () => { await result.current.handleBulkUpdateActive(['b1', 'b2'], false) })

    expect(result.current.items.every((x) => x.active === false)).toBe(true)
    expect(settingsService.updateBundleService).toHaveBeenCalledTimes(2)
  })
})
