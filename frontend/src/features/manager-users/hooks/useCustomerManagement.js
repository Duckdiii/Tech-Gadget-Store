import { useState, useEffect, useCallback } from 'react'
import { managerUsersService } from '../services/managerUsersService'

const PAGE_SIZE = 10

function toLocalISOString(date) {
  const tzoffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzoffset).toISOString().slice(0, -1);
}

export function useCustomerManagement() {
  const [search, setSearchState] = useState('')
  const [tierFilter, setTierFilterState] = useState('')
  const [joinDateRange, setJoinDateRangeState] = useState('')
  const [customStartDate, setCustomStartDateState] = useState('')
  const [customEndDate, setCustomEndDateState] = useState('')
  const [spendFilter, setSpendFilterState] = useState('')
  const [onlyRepeat, setOnlyRepeatState] = useState(false)
  const [sortBy, setSortByState] = useState('createdAt')
  const [sortDir, setSortDirState] = useState('desc')
  const [page, setPage] = useState(0) // 0-based, matches Spring's Pageable
  const [data, setData] = useState({ items: [], totalElements: 0, totalPages: 0 })
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  // Calculate parameters for query
  let joinStartDate = null
  let joinEndDate = null
  let minSpend = null
  let maxSpend = null

  // Date range mapping
  const now = new Date()
  if (joinDateRange === 'week') {
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
    const startOfWeek = new Date(now.setDate(diff))
    startOfWeek.setHours(0, 0, 0, 0)
    joinStartDate = toLocalISOString(startOfWeek)
    joinEndDate = toLocalISOString(new Date())
  } else if (joinDateRange === 'month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    startOfMonth.setHours(0, 0, 0, 0)
    joinStartDate = toLocalISOString(startOfMonth)
    joinEndDate = toLocalISOString(new Date())
  } else if (joinDateRange === 'custom') {
    if (customStartDate) {
      joinStartDate = customStartDate + 'T00:00:00'
    }
    if (customEndDate) {
      joinEndDate = customEndDate + 'T23:59:59'
    }
  }

  // Spending range mapping
  if (spendFilter === 'zero') {
    minSpend = 0
    maxSpend = 0
  } else if (spendFilter === 'gt10m') {
    minSpend = 10000000
  } else if (spendFilter === 'gt50m') {
    minSpend = 50000000
  }

  const fetchCustomers = useCallback(() => {
    setLoading(true)
    return managerUsersService.getCustomers({ 
      search, 
      tier: tierFilter, 
      joinStartDate, 
      joinEndDate, 
      minSpend, 
      maxSpend, 
      onlyRepeat,
      sortBy,
      sortDir,
      page, 
      size: PAGE_SIZE 
    })
      .then(setData)
      .catch((e) => console.error('Lỗi tải danh sách khách hàng:', e))
      .finally(() => setLoading(false))
  }, [search, tierFilter, joinStartDate, joinEndDate, minSpend, maxSpend, onlyRepeat, sortBy, sortDir, page])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  useEffect(() => {
    managerUsersService.getCustomerStats()
      .then(setStats)
      .catch((e) => console.error('Lỗi tải thống kê khách hàng:', e))
  }, [])

  // Changing the filters should always jump back to page 0
  const setSearch = (value) => { setSearchState(value); setPage(0) }
  const setTierFilter = (value) => { setTierFilterState(value); setPage(0) }
  const setJoinDateRange = (value) => { setJoinDateRangeState(value); setPage(0) }
  const setCustomStartDate = (value) => { setCustomStartDateState(value); setPage(0) }
  const setCustomEndDate = (value) => { setCustomEndDateState(value); setPage(0) }
  const setSpendFilter = (value) => { setSpendFilterState(value); setPage(0) }
  const setOnlyRepeat = (value) => { setOnlyRepeatState(value); setPage(0) }
  const setSortBy = (value) => { setSortByState(value); setPage(0) }
  const setSortDir = (value) => { setSortDirState(value); setPage(0) }

  return {
    search,
    setSearch,
    tierFilter,
    setTierFilter,
    joinDateRange,
    setJoinDateRange,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    spendFilter,
    setSpendFilter,
    onlyRepeat,
    setOnlyRepeat,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    page,
    setPage,
    customers: data.items,
    totalElements: data.totalElements,
    totalPages: data.totalPages,
    stats,
    loading,
    refetch: fetchCustomers,
  }
}
