import { describe, it, expect } from 'vitest'
import { validateEmail, validatePhone } from './validators'
// validateEmail: nhóm các test liên quan đến hàm validateEmail, kiểm tra việc xác thực email hợp lệ và từ chối các email không hợp lệ.
describe('validateEmail', () => {
  it('chấp nhận email hợp lệ', () => {
    expect(validateEmail('user@example.com')).toBe(true)
  })

  it('từ chối email thiếu @', () => {
    expect(validateEmail('userexample.com')).toBe(false)
  })

  it('từ chối email thiếu domain', () => {
    expect(validateEmail('user@')).toBe(false)
  })

  it('từ chối email chứa khoảng trắng', () => {
    expect(validateEmail('user @example.com')).toBe(false)
  })
})
// validatePhone: nhóm các test liên quan đến hàm validatePhone, kiểm tra việc xác thực số điện thoại Việt Nam hợp lệ và từ chối các số điện thoại không hợp lệ.    
describe('validatePhone', () => {
  it('chấp nhận số điện thoại VN hợp lệ bắt đầu bằng 0', () => {
    expect(validatePhone('0912345678')).toBe(true)
  })

  it('chấp nhận số điện thoại VN hợp lệ bắt đầu bằng 84', () => {
    expect(validatePhone('84912345678')).toBe(true)
  })

  it('từ chối số điện thoại quá ngắn', () => {
    expect(validatePhone('091234')).toBe(false)
  })

  it('từ chối số điện thoại có đầu số không hợp lệ', () => {
    expect(validatePhone('0212345678')).toBe(false)
  })
})
