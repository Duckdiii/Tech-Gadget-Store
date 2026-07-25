import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAccountManagement } from './useAccountManagement'
import { managerUsersService } from '../services/managerUsersService'

vi.mock('../services/managerUsersService', () => ({
  managerUsersService: {
    getAccounts: vi.fn(),
    blockAccount: vi.fn(),
    unblockAccount: vi.fn(),
    deleteAccount: vi.fn(),
  },
}))

const RAW_ACCOUNTS = [
  { id: 'a1', email: 'duy@techstore.vn', status: 'ACTIVE', role: 'MANAGER', createdAt: '2026-01-01T00:00:00Z', loginLogsIds: ['l1', 'l2'] },
  { id: 'a2', email: 'bich@techstore.vn', status: 'BLOCKED', role: 'STAFF', createdAt: '2026-02-01T00:00:00Z' },
]

async function setupWithData() {
  managerUsersService.getAccounts.mockResolvedValue(RAW_ACCOUNTS)
  const { result } = renderHook(() => useAccountManagement())
  await waitFor(() => expect(result.current.loading).toBe(false))
  return result
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useAccountManagement', () => {
  it('tải và chuẩn hoá tài khoản, tính đúng total/active/blocked', async () => {
    const result = await setupWithData()

    expect(result.current.accounts).toHaveLength(2)
    expect(result.current.accounts[0]).toMatchObject({ id: 'a1', status: 'active', username: 'duy', loginCount: 2 })
    expect(result.current.total).toBe(2)
    expect(result.current.active).toBe(1)
    expect(result.current.blocked).toBe(1)
  })

  it('filtered: kết hợp đúng statusFilter và roleFilter', async () => {
    const result = await setupWithData()

    act(() => result.current.setStatusFilter('blocked'))
    expect(result.current.filtered.map((a) => a.id)).toEqual(['a2'])

    act(() => result.current.setStatusFilter(''))
    act(() => result.current.setRoleFilter('MANAGER'))
    expect(result.current.filtered.map((a) => a.id)).toEqual(['a1'])
  })

  it('handleBlock: gọi API và cập nhật trạng thái đúng tài khoản', async () => {
    const result = await setupWithData()
    managerUsersService.blockAccount.mockResolvedValue({ status: 'BLOCKED' })

    await act(async () => { await result.current.handleBlock('a1') })

    expect(managerUsersService.blockAccount).toHaveBeenCalledWith('a1')
    expect(result.current.accounts.find((a) => a.id === 'a1').status).toBe('blocked')
    expect(result.current.toast).toBe('Đã khoá tài khoản')
  })

  it('handleUnblock: gọi API và cập nhật trạng thái đúng tài khoản', async () => {
    const result = await setupWithData()
    managerUsersService.unblockAccount.mockResolvedValue({ status: 'ACTIVE' })

    await act(async () => { await result.current.handleUnblock('a2') })

    expect(result.current.accounts.find((a) => a.id === 'a2').status).toBe('active')
    expect(result.current.toast).toBe('Đã mở khoá tài khoản')
  })

  it('handleDelete: xoá khỏi danh sách sau khi API thành công', async () => {
    const result = await setupWithData()
    managerUsersService.deleteAccount.mockResolvedValue(null)

    await act(async () => { await result.current.handleDelete('a1') })

    expect(result.current.accounts.map((a) => a.id)).toEqual(['a2'])
    expect(result.current.toast).toBe('Đã xoá tài khoản')
  })

  it('handleBlock: hiện toast lỗi khi API thất bại', async () => {
    const result = await setupWithData()
    managerUsersService.blockAccount.mockRejectedValue(new Error('Không có quyền'))

    await act(async () => { await result.current.handleBlock('a1') })

    expect(result.current.toast).toBe('Lỗi: Không có quyền')
  })
})
