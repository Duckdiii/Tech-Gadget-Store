import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useCustomerDetail } from './useCustomerDetail'
import { managerUsersService } from '../services/managerUsersService'

vi.mock('../services/managerUsersService', () => ({
  managerUsersService: { getCustomerById: vi.fn() },
}))

function makeWrapper(path) {
  return function wrapper({ children }) {
    return <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useCustomerDetail', () => {
  it('thiếu id trên URL: báo lỗi ngay, không gọi API', async () => {
    const { result } = renderHook(() => useCustomerDetail(), { wrapper: makeWrapper('/customers/detail') })

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Thiếu mã khách hàng.')
    expect(managerUsersService.getCustomerById).not.toHaveBeenCalled()
  })

  it('có id: tải đúng thông tin khách hàng', async () => {
    managerUsersService.getCustomerById.mockResolvedValue({ id: 'c1', fullName: 'Nguyễn Đức Duy' })
    const { result } = renderHook(() => useCustomerDetail(), { wrapper: makeWrapper('/customers/detail?id=c1') })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(managerUsersService.getCustomerById).toHaveBeenCalledWith('c1')
    expect(result.current.customer).toEqual({ id: 'c1', fullName: 'Nguyễn Đức Duy' })
  })

  it('lỗi API: set error, giữ customer null', async () => {
    managerUsersService.getCustomerById.mockRejectedValue(new Error('Không tìm thấy khách hàng'))
    const { result } = renderHook(() => useCustomerDetail(), { wrapper: makeWrapper('/customers/detail?id=c1') })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Không tìm thấy khách hàng')
    expect(result.current.customer).toBeNull()
  })
})
