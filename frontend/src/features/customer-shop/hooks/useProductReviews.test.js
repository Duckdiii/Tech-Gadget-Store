import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useProductReviews } from './useProductReviews'
import { reviewService } from '../services/reviewService'

vi.mock('../services/reviewService', () => ({
  reviewService: {
    getProductReviews: vi.fn(),
    createReview: vi.fn(),
    deleteReview: vi.fn(),
  },
}))

const REVIEWS_PAGE = {
  content: [
    { id: 'r1', content: 'Tốt', rating: 5 },
    { id: 'r2', content: 'Ổn', rating: 3 },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(window, 'alert').mockImplementation(() => {})
})

describe('useProductReviews', () => {
  it('tải review theo productId và tính đúng điểm trung bình', async () => {
    reviewService.getProductReviews.mockResolvedValue(REVIEWS_PAGE)
    const { result } = renderHook(() => useProductReviews('p1'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(reviewService.getProductReviews).toHaveBeenCalledWith('p1', 0, 20)
    expect(result.current.reviews).toEqual(REVIEWS_PAGE.content)
    expect(result.current.averageRating).toBe(4)
  })

  it('không có productId: tắt loading ngay, không gọi API, averageRating là null', async () => {
    const { result } = renderHook(() => useProductReviews(undefined))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(reviewService.getProductReviews).not.toHaveBeenCalled()
    expect(result.current.averageRating).toBeNull()
  })

  it('submitReview: thành công thì tải lại review và trả về true', async () => {
    reviewService.getProductReviews.mockResolvedValue(REVIEWS_PAGE)
    reviewService.createReview.mockResolvedValue(null)
    const { result } = renderHook(() => useProductReviews('p1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    reviewService.getProductReviews.mockClear()

    let ok
    await act(async () => { ok = await result.current.submitReview('Rất tốt', 5) })

    expect(reviewService.createReview).toHaveBeenCalledWith('p1', 'Rất tốt', 5)
    expect(reviewService.getProductReviews).toHaveBeenCalledTimes(1) // tải lại
    expect(ok).toBe(true)
    expect(result.current.submitting).toBe(false)
  })

  it('submitReview: thất bại thì set error và trả về false', async () => {
    reviewService.getProductReviews.mockResolvedValue(REVIEWS_PAGE)
    reviewService.createReview.mockRejectedValue(new Error('Bạn đã đánh giá sản phẩm này rồi'))
    const { result } = renderHook(() => useProductReviews('p1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    let ok
    await act(async () => { ok = await result.current.submitReview('spam', 1) })

    expect(result.current.error).toBe('Bạn đã đánh giá sản phẩm này rồi')
    expect(ok).toBe(false)
  })

  it('removeReview: thành công thì xoá khỏi danh sách hiện tại', async () => {
    reviewService.getProductReviews.mockResolvedValue(REVIEWS_PAGE)
    reviewService.deleteReview.mockResolvedValue(null)
    const { result } = renderHook(() => useProductReviews('p1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { await result.current.removeReview('r1') })

    expect(reviewService.deleteReview).toHaveBeenCalledWith('r1')
    expect(result.current.reviews.map((r) => r.id)).toEqual(['r2'])
  })

  it('removeReview: thất bại thì hiện alert, không xoá khỏi danh sách', async () => {
    reviewService.getProductReviews.mockResolvedValue(REVIEWS_PAGE)
    reviewService.deleteReview.mockRejectedValue(new Error('Không có quyền xoá'))
    const { result } = renderHook(() => useProductReviews('p1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { await result.current.removeReview('r1') })

    expect(window.alert).toHaveBeenCalledWith('Không có quyền xoá')
    expect(result.current.reviews).toHaveLength(2)
  })
})
