import { useState, useEffect, useCallback } from 'react'
import { analyticsService } from '../services/analyticsService'

export function useRecommendationExperiment() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true)
      const res = await analyticsService.getRecommendationExperimentSummary()
      setData(res ?? [])
    } catch (e) {
      console.error('Lỗi tải báo cáo A/B test gợi ý:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  return { data, loading, fetchSummary }
}
