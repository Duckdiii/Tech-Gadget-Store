import { test as setup, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'

// Đăng nhập 1 LẦN DUY NHẤT rồi lưu lại session (localStorage chứa JWT), các test khác tái sử
// dụng qua storageState — tránh gọi /api/auth/login lặp lại nhiều lần trong 1 lần chạy CI.
// Endpoint này bị giới hạn cứng 5 lần/15 phút mỗi IP (AuthRateLimitFilter), nên gọi càng ít
// càng tốt, đặc biệt khi CI chạy lại nhiều lần liên tiếp lúc debug.
const authFile = 'playwright/.auth/user.json'
const SEED_CUSTOMER = { email: 'seed.customer.1@example.com', password: 'Seed@12345' }

setup('authenticate as seeded customer', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login(SEED_CUSTOMER.email, SEED_CUSTOMER.password)
  await expect(page).toHaveURL('/')

  await page.context().storageState({ path: authFile })
})
