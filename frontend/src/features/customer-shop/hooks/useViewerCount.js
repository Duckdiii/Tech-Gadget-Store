import { useEffect, useState } from 'react'
import { shopService } from '../services/shopService'

const VISITOR_ID_KEY = 'visitorId'
const POLL_INTERVAL_MS = 20000

function getVisitorId() {
  let visitorId = sessionStorage.getItem(VISITOR_ID_KEY)
  if (!visitorId) {
    visitorId = crypto.randomUUID()
    sessionStorage.setItem(VISITOR_ID_KEY, visitorId)
  }
  return visitorId
}

export function useViewerCount(productId) {
  const [viewerCount, setViewerCount] = useState(0)

  useEffect(() => {
    if (!productId) return

    const visitorId = getVisitorId()
    let cancelled = false

    const poll = async () => {
      try {
        const data = await shopService.getViewerCount(productId, visitorId)
        if (!cancelled) setViewerCount(data.count)
      } catch (e) {
        console.error('Lỗi tải số người đang xem:', e)
      }
    }

    poll()
    const intervalId = setInterval(poll, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [productId])

  return { viewerCount }
}
