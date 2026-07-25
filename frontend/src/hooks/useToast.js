import { useCallback, useState } from 'react'

// Toast message tự ẩn sau `defaultDuration` ms; có thể override thời gian riêng cho từng lần gọi.
export function useToast(defaultDuration = 3200) {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg, duration = defaultDuration) => {// Hiển thị thông báo toast với nội dung msg và thời gian hiển thị duration (mặc định là defaultDuration)
    setToast(msg)
    setTimeout(() => setToast(null), duration) // Tự động ẩn thông báo sau khoảng thời gian duration
  }, [defaultDuration])

  return { toast, showToast }
}
