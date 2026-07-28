import { defineConfig, devices } from '@playwright/test'

// E2E_BASE_URL bắt buộc phải set tường minh (không có default) — tránh việc chạy nhầm
// vào production nếu quên set biến môi trường. CI trỏ vào frontend Staging
// (tech-gadget-store-staging.vercel.app), không phải production.
const baseURL = process.env.E2E_BASE_URL
if (!baseURL) {
  throw new Error('E2E_BASE_URL chưa được set — không tự suy ra baseURL để tránh chạy nhầm môi trường.')
}

// Preview Deployment của Vercel bật Deployment Protection (SSO wall) mặc định — cần đính kèm
// header bypass riêng cho automation, xem VERCEL_AUTOMATION_BYPASS_SECRET trong Vercel Settings
// > Deployment Protection > Protection Bypass for Automation.
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
const extraHTTPHeaders = bypassSecret ? { 'x-vercel-protection-bypass': bypassSecret } : undefined

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // retries: 0 có chủ đích — /api/auth/login bị giới hạn cứng 5 lần/15 phút mỗi IP
  // (AuthRateLimitFilter), retry tự động sẽ nhân số lần gọi login lên nhanh chóng.
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    extraHTTPHeaders,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.js/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
})
