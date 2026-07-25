import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useMembershipSection } from './useMembershipSection'
import { profileService } from '../services/profileService'

vi.mock('../services/profileService', () => ({
  profileService: {
    getMembership: vi.fn(),
    getMembershipTiers: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useMembershipSection', () => {
  it('tải song song membership + danh sách tier, set đúng cả hai', async () => {
    profileService.getMembership.mockResolvedValue({ tier: 'GOLD', points: 1200 })
    profileService.getMembershipTiers.mockResolvedValue([{ id: 'GOLD' }, { id: 'SILVER' }])

    const { result } = renderHook(() => useMembershipSection())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.data).toEqual({ tier: 'GOLD', points: 1200 })
    expect(result.current.tiers).toEqual([{ id: 'GOLD' }, { id: 'SILVER' }])
    expect(result.current.error).toBeNull()
  })

  it('lỗi 1 trong 2 API: set error và tắt loading', async () => {
    profileService.getMembership.mockRejectedValue(new Error('Không tải được hạng thành viên'))
    profileService.getMembershipTiers.mockResolvedValue([])

    const { result } = renderHook(() => useMembershipSection())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Không tải được hạng thành viên')
    expect(result.current.data).toBeNull()
  })
})
