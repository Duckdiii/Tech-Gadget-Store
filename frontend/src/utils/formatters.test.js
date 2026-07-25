import { describe, it, expect } from 'vitest'
import { formatCurrency, avatarInitials, formatDate } from './formatters'

// formatCurrency: nhóm các test liên quan đến hàm formatCurrency, kiểm tra việc định dạng tiền tệ theo chuẩn Việt Nam và xử lý các giá trị null hoặc undefined.
describe('formatCurrency', () => {
  it('trả về — khi giá trị null hoặc undefined', () => {
    expect(formatCurrency(null)).toBe('—') //  lấy giá trị thực tế phải bằng chính xác  chuỗi '—'
    expect(formatCurrency(undefined)).toBe('—')
  })

  it('định dạng số theo vi-VN và thêm đơn vị đ', () => {
    expect(formatCurrency(1000000)).toBe('1.000.000 đ')
  })

  it('định dạng số 0', () => {
    expect(formatCurrency(0)).toBe('0 đ')
  })
})

// avatarInitials: nhóm các test liên quan đến hàm avatarInitials, kiểm tra việc lấy chữ cái đầu của tên người dùng để hiển thị trong avatar.
describe('avatarInitials', () => {
  it('trả về ? khi tên rỗng hoặc null', () => {
    expect(avatarInitials('')).toBe('?')
    expect(avatarInitials(null)).toBe('?')
  })

  it('lấy chữ cái đầu khi tên có 1 từ', () => {
    expect(avatarInitials('Duy')).toBe('D')
  })

  it('lấy 2 chữ cái đầu của 2 từ cuối khi tên có nhiều từ', () => {
    expect(avatarInitials('Nguyễn Đức Duy')).toBe('ĐD')
  })
})
//  formatDate: nhóm các test liên quan đến hàm formatDate, kiểm tra việc định dạng ngày tháng từ các định dạng khác nhau (mảng, chuỗi ISO) và xử lý các giá trị rỗng hoặc không hợp lệ.
describe('formatDate', () => {
  it('trả về — khi giá trị rỗng', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate(undefined)).toBe('—')
    expect(formatDate('')).toBe('—')
  })

  it('định dạng mảng [năm, tháng, ngày] thành dd/mm/yyyy', () => {
    expect(formatDate([2026, 7, 24])).toBe('24/07/2026')
  })

  it('định dạng chuỗi ISO thành dd/mm/yyyy', () => {
    expect(formatDate('2026-07-24T00:00:00Z')).toMatch(/^\d{2}\/\d{2}\/2026$/)
  })

  it('trả về nguyên giá trị khi ngày không hợp lệ', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date')
  })
})
