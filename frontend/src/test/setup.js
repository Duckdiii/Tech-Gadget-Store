import { afterEach } from 'vitest' //Import hàm afterEach từ Vitest để thực hiện các hành động sau mỗi test case
import { cleanup } from '@testing-library/react'//Import hàm cleanup từ @testing-library/react để dọn dẹp DOM sau mỗi test case, tránh rò rỉ dữ liệu giữa các test case
import '@testing-library/jest-dom/vitest'//Import các matcher tùy chỉnh từ @testing-library/jest-dom để sử dụng trong Vitest, giúp viết các assertion dễ đọc hơn

afterEach(() => {
  cleanup()
})
