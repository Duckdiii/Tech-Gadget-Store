import { useState, useEffect, useCallback } from 'react'
import { managerUsersService } from '../services/managerUsersService'

const PAGE_SIZE = 10

export function useCustomerManagement() {
  const [search, setSearchState] = useState('')
  const [tierFilter, setTierFilterState] = useState('')
  const [page, setPage] = useState(0) // 0-based, matches Spring's Pageable
  const [data, setData] = useState({ items: [], totalElements: 0, totalPages: 0 })
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchCustomers = useCallback(() => {
    setLoading(true)
    return managerUsersService.getCustomers({ search, tier: tierFilter, page, size: PAGE_SIZE })
      .then(setData)
      .catch((e) => console.error('Lỗi tải danh sách khách hàng:', e))
      .finally(() => setLoading(false))
  }, [search, tierFilter, page])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  useEffect(() => {
    managerUsersService.getCustomerStats()
      .then(setStats)
      .catch((e) => console.error('Lỗi tải thống kê khách hàng:', e))
  }, [])

  // Changing the search term or tier filter should always jump back to page 0 — batched into
  // the same event handler as the state update itself, rather than a separate effect watching
  // [search, tierFilter], to avoid firing fetchCustomers twice (once with the stale page).
  const setSearch = (value) => { setSearchState(value); setPage(0) }
  const setTierFilter = (value) => { setTierFilterState(value); setPage(0) }

  return {
    search,
    setSearch,
    tierFilter,
    setTierFilter,
    page,
    setPage,
    customers: data.items,
    totalElements: data.totalElements,
    totalPages: data.totalPages,
    stats,
    loading,
  }
}
