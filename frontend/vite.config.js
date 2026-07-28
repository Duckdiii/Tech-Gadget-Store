import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()], 
  server: {
    //Chỉ áp dụng khi chạy npm run dev
    proxy: {
      '/api': 'http://localhost:8080',//mọi request frontend gọi tới /api sẽ được chuyển tiếp tới backend (http://localhost:8080)
      // ws: true — Vite proxy không tự nâng cấp kết nối WebSocket nếu không khai báo rõ.
      '/ws': { target: 'http://localhost:8080', ws: true },//mọi request frontend gọi tới /ws sẽ được chuyển tiếp tới backend (http://localhost:8080) và hỗ trợ WebSocket
    },
  },
  //Cấu hình Vitest
  test: {
    environment: 'jsdom', //Sử dụng môi trường jsdom để mô phỏng DOM trong quá trình test
    setupFiles: './src/test/setup.js',//Chỉ định file setup.js để thiết lập môi trường test trước khi chạy các test case
    // e2e/ dùng @playwright/test (API test/expect khác hoàn toàn, chạy trình duyệt thật) —
    // loại khỏi phạm vi Vitest để không bị quét nhầm.
    exclude: ['**/node_modules/**', '**/e2e/**'],
  },
})
