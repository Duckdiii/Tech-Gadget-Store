import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useCustomerManagement } from './useCustomerManagement'
import { managerUsersService } from '../services/managerUsersService'

vi.mock('../services/managerUsersService', () => ({
  managerUsersService: {
    getCustomers: vi.fn(),
    getCustomerStats: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
  managerUsersService.getCustomers.mockResolvedValue({ items: [], totalElements: 0, totalPages: 0 })
  managerUsersService.getCustomerStats.mockResolvedValue({ total: 0 })
})

describe('useCustomerManagement', () => {
  it('tải danh sách khách hàng + thống kê lần đầu', async () => {
    managerUsersService.getCustomers.mockResolvedValue({ items: [{ id: 'c1' }], totalElements: 1, totalPages: 1 })
    const { result } = renderHook(() => useCustomerManagement())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.customers).toEqual([{ id: 'c1' }])
    expect(managerUsersService.getCustomerStats).toHaveBeenCalled()
  })

  it('đổi search thì reset về trang đầu và gọi lại API', async () => {
    const { result } = renderHook(() => useCustomerManagement())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setPage(2))
    managerUsersService.getCustomers.mockClear()

    act(() => result.current.setSearch('duy'))

    await waitFor(() => expect(managerUsersService.getCustomers).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'duy', page: 0 }),
    ))
  })

  it('spendFilter=gt10m: gửi đúng minSpend, không giới hạn maxSpend', async () => {
    const { result } = renderHook(() => useCustomerManagement())
    await waitFor(() => expect(result.current.loading).toBe(false))
    managerUsersService.getCustomers.mockClear()

    act(() => result.current.setSpendFilter('gt10m'))

    await waitFor(() => expect(managerUsersService.getCustomers).toHaveBeenCalledWith(
      expect.objectContaining({ minSpend: 10000000, maxSpend: null }),
    ))
  })

  it('spendFilter=zero: gửi minSpend=0 và maxSpend=0 (khách chưa từng chi tiêu)', async () => {
    const { result } = renderHook(() => useCustomerManagement())
    await waitFor(() => expect(result.current.loading).toBe(false))
    managerUsersService.getCustomers.mockClear()

    act(() => result.current.setSpendFilter('zero'))

    await waitFor(() => expect(managerUsersService.getCustomers).toHaveBeenCalledWith(
      expect.objectContaining({ minSpend: 0, maxSpend: 0 }),
    ))
  })

  it('joinDateRange=custom: gửi đúng khoảng ngày theo customStartDate/customEndDate', async () => {
    const { result } = renderHook(() => useCustomerManagement())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setJoinDateRange('custom'))
    managerUsersService.getCustomers.mockClear()

    act(() => result.current.setCustomStartDate('2026-07-01'))
    act(() => result.current.setCustomEndDate('2026-07-20'))

    await waitFor(() => expect(managerUsersService.getCustomers).toHaveBeenCalledWith(
      expect.objectContaining({
        joinStartDate: '2026-07-01T00:00:00',
        joinEndDate: '2026-07-20T23:59:59',
      }),
    ))
  })
})
