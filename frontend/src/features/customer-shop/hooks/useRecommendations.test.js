import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSimilarProducts, useForYouRecommendations } from './useRecommendations'
import { shopService } from '../services/shopService'

vi.mock('../services/shopService', () => ({
  shopService: {
    getSimilarProducts: vi.fn(),
    getForYouRecommendations: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useSimilarProducts (đại diện cho useRecommendationFetcher dùng chung)', () => {
  it('có productId: tải và map qua mapApiProduct', async () => {
    shopService.getSimilarProducts.mockResolvedValue([
      { id: 'p2', name: 'iPhone 15 Pro', minPrice: 25000000, availableCount: 5 },
    ])
    const { result } = renderHook(() => useSimilarProducts('p1'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(shopService.getSimilarProducts).toHaveBeenCalledWith('p1')
    expect(result.current.products).toEqual([expect.objectContaining({
      id: 'p2', name: 'iPhone 15 Pro', price: 25000000, available: true,
    })])
  })

  it('không có productId: không tải, products rỗng', async () => {
    const { result } = renderHook(() => useSimilarProducts(undefined))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(shopService.getSimilarProducts).not.toHaveBeenCalled()
    expect(result.current.products).toEqual([])
  })
})

describe('useForYouRecommendations (shape response khác — {items:[{impressionId, product}]})', () => {
  it('enabled=true: map đúng sản phẩm và giữ lại __impressionId để báo cáo click', async () => {
    shopService.getForYouRecommendations.mockResolvedValue({
      variant: 'MF',
      items: [{ impressionId: 'imp-1', product: { id: 'p3', name: 'iPad', minPrice: 10000000 } }],
    })
    const { result } = renderHook(() => useForYouRecommendations(true))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.products).toEqual([expect.objectContaining({
      id: 'p3', name: 'iPad', price: 10000000, __impressionId: 'imp-1',
    })])
  })

  it('enabled=false: không tải, products rỗng', async () => {
    const { result } = renderHook(() => useForYouRecommendations(false))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(shopService.getForYouRecommendations).not.toHaveBeenCalled()
    expect(result.current.products).toEqual([])
  })
})
