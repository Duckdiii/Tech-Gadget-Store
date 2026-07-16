import { useState, useEffect, useCallback } from 'react'
import { reviewService } from '../services/reviewService'

export function useProductReviews(productId) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchReviews = useCallback(() => {
    if (!productId) return
    setLoading(true)
    reviewService.getProductReviews(productId, 0, 20)
      .then(data => setReviews(data.content ?? []))
      .catch(err => console.error('Lỗi tải đánh giá:', err))
      .finally(() => setLoading(false))
  }, [productId])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  const submitReview = async (content, rating) => {
    setSubmitting(true)
    setError('')
    try {
      await reviewService.createReview(productId, content, rating)
      fetchReviews()
      return true
    } catch (err) {
      setError(err.message || 'Không gửi được đánh giá.')
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const removeReview = async (reviewId) => {
    try {
      await reviewService.deleteReview(reviewId)
      setReviews(rs => rs.filter(r => r.id !== reviewId))
    } catch (err) {
      alert(err.message || 'Không xoá được đánh giá.')
    }
  }

  const averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : null

  return { reviews, loading, submitting, error, submitReview, removeReview, averageRating }
}
