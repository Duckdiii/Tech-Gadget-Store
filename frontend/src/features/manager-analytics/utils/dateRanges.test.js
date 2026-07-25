import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  toISODate,
  todayVsYesterday,
  monthToDateVsPrevious,
  chartPeriodToFilter,
  resolveReportFilterRange,
  previousPeriodOf,
} from './dateRanges'

// Cố định "hôm nay" = Thứ Sáu, 24/07/2026, 10:00 sáng — dùng constructor (year, month, day, ...)
// (không phải chuỗi ISO) để luôn được hiểu là giờ ĐỊA PHƯƠNG trên mọi máy/mọi timezone chạy test,
// tránh test bị flaky do lệch múi giờ giữa máy dev và CI.
const FAKE_NOW = new Date(2026, 6, 24, 10, 0, 0)

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(FAKE_NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('toISODate', () => {
  it('định dạng đúng yyyy-mm-dd, có zero-pad tháng/ngày', () => {
    expect(toISODate(new Date(2026, 6, 5))).toBe('2026-07-05')
    expect(toISODate(new Date(2026, 0, 1))).toBe('2026-01-01')
  })
})

describe('todayVsYesterday', () => {
  it('current = hôm nay, previous = hôm qua', () => {
    expect(todayVsYesterday()).toEqual({
      current: { startDate: '2026-07-24', endDate: '2026-07-24' },
      previous: { startDate: '2026-07-23', endDate: '2026-07-23' },
    })
  })
})

describe('monthToDateVsPrevious', () => {
  it('previous là khoảng có ĐỘ DÀI BẰNG current (không phải nguyên tháng trước)', () => {
    const { current, previous } = monthToDateVsPrevious()

    expect(current).toEqual({ startDate: '2026-07-01', endDate: '2026-07-24' }) // 24 ngày
    expect(previous).toEqual({ startDate: '2026-06-07', endDate: '2026-06-30' }) // cũng 24 ngày
  })
})

describe('chartPeriodToFilter', () => {
  it('week -> WEEKLY, month -> MONTHLY', () => {
    expect(chartPeriodToFilter('week')).toEqual({ period: 'WEEKLY' })
    expect(chartPeriodToFilter('month')).toEqual({ period: 'MONTHLY' })
  })

  it('period khác (vd "year"): trả về CUSTOM từ đầu năm tới hôm nay', () => {
    expect(chartPeriodToFilter('year')).toEqual({
      period: 'CUSTOM', startDate: '2026-01-01', endDate: '2026-07-24',
    })
  })
})

describe('resolveReportFilterRange', () => {
  it('DAILY: chỉ hôm nay', () => {
    expect(resolveReportFilterRange({ period: 'DAILY' })).toEqual({
      startDate: '2026-07-24', endDate: '2026-07-24',
    })
  })

  it('WEEKLY: từ thứ Hai đầu tuần tới hôm nay', () => {
    expect(resolveReportFilterRange({ period: 'WEEKLY' })).toEqual({
      startDate: '2026-07-20', endDate: '2026-07-24', // 20/07/2026 là Thứ Hai
    })
  })

  it('CUSTOM đủ 2 ngày: trả nguyên khoảng đã cho, không tính toán lại', () => {
    expect(resolveReportFilterRange({ period: 'CUSTOM', startDate: '2026-01-05', endDate: '2026-01-10' }))
      .toEqual({ startDate: '2026-01-05', endDate: '2026-01-10' })
  })

  it('CUSTOM thiếu 1 trong 2 ngày: trả về null', () => {
    expect(resolveReportFilterRange({ period: 'CUSTOM', startDate: '2026-01-05' })).toBeNull()
    expect(resolveReportFilterRange({ period: 'CUSTOM' })).toBeNull()
  })

  it('MONTHLY (và mặc định khi không truyền period): từ đầu tháng tới hôm nay', () => {
    expect(resolveReportFilterRange({ period: 'MONTHLY' })).toEqual({
      startDate: '2026-07-01', endDate: '2026-07-24',
    })
    expect(resolveReportFilterRange(undefined)).toEqual({
      startDate: '2026-07-01', endDate: '2026-07-24',
    })
  })
})

describe('previousPeriodOf', () => {
  it('khoảng nhiều ngày: kỳ trước liền kề, cùng độ dài', () => {
    expect(previousPeriodOf({ startDate: '2026-07-01', endDate: '2026-07-24' })) // 24 ngày
      .toEqual({ startDate: '2026-06-07', endDate: '2026-06-30' }) // cũng 24 ngày, khớp với monthToDateVsPrevious
  })

  it('khoảng 1 ngày: kỳ trước là đúng 1 ngày liền trước (giống hôm qua)', () => {
    expect(previousPeriodOf({ startDate: '2026-07-24', endDate: '2026-07-24' }))
      .toEqual({ startDate: '2026-07-23', endDate: '2026-07-23' })
  })
})
