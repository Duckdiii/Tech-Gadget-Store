import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useStaffLogs } from './useStaffLogs'
import { staffInventoryService } from '../services/staffInventoryService'

vi.mock('../services/staffInventoryService', () => ({
  staffInventoryService: { getWarehouseLogs: vi.fn() },
}))

const LOGS = [
  {
    logId: 'l1', type: 'IMPORT', createdTime: '2026-01-01T00:00:00Z',
    performedBy: 'user-stf-01', status: 'DONE', noteOrReason: 'NCC Apple; ghi chú',
    productName: 'iPhone 15', productDetails: '128GB/Đen', quantity: 2, price: 20000000,
  },
  {
    logId: 'l2', type: 'EXPORT', createdTime: '2026-01-02T00:00:00Z',
    performedBy: 'user-stf-02', status: 'DONE', noteOrReason: 'Khách Bích; giao tận nơi',
    productName: 'iPad', productDetails: '64GB', quantity: 1, price: 10000000,
  },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useStaffLogs', () => {
  it('tải và nhóm đúng log theo loại IMPORT/EXPORT, map tên nhân viên từ STAFF_NAMES', async () => {
    staffInventoryService.getWarehouseLogs.mockResolvedValue(LOGS)
    const { result } = renderHook(() => useStaffLogs())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.importFiltered).toHaveLength(1)
    expect(result.current.importFiltered[0]).toMatchObject({
      id: 'l1', supplier: 'NCC Apple', staff: 'Trần Thị Bích', total: 40000000,
    })
    expect(result.current.exportFiltered).toHaveLength(1)
    expect(result.current.exportFiltered[0]).toMatchObject({
      id: 'l2', recipient: 'Khách Bích', staff: 'Lê Hoàng Cường', total: 10000000,
    })
  })

  it('search lọc đúng theo id hoặc tên nhà cung cấp/người nhận, áp dụng riêng cho từng tab', async () => {
    staffInventoryService.getWarehouseLogs.mockResolvedValue(LOGS)
    const { result } = renderHook(() => useStaffLogs())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.setSearch('apple'))

    expect(result.current.importFiltered).toHaveLength(1)
    expect(result.current.exportFiltered).toHaveLength(0) // 'apple' không khớp gì bên export
  })

  it('lỗi API: tắt loading, giữ danh sách rỗng, không crash', async () => {
    staffInventoryService.getWarehouseLogs.mockRejectedValue(new Error('Server lỗi'))
    const { result } = renderHook(() => useStaffLogs())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.importFiltered).toEqual([])
    expect(result.current.exportFiltered).toEqual([])
  })
})
