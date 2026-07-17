import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { managerUsersService } from '../services/managerUsersService'

export function useCustomerDetail() {
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')

  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDetail = useCallback(() => {
    if (!id) {
      setLoading(false)
      setError('Thiếu mã khách hàng.')
      return
    }
    setLoading(true)
    setError(null)
    managerUsersService.getCustomerById(id)
      .then(setCustomer)
      .catch((e) => setError(e.message || 'Không tải được thông tin khách hàng.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  return { customer, loading, error }
}
