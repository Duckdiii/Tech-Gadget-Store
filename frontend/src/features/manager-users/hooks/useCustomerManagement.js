import { useState, useEffect, useCallback, useMemo } from 'react'
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

  // Ngày bắt đầu/kết thúc theo bộ lọc — PHẢI nhớ lại (useMemo) chứ không tính thẳng trong thân
  // component: `new Date()` cho ra 1 mốc thời gian khác nhau ở mỗi lần render, nên nếu tính lại
  // mỗi render thì joinEndDate đổi giá trị liên tục → fetchCustomers (useCallback) đổi identity
  // liên tục → effect gọi lại liên tục → loading nhấp nháy vô hạn khi chọn lọc theo tuần/tháng.
  const { joinStartDate, joinEndDate } = useMemo(() => {
    if (joinDateRange === 'week') {
      const now = new Date()
      const day = now.getDay()
      const diff = now.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
      const startOfWeek = new Date(now)
      startOfWeek.setDate(diff)
      startOfWeek.setHours(0, 0, 0, 0)
      return { joinStartDate: toLocalISOString(startOfWeek), joinEndDate: toLocalISOString(now) }
    }
    if (joinDateRange === 'month') {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      startOfMonth.setHours(0, 0, 0, 0)
      return { joinStartDate: toLocalISOString(startOfMonth), joinEndDate: toLocalISOString(now) }
    }
    if (joinDateRange === 'custom') {
      return {
        joinStartDate: customStartDate ? customStartDate + 'T00:00:00' : null,
        joinEndDate: customEndDate ? customEndDate + 'T23:59:59' : null,
      }
    }
    return { joinStartDate: null, joinEndDate: null }
  }, [joinDateRange, customStartDate, customEndDate])

  // Spending range mapping
  let minSpend = null
  let maxSpend = null
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
