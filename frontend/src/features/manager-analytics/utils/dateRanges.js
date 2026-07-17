function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/** [start, end] inclusive, both as Date at local midnight. */
function daySpan(start, end) {
  return Math.round((end - start) / 86_400_000) + 1
}

/**
 * Today's date range, and the immediately preceding day — used for the "Doanh thu hôm nay" /
 * "Đơn hàng mới" / "Khách hàng mới" KPI cards (today vs. yesterday).
 */
export function todayVsYesterday() {
  const today = new Date()
  const yesterday = addDays(today, -1)
  return {
    current: { startDate: toISODate(today), endDate: toISODate(today) },
    previous: { startDate: toISODate(yesterday), endDate: toISODate(yesterday) },
  }
}

/**
 * Month-to-date range, and the same-length window immediately preceding it (not the whole
 * previous month, so a partial current month is compared against an equally partial window —
 * otherwise growth % would be skewed by comparing e.g. 5 days against 30).
 */
export function monthToDateVsPrevious() {
  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const current = { startDate: toISODate(monthStart), endDate: toISODate(today) }

  const length = daySpan(monthStart, today)
  const prevEnd = addDays(monthStart, -1)
  const prevStart = addDays(prevEnd, -(length - 1))
  const previous = { startDate: toISODate(prevStart), endDate: toISODate(prevEnd) }

  return { current, previous }
}

/** Maps the dashboard's chart period tab to a revenue-report filter payload. */
export function chartPeriodToFilter(chartPeriod) {
  if (chartPeriod === 'week') return { period: 'WEEKLY' }
  if (chartPeriod === 'month') return { period: 'MONTHLY' }
  // Backend has no "YEARLY" period — express "this year" as an explicit custom range.
  const today = new Date()
  const yearStart = new Date(today.getFullYear(), 0, 1)
  return { period: 'CUSTOM', startDate: toISODate(yearStart), endDate: toISODate(today) }
}

export { toISODate }
