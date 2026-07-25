import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useRecommendationExperiment } from './useRecommendationExperiment'
import { analyticsService } from '../services/analyticsService'

vi.mock('../services/analyticsService', () => ({
  analyticsService: { getRecommendationExperimentSummary: vi.fn() },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useRecommendationExperiment', () => {
  it('tải và trả về dữ liệu tổng hợp A/B test', async () => {
    analyticsService.getRecommendationExperimentSummary.mockResolvedValue([{ variant: 'MF', clicks: 10 }])
    const { result } = renderHook(() => useRecommendationExperiment())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual([{ variant: 'MF', clicks: 10 }])
  })

  it('lỗi API: không crash, giữ data rỗng', async () => {
    analyticsService.getRecommendationExperimentSummary.mockRejectedValue(new Error('Server lỗi'))
    const { result } = renderHook(() => useRecommendationExperiment())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual([])
  })
})
