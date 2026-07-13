import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
      // ws: true — Vite proxy không tự nâng cấp kết nối WebSocket nếu không khai báo rõ.
      '/ws': { target: 'http://localhost:8080', ws: true },
    },
  },
})
