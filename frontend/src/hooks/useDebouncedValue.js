import { useState, useEffect } from 'react'

// Hook useDebouncedValue: nhận vào một giá trị và một khoảng thời gian delay, trả về giá trị đã được debounce, nghĩa là chỉ cập nhật giá trị sau khi không có thay đổi trong khoảng thời gian delay.
export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value) // Khởi tạo state debounced với giá trị ban đầu là value

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)// Thiết lập một timer để cập nhật giá trị debounced sau khoảng thời gian delay
    return () => clearTimeout(timer) // Dọn dẹp timer khi component unmount hoặc khi value hoặc delay thay đổi, tránh việc cập nhật state sau khi component đã unmount
  }, [value, delay])

  return debounced
}
